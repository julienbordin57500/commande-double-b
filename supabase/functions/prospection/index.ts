// Prospection traiteur du Double B.
// - « enrichir » : retrouve le site web et une adresse de contact GÉNÉRIQUE (contact@, accueil@…) d'un organisme.
//   Sources : annuaire officiel du service public (mairies, administrations), puis le site de l'organisme lui-même
//   (accueil + page contact / mentions légales, 3 pages au plus, robots.txt respecté). Aucune adresse nominative gardée.
// - « photo » : range une photo de dînatoire dans le dossier public « prospection ».
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
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  let b: any = {}; try { b = await req.json() } catch {}
  if (!(await ok(String(b.code || "")))) return json({ error: "code invalide", code: "28000" }, 401);
  if (b.action === "enrichir") return json(await enrichir(b));
  if (b.action === "photo") return photo(b);
  return json({ error: "action inconnue" }, 400);
});
