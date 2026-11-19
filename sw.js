const VERSION = 'mp-v1';
const CDN = ['cdn.tailwindcss.com','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com','www.gstatic.com'];
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Firestore / Google APIs: never touch
  if (/firestore|googleapis\.com$|firebaseio|identitytoolkit/.test(url.hostname) && !CDN.includes(url.hostname)) return;
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(r => {
      const c = r.clone(); caches.open(VERSION).then(ch => ch.put(req, c)); return r;
    }).catch(() => caches.match(req).then(m => m || caches.match('./'))));
  } else if (CDN.includes(url.hostname)) {
    e.respondWith(caches.open(VERSION).then(ch => ch.match(req).then(m => {
      const net = fetch(req).then(r => { ch.put(req, r.clone()); return r; }).catch(() => m);
      return m || net;
    })));
  }
});

