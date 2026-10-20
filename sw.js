// Garde l'appli disponible hors connexion (l'écran s'ouvre ; les données se synchronisent au retour du réseau).
const CACHE = "commande-2b-v6";
const SHELL = ["./", "index.html", "menus.html", "chiffres.html", "manifest.webmanifest", "logo.png", "logo-hd.png", "profil.js", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // l'API Supabase passe toujours par le réseau
  // Réseau d'abord pour avoir la dernière version, cache si hors ligne.
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
