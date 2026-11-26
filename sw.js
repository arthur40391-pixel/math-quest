/* 數學闖關 App 外殼：只快取外殼檔案（題目與成績都在 Google 試算表，不快取）。圖示有換時把版本號 +1 */
var CACHE = 'mq-shell-v2';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function withTimeout(p, ms) {
  return new Promise(function (res, rej) { var t = setTimeout(function () { rej(new Error('timeout')); }, ms); p.then(function (r) { clearTimeout(t); res(r); }, function (er) { clearTimeout(t); rej(er); }); });
}
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (u.origin !== self.location.origin || e.request.method !== 'GET') return;
  e.respondWith(withTimeout(fetch(e.request), 4000).then(function (r) {
    if (r.ok) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); }
    return r;
  }).catch(function () { return caches.match(e.request).then(function (m) { return m || caches.match('index.html'); }); }));
});
