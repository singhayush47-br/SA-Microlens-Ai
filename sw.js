/* SA-Microlens AI — Service Worker v4 (bumped to force PWA refresh) */
const CACHE='sa-microlens-v4';
const ASSETS=['./','./index.html','./manifest.json'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>{console.log('Deleting old cache:',k);return caches.delete(k);})))
    .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  /* Never cache Gemini API or Teachable Machine model files */
  const url=e.request.url;
  if(url.includes('googleapis.com')||url.includes('teachablemachine.withgoogle.com/models')){
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(res=>{
        if(res&&res.status===200&&res.type!=='opaque'){
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
