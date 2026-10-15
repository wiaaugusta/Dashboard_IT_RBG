/**
 * PAGES/DASHBOARD.JS
 * ----------------------------------------------------
 * Premium dashboard home.
 * Visual/layout only - tidak mengubah auth, router, atau API.
 */

import { renderShell } from "../shell.js";
import { getSession } from "../auth.js";
import { isVisibleForRole } from "../nav-config.js";
import { icon } from "../icons.js";

const MODULE_SUMMARY = [
  {
    key: "cctv",
    label: "CCTV",
    description: "Monitoring & pengelolaan CCTV toko",
    icon: "cctv",
    accent: "blue",
    active: true,
    roles: ["ADMIN", "IT_STORE"]
  },
  {
    key: "kpi",
    label: "KPI",
    description: "Key Performance Indicator",
    icon: "kpi",
    accent: "teal",
    active: false,
    roles: null
  },
  {
    key: "aho",
    label: "AHO",
    description: "Asset & Hardware Operation",
    icon: "aho",
    accent: "amber",
    active: false,
    roles: null
  },
  {
    key: "manage-pc",
    label: "Manage PC",
    description: "Kaspersky · ITAM · KACE dalam satu menu",
    icon: "pc",
    accent: "purple",
    active: true,
    path: "/manage-pc",
    /* Menu tidak dihilangkan untuk login Office/Store - mereka membuka
       halaman Manage PC dengan lingkup miliknya (tanpa tab Office/Store). */
    roles: ["ADMIN", "IT_OFFICE", "IT_STORE"]
  },
  {
    key: "nms",
    label: "NMS",
    description: "Network monitoring system",
    icon: "nms",
    accent: "rose",
    active: false,
    roles: null
  },

  {
    key: "checklist",
    label: "Checklist",
    description: "Operational IT checklist",
    icon: "checklist",
    accent: "amber",
    active: false,
    roles: null
  }
];

