const CACHE='hg-v46';
const CORE=["/","/index.html","/hg.css?v=46","/hg.js?v=46","/version.json","/site.webmanifest","/icon-192.png","/icon-512.png","/favicon-32.png","/apple-touch-icon.png","/img/hg-logo.png","/img/t-wolverine.webp?v=46","/img/c-wolverine-sm.webp?v=46","/img/c-wolverine-md.webp?v=46"];
const isShell= (r,u) => r.mode==='navigate' || u.pathname==='/' || u.pathname==='/index.html' || u.pathname==='/sw.js' || u.pathname==='/version.json' || u.pathname==='/hg.css' || u.pathname==='/hg.js';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin||u.pathname.startsWith('/api'))return;
 if(isShell(r,u)){e.respondWith(fetch(new Request(r,{cache:'no-store'})).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('/'):undefined))));return;}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;})));});
