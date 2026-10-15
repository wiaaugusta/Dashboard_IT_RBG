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
      { label: "Protected", icon: "shield" },
      { label: "Threat", icon: "alert" }
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
      { label: "Total Asset", icon: "monitor" },
      { label: "Ter-Assign", icon: "user" },
      { label: "Perlu Verifikasi", icon: "clock" }
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
      { label: "Deployed", icon: "check" },
      { label: "Antrian Service", icon: "clock" }
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

function renderHero(module) {
  return `
    <section class="mpc-hero">
      <div class="mpc-hero__content">
        <div class="mpc-hero__icon">${icon(module.icon, { size: 26 })}</div>
        <div class="mpc-hero__text">
          <div class="mpc-hero__crumbs">
            <a href="#/dashboard">Home</a>
            <span class="mpc-hero__crumb-sep">${icon("chevron", { size: 12 })}</span>
            <span>Manage PC</span>
            <span class="mpc-hero__crumb-sep">${icon("chevron", { size: 12 })}</span>
            <span class="mpc-hero__crumb-current">${escapeHtml(module.label)}</span>
          </div>
          <h2 class="mpc-hero__title">${escapeHtml(module.title)}</h2>
          <p class="mpc-hero__subtitle">${escapeHtml(module.subtitle)}</p>
        </div>
      </div>
      <div class="mpc-hero__badge">
        <span class="mpc-hero__badge-dot"></span>
        ${escapeHtml(module.kicker)}
      </div>
    </section>
  `;
}

/**
 * Control bar halaman:
 * - kiri  : tab modul (Kaspersky / ITAM / KACE) - ganti modul tanpa
 *           membuka submenu sidebar.
 * - kanan : segmented control Office/Store (ADMIN) atau chip statis
 *           untuk role yang hanya punya satu scope.
 */
function renderControlBar(module, accessibleScopes, activeScope) {
  const moduleTabs = Object.values(MANAGE_PC_MODULES)
    .map((m) => `
      <a
        href="#${m.path}?scope=${activeScope}"
        class="mpc-module-tab${m.key === module.key ? " is-active" : ""}"
        ${m.key === module.key ? 'aria-current="page"' : ""}
      >
        ${icon(m.icon, { size: 16 })}
        <span>${escapeHtml(m.label)}</span>
      </a>
    `)
    .join("");

  let scopeControl;

  if (accessibleScopes.length > 1) {
    const scopeTabs = accessibleScopes
      .map((scopeKey) => {
        const meta = SCOPE_META[scopeKey];
        const isActive = scopeKey === activeScope;
        return `
          <a
            href="#${module.path}?scope=${scopeKey}"
            class="mpc-scope-tab${isActive ? " is-active" : ""}"
            role="tab"
            aria-selected="${isActive}"
          >
            ${icon(meta.icon, { size: 15 })}
            <span>${escapeHtml(meta.label)}</span>
          </a>
        `;
      })
      .join("");

    scopeControl = `
      <div class="mpc-scope-switch" role="tablist" aria-label="Lingkup data">
        ${scopeTabs}
      </div>
    `;
  } else {
    const meta = SCOPE_META[accessibleScopes[0]];
    scopeControl = `
      <span class="mpc-scope-chip">
        ${icon(meta.icon, { size: 15 })}
        <span>Lingkup ${escapeHtml(meta.label)}</span>
      </span>
    `;
  }

  return `
    <div class="mpc-controlbar">
      <nav class="mpc-module-tabs" aria-label="Modul Manage PC">${moduleTabs}</nav>
      ${scopeControl}
    </div>
  `;
}

function renderSummary(data) {
  if (!data) {
    return `
      <section class="mpc-summary" data-mpc-summary aria-live="polite">
        <p class="mpc-summary__hint">Memuat ringkasan Manage PC...</p>
      </section>
    `;
  }

  if (!data.summary) {
    return `
      <section class="mpc-summary" data-mpc-summary aria-live="polite">
        <p class="mpc-summary__hint" role="alert">${escapeHtml(data.message || "Ringkasan Manage PC gagal dimuat.")}</p>
      </section>
    `;
  }

  const summary = data.summary;

  const totalPc = summary.totalPc ?? 0;
  const totalManage = summary.totalManage ?? 0;
  const totalNok = summary.totalNok ?? 0;

  const moduleLines = (summary.modules || [])
    .map((m) => `
      <div class="mpc-summary__module">
        <span class="mpc-summary__module-label">${escapeHtml(m.label)}</span>
        <span class="mpc-summary__module-digits">
          <span>${m.ok != null ? m.ok.toLocaleString() : ""} OK</span>
          <span>${m.nok != null ? m.nok.toLocaleString() : ""} NOK</span>
        </span>
      </div>
    `)
    .join("");

  return `
    <section class="mpc-summary" data-mpc-summary aria-live="polite">
      <div class="mpc-summary__cards">
        <div class="mpc-summary__card mpc-summary__card--total">
          <span class="mpc-summary__label">Total PC</span>
          <strong class="mpc-summary__value">${totalPc.toLocaleString()}</strong>
        </div>
        <div class="mpc-summary__card mpc-summary__card--manage">
          <span class="mpc-summary__label">Total Terkelola</span>
          <strong class="mpc-summary__value">${totalManage.toLocaleString()}</strong>
        </div>
        <div class="mpc-summary__card mpc-summary__card--nok">
          <span class="mpc-summary__label">Total NOK</span>
          <strong class="mpc-summary__value">${totalNok.toLocaleString()}</strong>
          <small class="mpc-summary__hint">Status belum "OK"</small>
        </div>
      </div>

      ${moduleLines ? `<div class="mpc-summary__modules">${moduleLines}</div>` : ""}
    </section>
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
      ${renderHero(module)}
      ${renderControlBar(module, accessibleScopes, activeScope)}
      ${renderSummary(null)}
      ${renderScopePanel(module, activeScope)}
    </div>
  `;

  renderShell(container, {
    activeKey: routeInfo.key,
    pageTitle: `Manage PC · ${module.label}`,
    contentHtml
  });

  loadManagePcSummary(activeScope, { sessionToken: session.sessionToken })
    .then((result) => {
      const summaryElement = container.querySelector("[data-mpc-summary]");
      if (summaryElement) {
        summaryElement.outerHTML = renderSummary(result.success ? result.data : result);
      }
    })
    .catch((error) => {
      const summaryElement = container.querySelector("[data-mpc-summary]");
      if (summaryElement) {
        summaryElement.outerHTML = renderSummary({
          message: error.message || "Ringkasan Manage PC gagal dimuat."
        });
      }
    });
}