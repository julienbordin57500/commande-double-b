// Garde l'appli rapide et disponible hors connexion.
// Fichiers de l'appli : ouverts tout de suite depuis la copie du téléphone (changement d'onglet instantané).
// Chaque nouvelle version publiée change le nom du cache ci-dessous : le téléphone la télécharge alors EN ENTIER
// en arrière-plan (sans le cache de 10 min du navigateur), puis l'utilise d'un coup. Jamais d'ancien et de nouveau mélangés.
// Polices et bibliothèques externes : rangées à part (STATIC), gardées d'une version à l'autre, sinon chaque mise à jour
// obligeait les pages à les re-télécharger avant de s'afficher (pages bloquées si le réseau est faible).
// Jamais plus de 5 s d'attente : sinon on affiche ce qu'on a. L'API Supabase passe toujours par le réseau.
const CACHE = "commande-2b-v34";
const STATIC = "2b-statique-v1";
const SHELL = ["./", "index.html", "accueil.html", "hygiene.html", "menus.html", "chiffres.html", "evenements.html", "manifest.webmanifest", "logo-hd.png", "icone-appli.svg", "profil.js", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const STATIC_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== STATIC).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function keep(name, req, res) { if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(name).then(c => c.put(req, copy)); } return res; }
const late = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));

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
      const net = fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(r => keep(CACHE, req, r));
      const fallback = async () => (await caches.match(req, { ignoreSearch: true })) || (req.mode === "navigate" ? await c.match("accueil.html") : null) || Response.error();
      try { return (await Promise.race([net, late(5000, null)])) || await fallback(); }
      catch { return fallback(); }
    })());
    return;
  }
  // Polices, bibliothèques : copie gardée tout de suite + rafraîchissement discret
  e.respondWith((async () => {
    const s = await caches.open(STATIC);
    const cached = await s.match(req);
    const net = fetch(req).then(r => keep(STATIC, req, r)).catch(() => cached);
    if (cached) return cached;
    return (await Promise.race([net, late(5000, null)])) || Response.error();
  })());
});

// Notifications du téléphone (rappels d'hygiène, événement du lendemain) : même appli fermée
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { texte: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.titre || "Double B", {
    body: d.texte || "", icon: "icon-192.png", badge: "icon-192.png", tag: d.cle || undefined, data: { url: d.url || "accueil.html" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL(e.notification.data && e.notification.data.url || "accueil.html", self.registration.scope).href;
  e.waitUntil((async () => {
    const cs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of cs) { if ("focus" in c) { await c.focus(); if ("navigate" in c) return c.navigate(url).catch(() => {}); return; } }
    return self.clients.openWindow(url);
  })());
});
