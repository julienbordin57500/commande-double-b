-- Refonte de la page Menus en « dossiers clients » (2026-11-13), faite à la main dans l'éditeur SQL du tableau de bord.
alter table public.propositions drop constraint if exists propositions_kind_check;
alter table public.propositions add constraint propositions_kind_check check (kind in ('menu','devis','dossier'));
-- anciens menus / devis → dossiers : data = {c: client, menu: {menu, raw, champs}, devis: {...}}
update public.propositions set kind='dossier', data = jsonb_build_object('c', jsonb_build_object('nom', coalesce(client,''), 'mail', coalesce(contact,''), 'jour', coalesce(jour::text,''), 'type','resto'), 'menu', data, 'devis', jsonb_build_object('off', true)) where kind='menu';
update public.propositions set kind='dossier', data = jsonb_build_object('c', jsonb_build_object('nom', coalesce(data->>'client',''), 'adr', coalesce(data->>'adr',''), 'jour', coalesce(data->>'jour',''), 'pers', coalesce(data->>'pers',''), 'evt', coalesce(data->>'evt',''), 'type', case when data->>'objet' ilike '%traiteur%' then 'traiteur' else 'resto' end), 'menu', null, 'devis', data) where kind='devis';
-- propositions_liste : ajoute pers (data.c.pers) et prix (data.menu.champs.prix)
-- proposition_enregistrer : n° de devis pour un dossier dès qu'il a un devis (avec_devis = '1') ; un ancien téléphone (kind menu/devis) n'écrase jamais un dossier
-- (texte complet des deux fonctions : voir l'éditeur SQL / pg_get_functiondef)
