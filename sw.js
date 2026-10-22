// Garde l'appli rapide et disponible hors connexion.
// Fichiers de l'appli : ouverts tout de suite depuis la copie du téléphone (changement d'onglet instantané).
// Chaque nouvelle version publiée change le nom du cache ci-dessous : le téléphone la télécharge alors EN ENTIER
// en arrière-plan (sans le cache de 10 min du navigateur), puis l'utilise d'un coup. Jamais d'ancien et de nouveau mélangés.
// Polices et bibliothèques externes : version gardée, mise à jour en arrière-plan. L'API Supabase passe toujours par le réseau.
const CACHE = "commande-2b-v19";
const SHELL = ["./", "index.html", "accueil.html", "hygiene.html", "menus.html", "chiffres.html", "evenements.html", "manifest.webmanifest", "logo-hd.png", "icone-appli.svg", "profil.js", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const STATIC_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function put(req, res) { if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;
  if (!same && !STATIC_HOSTS.includes(url.hostname)) return;

  if (same) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const cached = await c.match(req, { ignoreSearch: true });
      if (cached) return cached;
      try { return put(req, await fetch(req.url, { cache: "no-cache", credentials: "same-origin" })); }
      catch { return (await c.match("index.html")) || Response.error(); }
    })());
    return;
  }
  // Polices, bibliothèques : cache immédiat + rafraîchissement discret
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const net = fetch(req).then(r => put(req, r)).catch(() => cached);
    return cached || net;
  })());
});
