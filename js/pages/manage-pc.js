/**
 * PAGES/MANAGE-PC.JS - HALAMAN MANAGE PC (Kaspersky / ITAM / KACE)
 * ----------------------------------------------------------------
 * Restrukturisasi menu: Kaspersky & ITAM (plus KACE) tidak lagi menjadi
 * menu utama terpisah - semuanya digabung ke SATU menu "Manage PC"
 * (lihat js/nav-config.js). Scope Office/Store yang dulu menjadi submenu
 * sidebar kini menjadi TAB di dalam halaman (pola dashboard modern)
 * supaya sidebar tetap ringkas.
 *
 * Perilaku tab:
 * - Scope aktif disimpan di hash query (?scope=office|store) supaya
 *   deep-linkable: refresh / back button tetap berada di tab yang sama.
 * - ADMIN melihat kedua tab. IT_STORE / IT_OFFICE (bila nantinya diberi
 *   akses ke modul ini) langsung ke scope sesuai login - tanpa tab.
 * - Konten masih placeholder, tetapi struktur halaman sudah final: saat
 *   backend modul siap, cukup ganti isi panel per scope tanpa menyentuh
 *   shell, router, atau nav-config.
 */

import { renderShell } from "../shell.js";
import { getSession } from "../auth.js";
import { getQueryParam } from "../router.js";
import { icon } from "../icons.js";
import { loadManagePcSummary } from "../api.js";

/**
 * Konfigurasi modul di bawah menu Manage PC.
 * Urutan property = urutan tab modul di control bar halaman.
 */
const MANAGE_PC_MODULES = {
  "manage-pc": {
    key: "manage-pc",
    label: "Manage PC",
    path: "/manage-pc",
    icon: "pc",
    accent: "blue",
    kicker: "Overview",
    title: "PC Management Overview",
    subtitle: "Ringkasan status pengelolaan seluruh perangkat PC.",
    stats: [
      { label: "Total Device", icon: "monitor" },
      { label: "Managed", icon: "check" },
      { label: "NOK", icon: "alert" }
    ],
    features: [
      "Monitoring status Kaspersky",
      "Inventarisasi Aset (ITAM)",
      "Deployment & Otomasi (KACE)"
    ],
    scopes: {
      office: "Monitoring status pengelolaan PC di lingkup Head Office.",
      store: "Monitoring status pengelolaan PC di seluruh Store."
    }
  },

  "manage-pc-kaspersky": {
    key: "manage-pc-kaspersky",
    label: "Kaspersky",
    path: "/manage-pc/kaspersky",
    icon: "kaspersky",
    accent: "blue",
    kicker: "Endpoint Security",
    title: "Kaspersky Security Center",
    subtitle: "Monitoring proteksi, update database, dan compliance endpoint PC.",
    stats: [
      { label: "Total Device", icon: "monitor" },
      { label: "Managed", icon: "check" },
      { label: "NOK", icon: "alert" }
    ],
    features: [
      "Status proteksi & compliance tiap endpoint",
      "Distribusi update database & security patch",
      "Rekap alert risiko keamanan per perangkat"
    ],
    scopes: {
      office: "Kelola status proteksi dan update security endpoint PC di lingkup Head Office.",
      store: "Kelola status proteksi dan update security endpoint PC di seluruh Store."
    }
  },

  "manage-pc-itam": {
    key: "manage-pc-itam",
    label: "ITAM",
    path: "/manage-pc/itam",
    icon: "itam",
    accent: "teal",
    kicker: "Asset Management",
    title: "IT Asset Management",
    subtitle: "Inventarisasi, kepemilikan, dan lifecycle aset PC & hardware.",
    stats: [
      { label: "Total Device", icon: "monitor" },
      { label: "Managed", icon: "check" },
      { label: "NOK", icon: "alert" }
    ],
    features: [
      "Inventaris hardware & software per perangkat",
      "Riwayat mutasi, perbaikan, dan penggantian aset",
      "Status kepemilikan, lokasi, dan warranty"
    ],
    scopes: {
      office: "Inventarisasi & lifecycle aset IT di lingkup Head Office.",
      store: "Inventarisasi & lifecycle aset IT di seluruh Store."
    }
  },

  "manage-pc-kace": {
    key: "manage-pc-kace",
    label: "KACE",
    path: "/manage-pc/kace",
    icon: "kace",
    accent: "purple",
    kicker: "Systems Deployment",
    title: "Quest KACE",
    subtitle: "Deployment, inventory agent, dan otomasi perangkat PC.",
    stats: [
      { label: "Total Device", icon: "monitor" },
      { label: "Managed", icon: "check" },
      { label: "NOK", icon: "alert" }
    ],
    features: [
      "Deployment OS & aplikasi secara massal",
      "Inventory agent & scripting terjadwal",
      "Konfigurasi dan antrian service perangkat"
    ],
    scopes: {
      office: "Deployment & otomasi perangkat PC di lingkup Head Office.",
      store: "Deployment & otomasi perangkat PC di seluruh Store."
    }
  }
};

