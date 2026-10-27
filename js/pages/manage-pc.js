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
import {
  getManagePcSummaryCache,
  loadManagePcSummaryCached
} from "../manage-pc-cache.js";

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
      { label: "Manage", icon: "check" },
      { label: "Not Manage", icon: "alert" }
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
      { label: "Manage", icon: "check" },
      { label: "Not Manage", icon: "alert" }
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
      { label: "Manage", icon: "check" },
      { label: "Not Manage", icon: "alert" }
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
  // Bila accessibleScopes <= 1 (mis. login IT_OFFICE atau IT_STORE), tab dihilangkan total
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
    : "";

  const scopeDescription = activeScope === "store"
    ? "Data Store akan menyusul setelah sumber data dihubungkan."
    : `Data perangkat ${module.scopes.office.replace(/^.*?lingkup /i, "")}`;

  // Jika tidak ada tab (non-ADMIN), tampilkan p langsung tanpa wrapper scope-bar jika tidak diperlukan, atau scope-bar sederhana
  return `
    <header class="mpc-scope-bar${accessibleScopes.length <= 1 ? " mpc-scope-bar--no-tabs" : ""}">
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

function renderMetricValue(value, isLoading) {
  if (isLoading) return '<span class="skeleton metric-skeleton" aria-label="Memuat nilai"></span>';
  return value == null ? "&mdash;" : Number(value).toLocaleString();
}

function renderSummaryCardItem(iconName, title, desc, stats, footerText, accent = "blue", infoHtml = "") {
  /* Kartu tanpa tujuan klik tidak perlu footer (teks + panah). */
  const footer = footerText
    ? `
      <div class="gsp-card__footer">
        <span>${escapeHtml(footerText)}</span>
        ${icon("arrow-right", { size: 16 })}
      </div>`
    : "";

  const info = infoHtml
    ? `<div class="gsp-card__info">${infoHtml}</div>`
    : "";

  return `
    <article class="gsp-card gsp-card--${accent}">
      <div class="gsp-card__header">
        <div class="gsp-card__icon">${icon(iconName, { size: 21 })}</div>
        <div class="gsp-card__body">
          <h4>${escapeHtml(title)}</h4>
          <p>${escapeHtml(desc)}</p>
        </div>
      </div>
      <div class="gsp-card__stats${stats.hasPercent ? " gsp-card__stats--4" : ""}">${stats.html}</div>
      ${info}
      ${footer}
    </article>
  `;
}

/**
 * Blok informasi Kaspersky (Versi / Agent / Server) di bawah statistik kartu.
 * Nilainya dari backend: SOURCE kolom S (versi) dan R (agent); server tetap.
 */
function renderKasperskyInfo(info = {}, isLoading = false) {
  const rows = [
    { iconName: "kaspersky", label: "Versi Kaspersky", value: info.version },
    { iconName: "shield", label: "Agent Kaspersky", value: info.agent },
    { iconName: "server", label: "Server Kaspersky", value: info.server || "kscoffice.sat.co.id" }
  ];
  return rows.map((row) => `
    <div class="gsp-card__info-row">
      <span class="gsp-card__info-label">${icon(row.iconName, { size: 14 })}<span>${escapeHtml(row.label)}</span></span>
      <span class="gsp-card__info-value">${isLoading
        ? '<span class="skeleton" style="width:72px;height:12px;display:inline-block" aria-label="Memuat nilai"></span>'
        : escapeHtml(row.value || "—")}</span>
    </div>
  `).join("");
}

/**
 * Render satu kotak statistik persen.
 * Nilai persen sudah dihitung backend dari gabungan KAV + Versi.
 */
function renderPercentStat(value, isLoading) {
  const body = isLoading
    ? '<span class="skeleton metric-skeleton" aria-label="Memuat nilai"></span>'
    : value == null || !Number.isFinite(Number(value))
      ? "&mdash;"
      : `${Number(value).toLocaleString("id-ID")}%`;
  return `
    <div class="gsp-card__stat">
      <small>Persen</small>
      <strong>${body}</strong>
    </div>
  `;
}

function renderSummary(data, moduleKey, isLoading = false) {
  const isError = data && data.success === false && data.message;
  const d = data?.data || data || {};
  const totalPc = d.summary?.totalPc ?? d.totalUser ?? (isLoading ? null : 0);

  const makeStats = (statList, extraStat = "") => ({
    html: statList.map(([label, val]) => `
      <div class="gsp-card__stat">
        <small>${escapeHtml(label)}</small>
        <strong>${renderMetricValue(val, isLoading)}</strong>
      </div>
    `).join("") + extraStat,
    hasPercent: Boolean(extraStat)
  });

  // Submenu Kaspersky: 2 kotak (Kaspersky & Versi Kaspersky) persis menu utama
  if (moduleKey === "manage-pc-kaspersky") {
    const kavOk = d.kaspersky?.ok ?? (isLoading ? null : 0);
    const kavNok = d.kaspersky?.nok ?? (totalPc != null && kavOk != null ? totalPc - kavOk : (isLoading ? null : 0));
    const verOk = d.kaspersky?.versionOk ?? (isLoading ? null : 0);
    const verNok = d.kaspersky?.versionNok ?? (totalPc != null && verOk != null ? totalPc - verOk : (isLoading ? null : 0));
    /* Persen gabungan: hanya device dengan KAV OK DAN Versi OK yang dihitung. */
    const kavPercent = d.kaspersky?.percent ?? (isLoading ? null : 0);
    const kavInfo = d.kaspersky?.info || {};
    const kavInfoHtml = renderKasperskyInfo(kavInfo, isLoading);

    return `
      <section class="gsp-cards gsp-cards--kaspersky" data-mpc-summary aria-live="polite">
        ${isError ? `<p class="mpc-summary__error" role="alert">${escapeHtml(data.message)}</p>` : ""}
        ${renderSummaryCardItem("kaspersky", "Kaspersky", "Endpoint Security - proteksi, update database & compliance.", makeStats([["Total Device", totalPc], ["Manage", kavOk], ["Not Manage", kavNok]], renderPercentStat(kavPercent, isLoading)), null, "blue", kavInfoHtml)}
        ${renderSummaryCardItem("kaspersky", "Versi Kaspersky", "Memastikan Versi Kaspersky selalu up to date.", makeStats([["Total Device", totalPc], ["Version OK", verOk], ["Version NOK", verNok]], renderPercentStat(kavPercent, isLoading)), null, "blue", kavInfoHtml)}
      </section>
    `;
  }

  // Submenu ITAM: 2 kotak (ITAM & Privilege ITAM)
  if (moduleKey === "manage-pc-itam") {
    const itamOk = d.itam?.ok ?? (isLoading ? null : 0);
    const itamNok = d.itam?.nok ?? (totalPc != null && itamOk != null ? totalPc - itamOk : (isLoading ? null : 0));
    const privOk = d.itam?.privilegeOk ?? (isLoading ? null : 0);
    const privNok = d.itam?.privilegeNok ?? (totalPc != null && privOk != null ? totalPc - privOk : (isLoading ? null : 0));

    return `
      <section class="gsp-cards gsp-cards--kaspersky" data-mpc-summary aria-live="polite">
        ${isError ? `<p class="mpc-summary__error" role="alert">${escapeHtml(data.message)}</p>` : ""}
        ${renderSummaryCardItem("itam", "ITAM", "IT Asset Management - inventaris & lifecycle aset.", makeStats([["Total Device", totalPc], ["Manage", itamOk], ["Not Manage", itamNok]]), "Status Inventaris Aset", "teal")}
        ${renderSummaryCardItem("itam", "Privilege ITAM", "Status OK dan NOK privilege ITAM pada seluruh device.", makeStats([["Total Device", totalPc], ["Privilege OK", privOk], ["Privilege NOK", privNok]]), "Status Hak Akses ITAM", "teal")}
      </section>
    `;
  }

  // Submenu KACE: 1 kotak (KACE)
  if (moduleKey === "manage-pc-kace") {
    const kaceOk = d.kace?.ok ?? (isLoading ? null : 0);
    const kaceNok = d.kace?.nok ?? (totalPc != null && kaceOk != null ? totalPc - kaceOk : (isLoading ? null : 0));

    return `
      <section class="gsp-cards gsp-cards--kaspersky" data-mpc-summary aria-live="polite">
        ${isError ? `<p class="mpc-summary__error" role="alert">${escapeHtml(data.message)}</p>` : ""}
        ${renderSummaryCardItem("kace", "KACE", "Systems Deployment - deployment OS, agent & otomasi.", makeStats([["Total Device", totalPc], ["Manage", kaceOk], ["Not Manage", kaceNok]]), "Status Deployment KACE", "purple")}
      </section>
    `;
  }

  // Fallback untuk Overview (manage-pc)
  let managed = d.kaspersky?.ok || d.summary?.managed || 0;
  let nok = d.kaspersky?.nok || d.summary?.nok || 0;

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
      ${renderStat("Total Device", totalPc, "monitor")}
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

  const cachedSummary = activeScope === "office"
    ? getManagePcSummaryCache(activeScope, session)
    : null;
  const summaryHtml = activeScope === "store"
    ? renderScopePending()
    : renderSummary(
        cachedSummary ? { success: true, data: cachedSummary } : null,
        module.key,
        !cachedSummary
      );

  const contentHtml = `
    <div class="mpc-page">
      ${renderPageHeader(module, accessibleScopes, activeScope)}
      ${summaryHtml}
      ${renderScopePanel(module, activeScope)}
    </div>
  `;

  renderShell(container, {
    activeKey: routeInfo.key,
    pageTitle: "Manage PC",
    contentHtml
  });

  if (activeScope !== "office" || cachedSummary) return;

  loadManagePcSummaryCached(activeScope, session)
    .then((result) => {
      const summaryElement = container.querySelector("[data-mpc-summary]");
      if (summaryElement) {
        summaryElement.outerHTML = renderSummary(result.success ? result.data : result, module.key, false);
      }
    })
    .catch((error) => {
      const summaryElement = container.querySelector("[data-mpc-summary]");
      if (summaryElement) {
        summaryElement.outerHTML = renderSummary({
          success: false,
          message: error.message || "Ringkasan Manage PC gagal dimuat."
        }, module.key, false);
      }
    });
}