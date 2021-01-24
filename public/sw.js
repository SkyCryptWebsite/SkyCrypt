// add arc.io
importScripts('https://arc.io/arc-sw-core.js')

const VERSION = "1";

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(`skyCrypt-offline-v${VERSION}`).then((cache) => {
            return cache.addAll([
                '/resources/html/offline.html',
                '/resources/img/bg.webp',
                '/resources/img/logo_square.svg',
            ]);
        }),
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