/**
 * Scope yang bisa diakses sesuai role login.
 * ADMIN bebas memilih Office/Store; role lain (bila nanti diberi akses
 * ke modul Manage PC) langsung diarahkan ke scope miliknya - tanpa tab.
 * @param {string} role
 * @returns {string[]} daftar scope key
 */
function getAccessibleScopes(role) {
  if (role === "ADMIN") return ["office", "store"];
  if (role === "IT_STORE") return ["store"];
  if (role === "IT_OFFICE") return ["office"];
  return [];
}

const SCOPE_META = {
  office: { key: "office", label: "Office", icon: "office" },
  store: { key: "store", label: "Store", icon: "store" }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==============================================================
   BAGIAN HALAMAN
   ============================================================== */

function renderPageHeader(module, accessibleScopes, activeScope) {
  const scopeTabs = accessibleScopes.length > 1
    ? `
      <nav class="mpc-scope-tabs" role="tablist" aria-label="Lingkup Manage PC">
        ${accessibleScopes.map((scopeKey) => {
          const meta = SCOPE_META[scopeKey];
          const isActive = scopeKey === activeScope;
          return `
            <a
              href="#${module.path}?scope=${scopeKey}"
              class="mpc-scope-tab${isActive ? " is-active" : ""}"
              role="tab"
              aria-selected="${isActive}"
              ${isActive ? 'aria-current="page"' : ""}
            >
              ${icon(meta.icon, { size: 17 })}
              <span>${escapeHtml(meta.label)}</span>
            </a>
          `;
        }).join("")}
      </nav>
    `
    : `
      <div class="mpc-scope-tabs mpc-scope-tabs--single" aria-label="Lingkup Manage PC">
        ${icon(SCOPE_META[activeScope].icon, { size: 17 })}
        <span>${escapeHtml(SCOPE_META[activeScope].label)}</span>
      </div>
    `;

  const scopeDescription = activeScope === "store"
    ? "Data Store akan menyusul setelah sumber data dihubungkan."
    : `Data perangkat ${module.scopes.office.replace(/^.*?lingkup /i, "")}`;

  return `
    <header class="mpc-scope-bar">
      ${scopeTabs}
      <p>${escapeHtml(scopeDescription)}</p>
    </header>
  `;
}

/**
 * Control bar halaman:
 * - kiri  : tab modul (Kaspersky / ITAM / KACE) - ganti modul tanpa
 *           membuka submenu sidebar.
 * - kanan : segmented control Office/Store (ADMIN) atau chip statis
 *           untuk role yang hanya punya satu scope.
 */

function renderScopePending() {
  return `
    <section class="mpc-summary mpc-summary--pending" data-mpc-summary aria-live="polite">
      <span class="mpc-summary__pending-icon">${icon("info", { size: 17 })}</span>
      <p>Struktur halaman Store sudah siap. Data Store akan ditampilkan setelah sumber datanya dihubungkan.</p>
    </section>
  `;
}

function renderSummary(data, moduleKey, isLoading = false) {
  const isError = data && !data.success && data.message;
  let total = 0, managed = 0, nok = 0;

  if (!isLoading && data && data.success) {
    const d = data.data;
    total = d.totalUser || 0;

    if (moduleKey === "manage-pc-kaspersky") {
      managed = d.kaspersky?.ok || 0;
      nok = d.kaspersky?.nok || 0;
    } else if (moduleKey === "manage-pc-itam") {
      managed = d.itam?.ok || 0;
      nok = d.itam?.nok || 0;
    } else if (moduleKey === "manage-pc-kace") {
      managed = d.kace?.ok || 0;
      nok = d.kace?.nok || 0;
    } else {
      // Main Manage PC (manage-pc) - Default Kaspersky as reference
      managed = d.kaspersky?.ok || 0;
      nok = total - managed;
    }
  }

  const renderStat = (label, value, iconName) => `
    <article class="mpc-stat">
      <div class="mpc-stat__top">
        <span class="mpc-stat__label">${escapeHtml(label)}</span>
        <div class="mpc-stat__icon">${icon(iconName, { size: 16 })}</div>
      </div>
      <span class="mpc-stat__value">
        ${isLoading ? '<span class="skeleton" style="width:60%; height:32px; display:inline-block"></span>' : Number(value).toLocaleString()}
      </span>
    </article>
  `;

  return `
    <div class="mpc-stats" data-mpc-summary aria-live="polite">
      ${isError ? `<p class="mpc-summary__error" role="alert">${escapeHtml(data.message)}</p>` : ""}
      ${renderStat("Total Device", total, "monitor")}
      ${renderStat("Managed", managed, "check")}
      ${renderStat("NOK", nok, "alert")}
    </div>
  `;
}


/* Panel konten utama per (modul + scope). Saat backend modul siap,
   bagian inilah yang diganti dengan tabel/detail yang sesungguhnya. */
function renderScopePanel(module, activeScope) {
  const scopeMeta = SCOPE_META[activeScope];
  const scopeDescription = module.scopes[activeScope] || "";

  const featureItems = module.features
    .map((feature) => `
      <div class="mpc-feature">
        <span class="mpc-feature__check">${icon("check", { size: 13 })}</span>
        <span>${escapeHtml(feature)}</span>
      </div>
    `)
    .join("");

  return `
    <section class="mpc-panel">
      <div class="mpc-panel__header">
        <div class="mpc-panel__iconchip mpc-panel__iconchip--${module.accent}">
          ${icon(module.icon, { size: 22 })}
        </div>
        <div class="mpc-panel__heading">
          <h3>${escapeHtml(module.label)} · ${escapeHtml(scopeMeta.label)}</h3>
          <p>${escapeHtml(scopeDescription)}</p>
        </div>
        <span class="mpc-panel__badge">
          <span class="mpc-panel__badge-dot"></span>
          Dalam Pengembangan
        </span>
      </div>

      <div class="mpc-panel__grid">
        <div class="mpc-feature-list">
          <p class="mpc-feature-list__title">Yang akan dikelola di modul ini</p>
          ${featureItems}
        </div>

        <div class="mpc-preview">
          <p class="mpc-preview__title">Pratinjau struktur data</p>
          <div class="skeleton skeleton-text" style="width: 68%;"></div>
          <div class="skeleton skeleton-text" style="width: 92%;"></div>
          <div class="skeleton skeleton-text" style="width: 57%;"></div>
          <div class="skeleton skeleton-text" style="width: 82%;"></div>
          <p class="mpc-preview__hint">
            Tabel &amp; ringkasan data ${escapeHtml(scopeMeta.label)} akan tampil di sini.
          </p>
        </div>
      </div>

      <div class="mpc-note">
        ${icon("info", { size: 16 })}
        <span>
          Modul <strong>${escapeHtml(module.label)}</strong> sedang dalam pengembangan &mdash;
          struktur halaman (tab Office/Store) sudah siap; data &amp; aksi nyata
          diaktifkan pada fase berikutnya tanpa mengubah navigasi.
        </span>
      </div>
    </section>
  `;
}

/**
 * Render halaman Manage PC sesuai route aktif.
 * @param {HTMLElement} container
 * @param {{key: string, label: string, path: string, parentKey: string,
 *          parentLabel: string}} routeInfo - item flat route dari nav-config.
 */
export function renderManagePcPage(container, routeInfo) {
  const session = getSession();
  if (!session) return;

  const module = MANAGE_PC_MODULES[routeInfo.key];
  if (!module) return;

  const accessibleScopes = getAccessibleScopes(session.role);
  if (accessibleScopes.length === 0) return;

  /* Scope dari hash query (?scope=store); kalau tidak ada / tidak
     berhak, pakai scope pertama yang bisa diakses role ini. */
  const requestedScope = getQueryParam("scope");
  const activeScope = accessibleScopes.includes(requestedScope)
    ? requestedScope
    : accessibleScopes[0];

  const contentHtml = `
    <div class="mpc-page">
      ${renderPageHeader(module, accessibleScopes, activeScope)}
      ${activeScope === "store" ? renderScopePending() : renderSummary(null, module.key, true)}
      ${renderScopePanel(module, activeScope)}
    </div>
  `;

  renderShell(container, {
    activeKey: routeInfo.key,
    pageTitle: "Manage PC",
    contentHtml
  });

  if (activeScope !== "office") return;

  loadManagePcSummary(activeScope, { sessionToken: session.sessionToken })
    .then((result) => {
      const summaryElement = container.querySelector("[data-mpc-summary]");
      if (summaryElement) {
        summaryElement.outerHTML = renderSummary(result.success ? result.data : result, module.key);
      }
    })
    .catch((error) => {
      const summaryElement = container.querySelector("[data-mpc-summary]");
      if (summaryElement) {
        summaryElement.outerHTML = renderSummary({
          message: error.message || "Ringkasan Manage PC gagal dimuat."
        }, module.key);
      }
    });
}