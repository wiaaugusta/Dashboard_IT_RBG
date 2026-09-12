/**
 * APP.JS - ENTRY POINT
 * -----------------------
 * Satu-satunya file yang di-load langsung oleh index.html.
 * Tanggung jawab: bootstrap foundation (service worker, router, route awal).
 *
 * PHASE 5 STATUS:
 * Semua route setelah login (Dashboard + seluruh menu di nav-config.js)
 * didaftarkan di sini, dibungkus withAuth() supaya otomatis redirect ke
 * /login kalau belum ada session. Menu yang belum punya modul nyata
 * memakai renderComingSoonPage() (satu fungsi generik, lihat
 * pages/coming-soon.js).
 */

import { init as initRouter, registerRoute, navigate } from "./router.js";
import { renderLoginPage } from "./pages/login.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderComingSoonPage } from "./pages/coming-soon.js";
import { renderCctvPage } from "./modules/cctv.js";
import { isAuthenticated } from "./auth.js";
import { getFlatRoutes } from "./nav-config.js";

function registerServiceWorker() {

  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./service-worker.js?v=11")
      .then((registration) => {

        console.log(
          "[app.js] Service worker aktif:",
          registration.scope
        );

        registration.update();

      })
      .catch((error) => {

        console.error(
          "[app.js] Service worker registration gagal:",
          error
        );

      });

  });

}

/**
 * Bungkus render function halaman dengan pengecekan session.
 * Dipakai untuk SEMUA halaman setelah login (docs/PROJECT_CONSTITUTION.md
 * #7 - backend tetap jadi pengaman utama, tapi frontend juga perlu
 * mengarahkan user yang belum login supaya tidak melihat shell kosong).
 */
function withAuth(renderFn) {
  return (container) => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    renderFn(container);
  };
}

function registerRoutes() {
  registerRoute("/login", renderLoginPage);
  registerRoute("/dashboard", withAuth(renderDashboardPage));
  registerRoute("/cctv", withAuth(renderCctvPage));

  // Semua menu selain Dashboard & CCTV didaftarkan otomatis dari
  // nav-config.js, memakai halaman placeholder generik sampai modulnya
  // benar-benar dibangun.
  getFlatRoutes().forEach((route) => {
    if (route.key === "dashboard" || route.key === "cctv") return; // sudah didaftarkan di atas
    registerRoute(
      route.path,
      withAuth((container) => renderComingSoonPage(container, route))
    );
  });
}

function bootstrap() {
  registerServiceWorker();
  registerRoutes();
  initRouter();

  if (!window.location.hash) {
    navigate(isAuthenticated() ? "/dashboard" : "/login");
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);
