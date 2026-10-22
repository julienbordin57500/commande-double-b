// Garde l'appli rapide et disponible hors connexion.
// Fichiers de l'appli (pages, scripts, images) : on demande toujours la dernière version (sans le cache de 10 min du navigateur),
// mais jamais plus de 1,2 s d'attente : sinon la version gardée s'affiche tout de suite.
// Polices et bibliothèques externes : version gardée tout de suite, mise à jour en arrière-plan.
// L'API Supabase passe toujours par le réseau.
const CACHE = "commande-2b-v18";
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
      const cached = await caches.match(req, { ignoreSearch: true });
      const net = fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(r => put(req, r));
      if (!cached) return net.catch(() => caches.match("index.html"));
      const timeout = new Promise(res => setTimeout(() => res(cached), 1200));
      return Promise.race([net.catch(() => cached), timeout]);
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
