// add arc.io
importScripts('https://arc.io/arc-sw-core.js')

const cacheName = "offline-v1";

const offlineResources = [
    '/resources/html/offline.html',
    '/resources/img/bg.webp',
    '/resources/img/logo_square.svg',
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.has(cacheName).then( async (exists) => {
            if (!exists) {
                console.log('reloading')
                const cache = await caches.open(cacheName);
                await cache.addAll(offlineResources.map(url => new Request(url, { cache: "reload" })));
            }
            const keys = await caches.keys();
            const deletions = keys.map((key) => {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            });
            await Promise.all(deletions);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request).then((response) => {
                    if (!response) {
                        const url = new URL(event.request.url)
                        if (url.pathname === '/' || url.pathname.substring(0, 7) === '/stats/') {
                            return caches.match('/resources/html/offline.html');
                        }
                    }
                    return response;
                });
            })
    );
});