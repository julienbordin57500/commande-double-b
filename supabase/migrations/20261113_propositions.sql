-- Menus et devis enregistrés (page Menus) + suivi des envois et relances (Événements, Aujourd'hui). 2026-11-13.
create table if not exists public.propositions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('menu','devis')),
  titre text,                 -- ce qui s'affiche dans la liste
  client text,
  jour date,                  -- date du repas / de l'événement
  montant numeric,            -- menu : prix par personne ; devis : total TTC
  num text,                   -- n° de devis (année-NNN), unique
  data jsonb not null default '{}'::jsonb,
  evenement_id uuid references public.evenements(id) on delete set null,
  statut text not null default 'brouillon' check (statut in ('brouillon','envoye','accepte','refuse')),
  contact text,               -- adresse mail utilisée à l'envoi
  envoye_le timestamptz,
  relance_le timestamptz,     -- prochaine relance à proposer
  cree_par text,
  cree_le timestamptz not null default now(),
  maj timestamptz not null default now()
);
create unique index if not exists propositions_num on public.propositions(num) where num is not null;
create index if not exists propositions_evt on public.propositions(evenement_id);
alter table public.propositions enable row level security;

-- Prochain n° de devis de l'année (2026-001, 2026-002…)
create or replace function public._devis_suivant() returns text language sql stable set search_path to 'public' as $$
  select to_char(now() at time zone 'Europe/Paris','YYYY')||'-'||lpad((coalesce(max(nullif(split_part(num,'-',2),'')::int),0)+1)::text,3,'0')
  from propositions where num ~ ('^'||to_char(now() at time zone 'Europe/Paris','YYYY')||'-\d+$');
$$;

create or replace function public.devis_numero(p_code text) returns text language plpgsql security definer set search_path to 'public' as $$
begin
  if not public._ok(p_code) then raise exception 'code invalide' using errcode = '28000'; end if;
  return public._devis_suivant();
end $$;

-- Liste (sans le contenu complet) ; p_kind null = tout
create or replace function public.propositions_liste(p_code text, p_kind text default null) returns json language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public._ok(p_code) then raise exception 'code invalide' using errcode = '28000'; end if;
  return coalesce((select json_agg(json_build_object('id',id,'kind',kind,'titre',titre,'client',client,'jour',jour,'montant',montant,'num',num,
      'evenement_id',evenement_id,'statut',statut,'contact',contact,'envoye_le',envoye_le,'relance_le',relance_le,'cree_par',cree_par,'maj',maj) order by maj desc)
    from (select * from propositions where p_kind is null or kind = p_kind order by maj desc limit 300) x), '[]'::json);
end $$;

create or replace function public.proposition_lire(p_code text, p_id uuid) returns json language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public._ok(p_code) then raise exception 'code invalide' using errcode = '28000'; end if;
  return (select row_to_json(p) from propositions p where id = p_id);
end $$;

-- Créer (p_id null) ou mettre à jour. Renvoie {id, num}. Un n° déjà pris par un autre devis est remplacé par le suivant.
create or replace function public.proposition_enregistrer(p_code text, p_id uuid, p_kind text, p_champs jsonb) returns json language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid := p_id; v_num text := nullif(trim(p_champs->>'num'),'');
begin
  if not public._ok(p_code) then raise exception 'code invalide' using errcode = '28000'; end if;
  if p_kind = 'devis' then
    if v_num is null or exists (select 1 from propositions where num = v_num and id is distinct from v_id) then v_num := public._devis_suivant(); end if;
  else v_num := null; end if;
  if v_id is null or not exists (select 1 from propositions where id = v_id) then
    insert into propositions(id, kind, titre, client, jour, montant, num, data, evenement_id, cree_par)
    values (coalesce(v_id, gen_random_uuid()), p_kind, p_champs->>'titre', p_champs->>'client', nullif(p_champs->>'jour','')::date,
      nullif(p_champs->>'montant','')::numeric, v_num, coalesce(p_champs->'data','{}'::jsonb),
      (select id from evenements where id = nullif(p_champs->>'evenement_id','')::uuid), p_champs->>'par')
    returning id into v_id;
  else
    update propositions set titre = p_champs->>'titre', client = p_champs->>'client', jour = nullif(p_champs->>'jour','')::date,
      montant = nullif(p_champs->>'montant','')::numeric, num = v_num, data = coalesce(p_champs->'data', data),
      evenement_id = coalesce((select id from evenements where id = nullif(p_champs->>'evenement_id','')::uuid), evenement_id), maj = now()
    where id = v_id;
  end if;
  return json_build_object('id', v_id, 'num', v_num);
end $$;

create or replace function public.proposition_supprimer(p_code text, p_id uuid) returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not public._ok(p_code) then raise exception 'code invalide' using errcode = '28000'; end if;
  delete from propositions where id = p_id;
end $$;

-- Suivi : 'envoye' (avec l'adresse), 'relance' (relancé : prochaine relance dans 5 jours), 'accepte', 'refuse', 'brouillon'
create or replace function public.proposition_suivi(p_code text, p_id uuid, p_action text, p_contact text default null) returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not public._ok(p_code) then raise exception 'code invalide' using errcode = '28000'; end if;
  if p_action = 'envoye' then
    update propositions set statut = 'envoye', envoye_le = now(), relance_le = now() + interval '5 days', contact = coalesce(nullif(p_contact,''), contact), maj = now() where id = p_id;
  elsif p_action = 'relance' then
    update propositions set relance_le = now() + interval '5 days', maj = now() where id = p_id;
  elsif p_action in ('accepte','refuse','brouillon') then
    update propositions set statut = p_action, relance_le = null, maj = now() where id = p_id;
  else raise exception 'action inconnue'; end if;
end $$;

-- À relancer : envoyés sans réponse depuis 5 jours (page Aujourd'hui)
create or replace function public.propositions_a_relancer(p_code text) returns json language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public._ok(p_code) then raise exception 'code invalide' using errcode = '28000'; end if;
  return coalesce((select json_agg(json_build_object('id',id,'kind',kind,'titre',titre,'client',client,'contact',contact,'jour',jour,'montant',montant,'num',num,'envoye_le',envoye_le,'cree_par',cree_par) order by envoye_le)
    from propositions where statut = 'envoye' and relance_le <= now() and (jour is null or jour >= (now() at time zone 'Europe/Paris')::date)), '[]'::json);
end $$;

revoke all on function public._devis_suivant() from public, anon, authenticated;
revoke all on function public.devis_numero(text), public.propositions_liste(text,text), public.proposition_lire(text,uuid),
  public.proposition_enregistrer(text,uuid,text,jsonb), public.proposition_supprimer(text,uuid), public.proposition_suivi(text,uuid,text,text),
  public.propositions_a_relancer(text) from public, authenticated;
grant execute on function public.devis_numero(text), public.propositions_liste(text,text), public.proposition_lire(text,uuid),
  public.proposition_enregistrer(text,uuid,text,jsonb), public.proposition_supprimer(text,uuid), public.proposition_suivi(text,uuid,text,text),
  public.propositions_a_relancer(text) to anon;
