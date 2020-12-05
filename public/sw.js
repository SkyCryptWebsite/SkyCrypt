const VERSION = "1";

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(`skyCrypt-static-v${VERSION}`).then((cache) => {
            return cache.addAll([
                '/resources/html/offline.html',
                '/resources/img/bg.webp',
                '/resources/css/index.css',
                '/favicon.ico',
                '/resources/img/logo_square.png',
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
                        if (url.pathname === '/') {
                            return caches.match('/resources/html/offline.html');
                        }
                    }
                    return response;
                });
            })
    );
});