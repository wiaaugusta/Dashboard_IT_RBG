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
import { renderManagePcPage } from "./pages/manage-pc.js";
import { renderComingSoonPage } from "./pages/coming-soon.js";
import { renderCctvPage } from "./modules/cctv.js";
import { isAuthenticated, getSession, clearSession, touchSession } from "./auth.js";
import { showError } from "./ui.js";
import { getFlatRoutes } from "./nav-config.js";

function registerServiceWorker() {

  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./service-worker.js?v=13")
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

/**
 * Sama dengan withAuth(), ditambah pengecekan role.
 * Menyembunyikan menu adalah UI behavior; halaman yang hanya untuk
 * role tertentu (mis. Manage PC untuk ADMIN) juga dijaga di sini.
 * Authorization yang SEBENARNYA tetap dilakukan backend
 * (docs/UI_AND_DESIGN.md #27).
 */
function withRole(roles, renderFn) {
  return (container) => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const session = getSession();
    if (!session || !roles.includes(session.role)) {
      navigate("/dashboard");
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

    // Halaman Manage PC (Kaspersky / ITAM / KACE) dengan TAB Office/Store
    // di dalam halaman - hanya untuk ADMIN.
    if (route.parentKey === "manage-pc") {
      registerRoute(
        route.path,
        withRole(["ADMIN"], (container) => renderManagePcPage(container, route))
      );
      return;
    }

    registerRoute(
      route.path,
      withAuth((container) => renderComingSoonPage(container, route))
    );
  });
}

/**
 * SIKLUS HIDUP SESI (auto-recovery, dipasangkan dengan emitSessionEvents
 * di api.js):
 * - itplatform:session-activity -> request ber-token sukses: perbarui
 *   penanda aktivitas sesi supaya user yang aktif tidak pernah di-logout.
 * - itplatform:session-invalid  -> backend menolak token ("Sesi tidak
 *   valid"): bersihkan sesi lalu kembali ke /login. Sebelumnya kondisi ini
 *   membuat user TERJEBAK: sessionStorage bertahan saat reload,
 *   renderLoginPage me-redirect balik ke dashboard, semua API gagal, dan
 *   hanya close tab yang menyelamatkan. Kini reload pun menyembuhkan.
 */
function bindSessionLifecycle() {

  window.addEventListener("itplatform:session-activity", () => {
    touchSession();
  });

  window.addEventListener("itplatform:session-invalid", () => {
    clearSession();
    showError("Sesi berakhir. Silakan login kembali.");
    if (window.location.hash !== "#/login") {
      navigate("/login");
    }
  });

}

function bootstrap() {
  registerServiceWorker();
  bindSessionLifecycle();
  registerRoutes();
  initRouter();

  if (!window.location.hash) {
    navigate(isAuthenticated() ? "/dashboard" : "/login");
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);
