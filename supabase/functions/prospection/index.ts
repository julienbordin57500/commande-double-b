// Prospection traiteur du Double B.
// - « enrichir » : retrouve le site web et une adresse de contact GÉNÉRIQUE (contact@, accueil@…) d'un organisme.
//   Sources : annuaire officiel du service public (mairies, administrations), puis le site de l'organisme lui-même
//   (accueil + page contact / mentions légales, 3 pages au plus, robots.txt respecté). Aucune adresse nominative gardée.
// - « photo » : range une photo de dînatoire dans le dossier public « prospection ».
// - « lot » : envoie par Brevo la file du jour (même règles que queue() et buildMail() de prospection.html).
//   Lancée du lundi au vendredi par la tâche cron « prospection-envoi » (en-tête x-cle = secrets.cron).
// - « test » : envoie un exemple de mail à l'adresse du restaurant seulement, sans rien noter.
// - ?d=<jeton> : lien de désinscription en un clic (en-tête List-Unsubscribe), sans code.
// Accès : code d'équipe vérifié par public._ok, comme les fonctions RPC.
const SB = Deno.env.get("SUPABASE_URL")!;
const SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, apikey, authorization", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const UA = "Mozilla/5.0 (compatible; DoubleB-prospection/1.0; +https://julienbordin57500.github.io/commande-double-b/)";
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

async function ok(code: string) {
  const r = await fetch(`${SB}/rest/v1/rpc/_ok`, { method: "POST", headers: { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" }, body: JSON.stringify({ p_code: code }) });
  return r.ok && (await r.json()) === true;
}

async function get(url: string, ms = 6000) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": "text/html,*/*", "Accept-Language": "fr" }, redirect: "follow", signal: c.signal });
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("html") && !ct.includes("text")) return null;
    const txt = (await r.text()).slice(0, 600000);
    return { url: r.url, txt };
  } catch { return null } finally { clearTimeout(t) }
}

// Adresses génériques acceptées (jamais prenom.nom)
const GEN = /^(contact|contacts|accueil|secretariat|secr[eé]tariat|info|infos|information|informations|bonjour|hello|mairie|administration|direction|commercial|commerciale|ventes?|cse|ce|comite|communication|evenements?|events?|reception|standard|office|agence|cabinet|etude|service\.?client|serviceclient|clients?|devis|gestion|siege|courrier|association|asso|bureau|ecole|college|lycee|ehpad|ccas|cfa|formation|presidence|accueil\.[a-z-]+|contact\.[a-z-]+|mairie[.\-_a-z0-9]*|secretariat[.\-_a-z0-9]*)$/i;
const BAD_DOM = /(example\.|sentry|wixpress|domain\.|email\.com$|votre|yourdomain|\.png$|\.jpg$|\.gif$|\.webp$|\.svg$)/i;

function emails(html: string) {
  const t = html.replace(/&#64;|&#x40;|\s?\[at\]\s?|\s?\(at\)\s?|\s?\[arobase\]\s?/gi, "@").replace(/\s?\[dot\]\s?|\s?\(dot\)\s?/gi, ".");
  const found = new Set<string>();
  for (const m of t.matchAll(/[a-z0-9][a-z0-9._%+-]{0,40}@[a-z0-9.-]+\.[a-z]{2,10}/gi)) {
    const e = m[0].toLowerCase().replace(/\.$/, "");
    if (!BAD_DOM.test(e)) found.add(e);
  }
  return [...found];
}
const generic = (e: string) => GEN.test(e.split("@")[0]);
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, "") } catch { return "" } };
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

async function robotsOk(base: string) {
  const r = await get(new URL("/robots.txt", base).href, 4000);
  if (!r) return true;
  let all = false;
  for (const raw of r.txt.split(/\r?\n/)) {
    const l = raw.trim().toLowerCase();
    if (l.startsWith("user-agent:")) all = l.slice(11).trim() === "*";
    else if (all && /^disallow:\s*\/\s*$/.test(l)) return false;
  }
  return true;
}

// Noms de domaine probables à partir du nom de l'organisme (vérifiés : la page doit citer la commune ou le code postal)
function guesses(nom: string) {
  let n = norm(nom).replace(/\(.*?\)/g, " ").replace(/\b(sas|sasu|sarl|sa|eurl|sci|snc|scop|selarl|association|asso|ste|societe|et|de|du|des|la|le|les|l)\b/g, " ").replace(/[^a-z0-9 ]/g, " ").trim().replace(/\s+/g, " ");
  if (!n || n.length < 3) return [];
  const a = n.replace(/ /g, ""), b = n.replace(/ /g, "-");
  return [...new Set([`${a}.fr`, `${b}.fr`, `${a}.com`, `${b}.com`])].slice(0, 4).map(d => `https://www.${d}/`);
}

async function annuaire(siret: string) {
  if (!siret) return null;
  const u = `https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?where=siret%3D%22${siret}%22&limit=1&select=nom,adresse_courriel,site_internet,telephone`;
  try {
    const r = await fetch(u, { headers: { "User-Agent": UA } }); if (!r.ok) return null;
    const d = (await r.json()).results?.[0]; if (!d) return null;
    let site = ""; try { site = JSON.parse(d.site_internet || "[]")[0]?.valeur || "" } catch {}
    let tel = ""; try { tel = JSON.parse(d.telephone || "[]")[0]?.valeur || "" } catch {}
    const email = (d.adresse_courriel || "").split(/[;, ]/)[0].toLowerCase();
    return { site, email, tel };
  } catch { return null }
}

async function enrichir(b: any) {
  const out: any = { site: b.site || "", email: "", emails: [], source: "", telephone: "", note: "" };
  const an = await annuaire(b.siret || "");
  if (an) {
    if (an.site && !out.site) out.site = an.site;
    if (an.tel) out.telephone = an.tel;
    if (an.email) { out.email = an.email; out.emails = [an.email]; out.source = "Annuaire officiel du service public"; return out; }
  }
  const commune = norm(b.commune || ""), cp = String(b.cp || "");
  let page: { url: string, txt: string } | null = null;
  if (out.site) {
    page = await get(out.site.startsWith("http") ? out.site : "https://" + out.site);
  } else {
    for (const g of guesses(b.nom || "")) {
      const p = await get(g, 5000);
      if (p && commune && (norm(p.txt).includes(commune) || (cp && p.txt.includes(cp)))) { page = p; out.site = p.url; break; }
    }
  }
  if (!page) { out.note = out.site ? "Site injoignable" : "Site introuvable automatiquement"; return out; }
  if (!(await robotsOk(page.url))) { out.note = "Le site refuse la lecture automatique : à regarder à la main"; return out; }
  const pages = [page];
  const links = [...page.txt.matchAll(/href=["']([^"'#]+)["']/gi)].map(m => m[1]).filter(h => /contact|mentions|nous-joindre|coordonn|a-propos|qui-sommes/i.test(h)).slice(0, 6);
  const seen = new Set([page.url]);
  for (const h of links) {
    if (pages.length >= 3) break;
    let u = ""; try { u = new URL(h, page.url).href } catch { continue }
    if (seen.has(u) || host(u) !== host(page.url)) continue; seen.add(u);
    const p = await get(u, 5000); if (p) pages.push(p);
  }
  const all = [...new Set(pages.flatMap(p => emails(p.txt)))];
  const dom = host(page.url).split(".").slice(-2).join(".");
  const gens = all.filter(generic).sort((x, y) => Number(y.endsWith(dom)) - Number(x.endsWith(dom)));
  out.emails = gens;
  out.email = gens[0] || "";
  out.source = gens[0] ? "Site de l'organisme (" + host(page.url) + ")" : "";
  if (!gens.length) out.note = all.length ? "Seulement des adresses nominatives : non gardées (RGPD)" : "Pas d'adresse sur le site : formulaire de contact ?";
  return out;
}

async function photo(b: any) {
  const type = ["image/jpeg", "image/png", "image/webp"].includes(b.type) ? b.type : "image/jpeg";
  const bin = Uint8Array.from(atob(b.data || ""), c => c.charCodeAt(0));
  if (!bin.length || bin.length > 3000000) return json({ error: "Photo trop lourde" }, 400);
  const name = `${crypto.randomUUID()}.${type.split("/")[1]}`;
  const up = await fetch(`${SB}/storage/v1/object/prospection/${name}`, { method: "POST", headers: { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": type, "cache-control": "31536000" }, body: bin });
  if (!up.ok) return json({ error: "Envoi de la photo refusé" }, 500);
  const url = `${SB}/storage/v1/object/public/prospection/${name}`;
  await fetch(`${SB}/rest/v1/prosp_photos`, { method: "POST", headers: { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" }, body: JSON.stringify({ url, legende: String(b.legende || "").slice(0, 120), ordre: Number(b.ordre) || 0 }) });
  return json({ url });
}

/* ---------- Envoi automatique par Brevo ---------- */
const SRH = { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" };
const rpcSR = async (fn: string, args: unknown = {}) => {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: "POST", headers: SRH, body: JSON.stringify(args) });
  const t = await r.text(); if (!r.ok) throw new Error(t); return t ? JSON.parse(t) : null;
};
async function secret(cle: string) {
  const r = await fetch(`${SB}/rest/v1/secrets?cle=eq.${cle}&select=valeur`, { headers: SRH });
  return r.ok ? ((await r.json())[0]?.valeur || "") : "";
}
const BASE = "https://julienbordin57500.github.io/commande-double-b/";
const SELF = `${SB}/functions/v1/prospection`;
const EXPEDITEUR = { name: "L'équipe du Double B", email: "traiteur@doubleb-folschviller.fr" };
const REPONSE = "doubleb57500@outlook.fr";
// Date du jour à Folschviller (la fonction tourne en heure UTC)
const jourParis = (d = new Date()) => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

// Copie de la file de prospection.html (queue) : relances à J+7 / J+15, puis les nouveaux du plus proche au plus loin
function file(S: any, jour: string) {
  const L = S.prospects.filter((p: any) => !p.desinscrit_le && p.email);
  const rel = L.filter((p: any) => ["contacte", "relance"].includes(p.statut) && p.prochaine_relance && p.prochaine_relance <= jour && p.etape < 3)
    .map((p: any) => ({ p, m: p.etape <= 1 ? "relance7" : "relance15" }));
  const lot = +S.reglages.lots_par_jour || 20;
  const deja = S.envois.filter((e: any) => e.m === "accroche" && jourParis(new Date(e.d)) === jour).length;
  const nv = L.filter((p: any) => p.statut === "a_contacter" && !p.etape).sort((a: any, b: any) => (+a.distance_km || 99) - (+b.distance_km || 99))
    .slice(0, Math.max(0, lot - deja)).map((p: any) => ({ p, m: "accroche" }));
  return [...rel, ...nv];
}

// Copie de buildMail() de prospection.html (garder les deux pareils)
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" } as any)[c]);
const PHRASE_BESOIN: any = { ce: "pour les événements de votre CSE (fêtes de fin d'année, départs, arbres de Noël)", reunion: "pour vos réunions et formations", evenement: "pour vos inaugurations, vœux, portes ouvertes et cocktails clients", seminaire: "pour vos séminaires et journées d'équipe", repas: "pour les repas de vos équipes, livrés chauds sur place" };
const PHRASE_CAT: any = { cse: PHRASE_BESOIN.ce, administration: "pour vos vœux, inaugurations, réceptions et réunions", association: "pour vos assemblées, fêtes et événements", sante: "pour vos réunions d'équipe, départs et fêtes de fin d'année", enseignement: "pour vos réunions, fêtes de fin d'année et départs" };
const OCCASIONS: any = { cse: "l'arbre de Noël, la fête du personnel ou un repas entre collègues", administration: "vos vœux, vos cérémonies, une inauguration ou un repas après le conseil", association: "votre assemblée générale, votre fête annuelle ou un repas entre bénévoles",
  sante: "un pot de départ, une réunion d'équipe ou la fête de fin d'année du personnel", enseignement: "un pot de départ, une réunion d'équipe ou la fête de fin d'année" };
const OCC_BESOIN: any = { ce: OCCASIONS.cse, reunion: "votre prochaine réunion, une formation ou un comité de direction", evenement: "une inauguration, vos vœux ou une soirée clients", seminaire: "votre prochain séminaire ou une journée d'équipe", repas: "un déjeuner d'équipe, chaque semaine ou de temps en temps" };
const occasions = (p: any) => OCC_BESOIN[p.besoin] || OCCASIONS[p.categorie] || "votre prochain pot de départ, une réunion d'équipe ou une soirée clients";
const phraseBesoin = (p: any) => PHRASE_BESOIN[p.besoin] || PHRASE_CAT[p.categorie] || "pour vos réunions, vos événements et les repas de vos équipes";
function saison(jour: string) {
  const m = +jour.slice(5, 7);
  if (m === 11 || m === 12) return "Les fêtes de fin d'année approchent : c'est le bon moment pour en parler.";
  if (m === 1) return "Vœux de nouvelle année, galettes, premières réunions : c'est le bon moment pour en parler.";
  if (m <= 3) return "Assemblées générales, séminaires, départs : le printemps arrive vite, c'est le bon moment pour anticiper.";
  if (m <= 6) return "Fins de saison, départs en retraite, fêtes d'été : c'est le bon moment pour réserver vos dates.";
  if (m <= 8) return "La rentrée arrive vite : réunions de rentrée, séminaires… c'est le bon moment pour anticiper.";
  return "La fin d'année se prépare dès maintenant : les dates de décembre partent vite.";
}
function buildMail(S: any, cle: string, p: any, jour: string) {
  const M = S.modeles.find((x: any) => x.cle === cle) || { sujet: "", corps: "" }; const R = S.reglages;
  const tel = R.telephone || "06 13 10 05 03", mel = R.email || REPONSE, sig = R.signature || "L'équipe du Double B";
  const desinsc = `${R.lien_desinscription || BASE + "desinscription.html"}?j=${p.jeton || ""}`;
  const plaq = BASE + "plaquette-traiteur.pdf";
  const avis = (R.note_google || "").trim() ? `Nos clients nous donnent ${R.note_google.trim()}/5 sur Google.` : "Notre restaurant est très bien noté par ses clients sur Google.";
  const fill = (t: string) => t.replace(/\{besoin\}/g, phraseBesoin(p)).replace(/\{occasions\}/g, occasions(p)).replace(/\{saison\}/g, saison(jour)).replace(/\{commune\}/g, p.commune || "chez vous").replace(/\{telephone\}/g, tel).replace(/\{avis\}/g, avis).replace(/\{nom\}/g, p.nom || "");
  let corps = fill(M.corps || ""); const sujet = fill(M.sujet || "");
  let ps = ""; const k = corps.search(/\n\s*\nPS ?:/); if (k >= 0) { ps = corps.slice(k).trim(); corps = corps.slice(0, k) }
  const P = 'style="margin:0 0 14px"';
  const photos = (n: number) => {
    const l = S.photos.slice(0, n); if (!l.length) return "";
    const cells = l.map((f: any) => `<td style="padding:4px;width:50%" valign="top"><img src="${esc(f.url)}" alt="${esc(f.legende || "Réalisation du Double B")}" width="276" style="display:block;width:100%;max-width:276px;height:auto;border-radius:10px;border:0"></td>`);
    let rows = ""; for (let i = 0; i < cells.length; i += 2) rows += `<tr>${cells[i]}${cells[i + 1] || (l.length > 1 ? '<td style="width:50%"></td>' : "")}</tr>`;
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;margin:4px 0 16px"><tbody>${rows}</tbody></table>`;
  };
  const blocs = corps.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const html = blocs.map(b => {
    const ph = b.match(/^\[photos\s*(\d+)\]$/i); if (ph) return photos(+ph[1]);
    const lines = b.split("\n");
    if (lines.every(l => /^- /.test(l))) return `<ul style="margin:0 0 14px;padding-left:22px">${lines.map(l => `<li style="margin:0 0 4px">${esc(l.slice(2))}</li>`).join("")}</ul>`;
    if (lines.length > 1 && !/^- /.test(lines[0]) && !/[.:,!?]$/.test(lines[0]) && lines[1].startsWith("- "))
      return `<p style="margin:0 0 6px">${esc(lines[0])}</p><ul style="margin:0 0 14px;padding-left:22px">${lines.slice(1).map(l => `<li style="margin:0 0 4px">${esc(l.replace(/^- /, ""))}</li>`).join("")}</ul>`;
    if (lines.length > 1 && !/[.:,!?]$/.test(lines[0]) && lines[0].length < 60) return `<p ${P}><b style="color:#b06d00">${esc(lines[0])}</b><br>${esc(lines.slice(1).join(" "))}</p>`;
    return `<p ${P}>${esc(lines.join(" "))}</p>`;
  }).join("")
    .replace(/\{plaquette\}/g, `<a href="${plaq}" style="display:inline-block;background:#f2a516;color:#2a1d00;font-weight:bold;text-decoration:none;padding:9px 16px;border-radius:8px">📄 Voir notre plaquette traiteur</a>`);
  const full = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222222;max-width:600px">
<p style="margin:0 0 18px"><img src="${BASE}logo-hd.png" alt="Double B" width="150" style="display:block;width:150px;height:auto;border:0"></p>
${html}
<p style="margin:0 0 20px">${esc(sig)}<br><b>Le Double B</b> · restaurant et traiteur fait maison<br>59 avenue Foch, 57730 Folschviller<br>${esc(tel)} · <a href="mailto:${esc(mel)}" style="color:#b06d00">${esc(mel)}</a></p>
${ps ? `<p style="margin:0 0 18px;font-style:italic">${esc(ps)}</p>` : ""}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;margin:0 0 16px"><tr><td style="background:#f7f1e6;border-radius:10px;padding:10px 14px;font-size:13px;line-height:1.45;color:#5c5446">🍽️ <b style="color:#2a1d00">Le Double B, c'est d'abord un restaurant.</b> Venez goûter notre cuisine maison, du lundi au vendredi, midi et soir, au 59 avenue Foch à Folschviller.</td></tr></table>
<p style="margin:0;font-size:11.5px;line-height:1.45;color:#8a8275">Le Double B, SIREN ${esc(R.siren || "915 267 595")}, 59 avenue Foch, 57730 Folschviller. Ce message est envoyé à l'adresse de contact professionnelle de votre structure, au sujet de notre service traiteur pour les professionnels. Vous ne souhaitez plus rien recevoir ? <a href="${esc(desinsc)}" style="color:#8a8275">Se désinscrire en un clic</a> ou répondez « STOP ».</p>
</div>`;
  const text = corps.replace(/\[photos\s*\d+\]\n*/gi, "").replace(/\{plaquette\}/g, "Notre plaquette : " + plaq) + `\n\n${sig}\nLe Double B · restaurant et traiteur fait maison\n59 avenue Foch, 57730 Folschviller\n${tel} · ${mel}\n\n${ps ? ps + "\n\n" : ""}Le Double B, c'est d'abord un restaurant : venez goûter notre cuisine maison, du lundi au vendredi, midi et soir.\n\nPour ne plus rien recevoir : ${desinsc} ou répondez STOP.`;
  return { sujet, html: full, text };
}

async function brevo(cle: string, to: string, nom: string, mail: { sujet: string, html: string, text: string }, jeton: string) {
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST", headers: { "api-key": cle, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: EXPEDITEUR, to: [{ email: to, name: nom.slice(0, 70) }], replyTo: { email: REPONSE, name: "Le Double B" },
      subject: mail.sujet, htmlContent: mail.html, textContent: mail.text,
      attachment: [{ url: BASE + "plaquette-traiteur.pdf", name: "Plaquette traiteur Double B.pdf" }],
      headers: { "List-Unsubscribe": `<${SELF}?d=${jeton}>, <mailto:${EXPEDITEUR.email}?subject=STOP>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      tags: ["prospection"],
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || `Brevo a refusé (${r.status})`);
  return d.messageId || "";
}

// Lot du jour : appelé par la tâche cron. Ne fait rien tant que « envoi_auto » n'est pas sur « oui » dans les réglages.
async function lot() {
  const cle = await secret("brevo");
  const S = await rpcSR("_prosp_tout");
  if (!cle || S.reglages.envoi_auto !== "oui") return { envoyes: 0, raison: "envoi automatique arrêté" };
  const jour = jourParis(), q = file(S, jour), erreurs: string[] = [];
  let n = 0;
  for (const { p, m } of q) {
    try {
      await brevo(cle, p.email, p.nom || "", buildMail(S, m, p, jour), p.jeton || "");
      await rpcSR("_prosp_noter_envoi", { p_id: p.id, p_modele: m, p_par: "brevo" });
      n++;
    } catch (e) { erreurs.push(`${p.nom} : ${(e as Error).message}`.slice(0, 200)); if (erreurs.length >= 3 && !n) break; }
    await new Promise(r => setTimeout(r, 400));
  }
  const bilan = { le: new Date().toISOString(), envoyes: n, prevus: q.length, erreurs };
  await rpcSR("_prosp_reglage_srv", { p_cle: "brevo_dernier", p_valeur: JSON.stringify(bilan) });
  return bilan;
}

// Test : un premier contact construit pour le prochain prospect, envoyé uniquement à l'adresse du restaurant, jamais noté
async function test() {
  const cle = await secret("brevo"); if (!cle) return json({ error: "Clé Brevo absente" }, 400);
  const S = await rpcSR("_prosp_tout"), jour = jourParis();
  const p = file(S, jour)[0]?.p || S.prospects.find((x: any) => x.email && !x.desinscrit_le) || { nom: "Exemple SARL", categorie: "entreprise", commune: "Folschviller", jeton: "" };
  // jeton factice : un clic sur « se désinscrire » dans le test ne retire personne
  const faux = "00000000-0000-0000-0000-000000000000";
  const mail = buildMail(S, "accroche", { ...p, jeton: faux }, jour); mail.sujet = "[TEST] " + mail.sujet;
  try { await brevo(cle, REPONSE, "Le Double B", mail, faux); } catch (e) { return json({ error: (e as Error).message }, 502); }
  return json({ ok: true, pour: p.nom });
}

// Désinscription en un clic depuis le logiciel de mail (POST) ou par le lien de l'en-tête (GET → page habituelle)
async function desinscrire(req: Request, jeton: string) {
  if (!/^[0-9a-f-]{36}$/i.test(jeton)) return new Response("Lien incomplet", { status: 400 });
  if (req.method === "POST") { await rpcSR("prosp_desinscrire", { p_jeton: jeton }); return new Response("OK"); }
  return Response.redirect(`${BASE}desinscription.html?j=${jeton}`, 302);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const d = new URL(req.url).searchParams.get("d");
  if (d !== null) return desinscrire(req, d);
  let b: any = {}; try { b = await req.json() } catch {}
  if (b.action === "lot") {
    const c = await secret("cron");
    if (!c || req.headers.get("x-cle") !== c) return json({ error: "refusé" }, 401);
    return json(await lot());
  }
  if (!(await ok(String(b.code || "")))) return json({ error: "code invalide", code: "28000" }, 401);
  if (b.action === "enrichir") return json(await enrichir(b));
  if (b.action === "photo") return photo(b);
  if (b.action === "test") return test();
  return json({ error: "action inconnue" }, 400);
});