export function renderDashboardPage(container) {
  const session = getSession();

  if (!session) return;

  const visibleModules = MODULE_SUMMARY.filter(
    (module) => isVisibleForRole(module, session.role)
  );

  const activeModules = visibleModules.filter(
    (module) => module.active
  );

  const pendingModules = visibleModules.filter(
    (module) => !module.active
  );

  const activeCount = activeModules.length;
  const totalCount = visibleModules.length;

  const percentage =
    totalCount > 0
      ? Math.round((activeCount / totalCount) * 100)
      : 0;

  const moduleCards = visibleModules
    .map((module) => renderModuleCard(module))
    .join("");

  const contentHtml = `
    <div class="dashboard-page">

      <!-- ==========================================
           HERO
      =========================================== -->

      <section class="dashboard-hero">

        <div class="dashboard-hero__content">

          <div class="dashboard-hero__eyebrow">
            <span class="dashboard-status-dot"></span>
            IT PLATFORM
          </div>

          <h2>
            Selamat Datang,
            <span>${escapeHtml(getDisplayName(session))}</span>
          </h2>

          <p>
            Pantau dan kelola kebutuhan IT Anda
            dari satu tempat.
          </p>

        </div>

        <div class="dashboard-hero__visual">

          <div class="hero-ring hero-ring--one"></div>
          <div class="hero-ring hero-ring--two"></div>

          <div class="hero-orb">
            ${icon("monitor", { size: 28 })}
          </div>

        </div>

      </section>


      <!-- ==========================================
           QUICK STATS
      =========================================== -->

      <section class="dashboard-stats">

        <div class="dashboard-stat dashboard-stat--primary">

          <div class="dashboard-stat__icon">
            ${icon("grid", { size: 19 })}
          </div>

          <div class="dashboard-stat__content">
            <span>Total Modul</span>
            <strong>${totalCount}</strong>
            <small>Module tersedia</small>
          </div>

        </div>


        <div class="dashboard-stat">

          <div class="dashboard-stat__icon dashboard-stat__icon--green">
            ${icon("check", { size: 19 })}
          </div>

          <div class="dashboard-stat__content">
            <span>Modul Aktif</span>
            <strong>${activeCount}</strong>
            <small>Siap digunakan</small>
          </div>

        </div>


        <div class="dashboard-stat">

          <div class="dashboard-stat__icon dashboard-stat__icon--amber">
            ${icon("clock", { size: 19 })}
          </div>

          <div class="dashboard-stat__content">
            <span>Segera Hadir</span>
            <strong>${pendingModules.length}</strong>
            <small>Dalam pengembangan</small>
          </div>

        </div>


        <div class="dashboard-stat dashboard-stat--status">

          <div class="dashboard-stat__progress">

            <div
              class="dashboard-stat__progress-ring"
              style="--progress:${percentage * 3.6}deg"
            >
              <div>
                <strong>${percentage}%</strong>
              </div>
            </div>

          </div>

          <div class="dashboard-stat__content">
            <span>Platform Ready</span>
            <strong class="dashboard-ready">
              ${activeCount > 0 ? "Online" : "Preparing"}
            </strong>
            <small>System availability</small>
          </div>

        </div>

      </section>


      <!-- ==========================================
           MAIN CONTENT
      =========================================== -->

      <section class="dashboard-main-grid">

        <div class="dashboard-modules-panel">

          <div class="dashboard-section-header">

            <div>
              <span class="dashboard-section-kicker">
                APPLICATIONS
              </span>

              <h3>IT Modules</h3>

              <p>
                Akses modul yang tersedia untuk akun Anda.
              </p>
            </div>

            <div class="dashboard-module-count">
              ${totalCount} Modules
            </div>

          </div>


          <div class="dashboard-module-grid">
            ${moduleCards}
          </div>

        </div>


        <!-- STATUS PANEL -->

        <aside class="dashboard-status-panel">

          <div class="dashboard-status-panel__top">

            <div>
              <span class="dashboard-section-kicker">
                OVERVIEW
              </span>

              <h3>Platform Status</h3>
            </div>

            <div class="dashboard-status-badge">
              <span></span>
              Healthy
            </div>

          </div>


          <div class="dashboard-status-circle">

            <div
              class="dashboard-status-circle__ring"
              style="--progress:${percentage * 3.6}deg"
            >
              <div class="dashboard-status-circle__inner">

                <strong>${percentage}%</strong>

                <span>Ready</span>

              </div>
            </div>

          </div>


          <div class="dashboard-status-list">

            <div class="dashboard-status-row">

              <span>
                <i class="status-indicator status-indicator--green"></i>
                Active
              </span>

              <strong>${activeCount}</strong>

            </div>


            <div class="dashboard-status-row">

              <span>
                <i class="status-indicator status-indicator--gray"></i>
                Coming Soon
              </span>

              <strong>${pendingModules.length}</strong>

            </div>


            <div class="dashboard-status-row">

              <span>
                <i class="status-indicator status-indicator--blue"></i>
                Total
              </span>

              <strong>${totalCount}</strong>

            </div>

          </div>

        </aside>

      </section>


      <!-- ==========================================
           USER INFO
      =========================================== -->

      <section class="dashboard-user-card">

        <div class="dashboard-user-card__avatar">
          ${escapeHtml(getInitials(session.nik))}
        </div>

        <div class="dashboard-user-card__info">

          <span>LOGGED IN AS</span>

          <strong>
            ${escapeHtml(session.role)}
          </strong>

          <small>
            NIK ${escapeHtml(session.nik)}
          </small>

        </div>

        <div class="dashboard-user-card__secure">
          ${icon("shield", { size: 16 })}
          <span>Secure Session</span>
        </div>

      </section>

    </div>
  `;

  renderShell(container, {
    activeKey: "dashboard",
    pageTitle: "Dashboard",
    contentHtml
  });
}


/* =========================================================
   MODULE CARD
   ========================================================= */

function renderModuleCard(module) {

  return `
    <a
      href="${module.active ? `#${module.path || `/${module.key}`}` : "javascript:void(0)"}"
      class="
        dashboard-module-card
        dashboard-module-card--${module.accent}
        ${module.active ? "is-active" : "is-disabled"}
      "
    >

      <div class="dashboard-module-card__top">

        <div class="dashboard-module-card__icon">
          ${icon(module.icon, { size: 21 })}
        </div>

        <span
          class="
            dashboard-module-card__status
            ${module.active
              ? "dashboard-module-card__status--active"
              : ""}
          "
        >
          ${module.active ? "Active" : "Coming Soon"}
        </span>

      </div>


      <div class="dashboard-module-card__body">

        <h4>
          ${escapeHtml(module.label)}
        </h4>

        <p>
          ${escapeHtml(module.description)}
        </p>

      </div>


      <div class="dashboard-module-card__arrow">

        ${module.active
          ? icon("arrow-right", { size: 17 })
          : icon("lock", { size: 15 })}

      </div>

    </a>
  `;
}


/* =========================================================
   HELPERS
   ========================================================= */

function getDisplayName(session) {

  /*
   * Session saat ini belum menyimpan nama user.
   * Untuk sementara gunakan role.
   *
   * Ketika backend nanti mengembalikan name,
   * otomatis akan menggunakan nama tersebut.
   */

  return session.name
    ? session.name
    : session.role === "IT_STORE"
      ? "IT Store"
      : session.role === "IT_OFFICE"
        ? "IT Office"
        : "Administrator";
}


function getInitials(text) {

  const clean =
    (text || "")
      .toString()
      .trim();

  return clean.substring(0, 2).toUpperCase();
}


function escapeHtml(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value == null
      ? ""
      : String(value);

  return div.innerHTML;
}