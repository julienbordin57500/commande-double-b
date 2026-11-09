// Sauvegarde mensuelle du Double B : chaque 1er du mois (tâche cron « sauvegarde-mensuelle »),
// un fichier Excel avec toutes les données de l'appli part par mail (Brevo) sur la boîte du restaurant.
// Appel réservé à la tâche cron : en-tête x-cle = secrets.cron. Jamais de secret dans le fichier
// (tables secrets, push_abos et les empreintes du code d'équipe sont exclues).
import * as XLSX from "npm:xlsx@0.18.5";

const SB = Deno.env.get("SUPABASE_URL")!;
const SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SRH = { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" };
const EXPEDITEUR = { name: "Appli du Double B", email: "traiteur@doubleb-folschviller.fr" };
const DEST = "doubleb57500@outlook.fr";

// [onglet du fichier Excel, table, filtre, tri]
const TABLES: [string, string, string, string][] = [
  ["Chiffres du jour", "suivi", "", "jour"],
  ["Plats hors carte vendus", "suivi_libres", "", "jour"],
  ["Corrections des chiffres", "suivi_historique", "", ""],
  ["Objectifs", "objectifs", "", "cle"],
  ["Événements", "evenements", "", "jour"],
  ["Jours d'ouverture changés", "ouvertures", "", "jour"],
  ["Semaine habituelle", "config", "cle=eq.horaires", ""],
  ["Commandes passées", "commandes", "", "le"],
  ["Produits", "produits", "", "ordre"],
  ["Prix", "prix", "", ""],
  ["Fournisseurs", "fournisseurs", "", ""],
  ["Plats (coût)", "plats", "", ""],
  ["Plats hors carte", "plats_extra", "", "cree_le"],
  ["Hygiène relevés", "hyg_releves", "", ""],
  ["Hygiène huile", "hyg_huile", "", ""],
  ["Hygiène nettoyage", "hyg_nettoyage", "", ""],
  ["Hygiène refroidissement", "hyg_refroid", "", ""],
  ["Fidélité clients", "fid_clients", "", "cree_le"],
  ["Fidélité tampons", "fid_mouvements", "", ""],
  ["Fidélité SMS", "fid_sms", "", ""],
  ["Prospects", "prosp_prospects", "", ""],
  ["Prospection envois", "prosp_envois", "", ""],
  ["Prospection modèles", "prosp_modeles", "", ""],
  ["Prospection réglages", "prosp_reglages", "", ""],
  ["Prospection photos", "prosp_photos", "", ""],
  ["Nouveautés équipe", "notifs", "", ""],
];

async function secret(cle: string) {
  const r = await fetch(`${SB}/rest/v1/secrets?cle=eq.${cle}&select=valeur`, { headers: SRH });
  return r.ok ? ((await r.json())[0]?.valeur || "") : "";
}
async function rows(table: string, filtre: string, tri: string): Promise<Record<string, unknown>[]> {
  const q = [`select=*`, filtre, tri ? `order=${tri}.asc` : ""].filter(Boolean).join("&");
  const r = await fetch(`${SB}/rest/v1/${table}?${q}`, { headers: { ...SRH, Range: "0-49999" } });
  if (!r.ok) throw new Error(`${table} : ${await r.text()}`);
  return await r.json();
}
// Une cellule lisible dans Excel : les objets deviennent du texte, les dates restent en texte ISO
const cell = (v: unknown): unknown => {
  if (v == null) return "";
  const t = typeof v === "object" ? JSON.stringify(v) : v;
  if (typeof t !== "string") return t;
  if (t.startsWith("data:")) return "(image, gardée dans l'appli)";   // photos rangées en texte : trop lourdes pour Excel
  return t.length > 32000 ? t.slice(0, 32000) + "…" : t;              // limite d'une cellule Excel
};
// Les chiffres du jour sont rangés dans « donnees » : une colonne par case (CA midi, clients…)
function aplatir(table: string, rs: Record<string, unknown>[]) {
  if (table === "suivi") {
    return rs.map(r => { const d = (r.donnees || {}) as Record<string, unknown>; const o: Record<string, unknown> = { jour: r.jour };
      for (const k of Object.keys(d).sort()) o[k] = cell(d[k]); o.maj = r.maj; return o; });
  }
  return rs.map(r => { const o: Record<string, unknown> = {}; for (const [k, v] of Object.entries(r)) o[k] = cell(v); return o; });
}
const moisFr = (d: Date) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", month: "long", year: "numeric" }).format(d);
const jourParis = (d = new Date()) => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

async function sauvegarder() {
  const wb = XLSX.utils.book_new(), bilan: string[] = [], err: string[] = [];
  for (const [nom, table, filtre, tri] of TABLES) {
    try {
      const rs = aplatir(table, await rows(table, filtre, tri));
      const ws = rs.length ? XLSX.utils.json_to_sheet(rs) : XLSX.utils.aoa_to_sheet([["(vide)"]]);
      XLSX.utils.book_append_sheet(wb, ws, nom.slice(0, 31));
      bilan.push(`${nom} : ${rs.length}`);
    } catch (e) { err.push(`${nom} : ${(e as Error).message.slice(0, 120)}`); }
  }
  const b64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" }) as string;
  const jour = jourParis(), fichier = `Sauvegarde-Double-B-${jour}.xlsx`, mois = moisFr(new Date());
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1f1b14">
    <p>Bonjour,</p><p>Voici la sauvegarde de toutes les données de l'appli du Double B au <b>${jour.split("-").reverse().join("/")}</b>,
    dans le fichier Excel joint (un onglet par sujet).</p>
    <p style="color:#71695a;font-size:13px">${bilan.join(" · ")}</p>
    ${err.length ? `<p style="color:#c23a2b;font-size:13px">Pas sauvegardé : ${err.join(" · ")}</p>` : ""}
    <p>Garde ce mail : en cas de souci avec l'appli, rien n'est perdu.</p><p>L'appli du Double B</p></div>`;
  const cle = await secret("brevo"); if (!cle) throw new Error("Clé Brevo absente");
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST", headers: { "api-key": cle, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender: EXPEDITEUR, to: [{ email: DEST, name: "Le Double B" }], subject: `💾 Sauvegarde de l'appli — ${mois}`,
      htmlContent: html, attachment: [{ name: fichier, content: b64 }], tags: ["sauvegarde"] }),
  });
  if (!r.ok) throw new Error(`Brevo ${r.status} : ${(await r.text()).slice(0, 200)}`);
  return { ok: true, fichier, taille_ko: Math.round(b64.length * 0.75 / 1024), bilan, erreurs: err };
}

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  const c = await secret("cron");
  if (!c || req.headers.get("x-cle") !== c) return json({ error: "refusé" }, 401);
  try { return json(await sauvegarder()); } catch (e) { return json({ error: (e as Error).message }, 500); }
});
