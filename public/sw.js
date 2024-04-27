const cacheName = "offline-v1";

const offlineResources = ["/resources/html/offline.html", "/resources/img/bg.webp", "/resources/img/logo_square.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.has(cacheName).then(async (exists) => {
      if (!exists) {
        const cache = await caches.open(cacheName);
        await cache.addAll(offlineResources.map((url) => new Request(url, { cache: "reload" })));
      }
      const keys = await caches.keys();
      const deletions = keys.map((key) => {
        if (key !== cacheName) {
          return caches.delete(key);
        }
      });
      await Promise.all(deletions);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        if (!response) {
          if (event.request.mode === "navigate") {
            return caches.match("/resources/html/offline.html");
          }
        }
        return response;
      });
    }),
  );
});
