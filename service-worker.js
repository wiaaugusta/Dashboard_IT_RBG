/**
 * SERVICE WORKER
 * -------------------------------------------------------
 * Development / active deployment strategy:
 * Network First
 *
 * Browser akan mengambil file terbaru dari server terlebih dahulu.
 * Cache hanya menjadi fallback jika network gagal.
 */

const CACHE_NAME = "it-platform-shell-v11";

const APP_SHELL_FILES = [
  "./index.html",
  "./manifest.json",

  "./css/style.css",
  "./css/layout.css",
  "./css/components.css",

  "./js/app.js",
  "./js/router.js",
  "./js/api.js",
  "./js/auth.js",
  "./js/ui.js",
  "./js/nav-config.js",
  "./js/icons.js",
  "./js/shell.js",

  "./js/pages/login.js",
  "./js/pages/dashboard.js",
  "./js/pages/coming-soon.js",

  "./js/modules/cctv.js"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_FILES))
      .catch((error) => {
        console.warn("[SW] Cache install gagal:", error);
      })
  );

  self.skipWaiting();
});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys()
      .then((keys) => {

        return Promise.all(

          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", (event) => {

  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  const isSameOrigin =
    url.origin === self.location.origin;

  if (!isSameOrigin) {
    return;
  }


  event.respondWith(

    fetch(request)

      .then((response) => {

        /*
         * Simpan response terbaru ke cache.
         */

        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {

          const responseClone = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });

        }

        return response;

      })

      .catch(() => {

        /*
         * Network gagal → gunakan cache lama.
         */

        return caches.match(request);

      })

  );

});