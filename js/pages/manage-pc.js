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
  getManagePcKasperskyCache,
  getManagePcItamCache,
  getManagePcKaceCache,
  getManagePcSummaryCache,
  loadManagePcKasperskyCached,
  loadManagePcItamCached,
  loadManagePcKaceCached,
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

/* Tabel endpoint Kaspersky (MASTER REPORT OFFICE blok B203:K400).
   Urutan kolom mengikuti sheet; STATUS sudah berisi keterangan dari kolom K
   dan hanya diwarnai di frontend. */
const KASPERSKY_TABLE_PAGE_SIZE = 15;
const KASPERSKY_TABLE_COLUMNS = [
  { key: "no", label: "No", sortable: false },
  { key: "namaKomputer", label: "Nama Komputer" },
  { key: "alamatIp", label: "Alamat IP" },
  { key: "workgroup", label: "Workgroup" },
  { key: "versionKes", label: "Version KES" },
  { key: "agentVersion", label: "Agent version" },
  { key: "model", label: "Model" },
  { key: "sistemOperasi", label: "Sistem Operasi" },
  { key: "lastConnected", label: "Last connected" },
  { key: "dnsName", label: "DNS name" },
  { key: "status", label: "STATUS" }
].map((column) => ({ ...column, sortable: column.sortable !== false }));

/* Detail pendukung Kaspersky (MASTER REPORT OFFICE blok B403:L415).
   Kolom B..L, termasuk Source di kolom L. */
const KASPERSKY_DETAIL_COLUMNS = [
  { key: "namaKomputer", label: "Nama Komputer" },
  { key: "alamatIp", label: "Alamat IP" },
  { key: "workgroup", label: "Workgroup" },
  { key: "versionKes", label: "Version KES" },
  { key: "agentVersion", label: "Agent version" },
  { key: "model", label: "Model" },
  { key: "sistemOperasi", label: "Sistem Operasi" },
  { key: "lastConnected", label: "Last connected" },
  { key: "dnsName", label: "DNS name" },
  { key: "status", label: "STATUS" },
  { key: "source", label: "Source" }
].map((column, index) => ({ ...column, sourceIndex: index }));

/* Tampilan kartu "Data Kaspersky Bermasalah": No urut + seluruh kolom
   B..L. Bila ruang kurang, Sistem Operasi lebih dulu dipotong, lalu
   Last connected (lihat fitProblemTable). */
const KASPERSKY_PROBLEM_COLUMNS = [
  { key: "no", label: "No" },
  ...KASPERSKY_DETAIL_COLUMNS
];

/* Urutan pemotongan kolom Kaspersky bila tabel meluber: Sistem Operasi,
   lalu Last connected, lalu Model. */
const KASPERSKY_FIT_PLAN = [
  { key: "sistemOperasi", cls: "is-clip-os", cssVar: "--kav-problem-os-max", minWidth: 80 },
  { key: "model", cls: "is-clip-model", cssVar: "--kav-problem-model-max", minWidth: 60 }
];

/* Tabel endpoint ITAM (MASTER REPORT OFFICE blok O203:X400). Kolom
   mengikuti sheet; STATUS sudah berisi keterangan di kolom X. */
const ITAM_TABLE_PAGE_SIZE = 15;
const ITAM_TABLE_COLUMNS = [
  { key: "no", label: "No", sortable: false },
  { key: "namaKomputer", label: "Nama Komputer" },
  { key: "alamatIp", label: "Alamat IP" },
  { key: "workgroup", label: "Workgroup" },
  { key: "osName", label: "OS Name" },
  { key: "groupAdministrator", label: "Administrator" },
  { key: "groupUser", label: "Group User" },
  { key: "itamVersion", label: "Itam Version" },
  { key: "statusPrivilege", label: "Status Privilege" },
  { key: "lastInventory", label: "Last Inventory" },
  { key: "status", label: "Status" }
].map((column) => ({ ...column, sortable: column.sortable !== false }));

const ITAM_DETAIL_COLUMNS = [
  { key: "namaKomputer", label: "Nama Komputer" },
  { key: "alamatIp", label: "Alamat IP" },
  { key: "workgroup", label: "Workgroup" },
  { key: "osName", label: "OS Name" },
  { key: "groupAdministrator", label: "Administrator" },
  { key: "groupUser", label: "Group User" },
  { key: "itamVersion", label: "Itam Version" },
  { key: "statusPrivilege", label: "Status Privilege" },
  { key: "lastInventory", label: "Last Inventory" },
  { key: "status", label: "Status" },
  { key: "source", label: "Source" }
].map((column, index) => ({ ...column, sourceIndex: index }));

const ITAM_PROBLEM_COLUMNS = [
  { key: "no", label: "No", sortable: false },
  ...ITAM_DETAIL_COLUMNS
].map((column) => ({ ...column, sortable: column.sortable !== false }));
const ITAM_PROBLEM_ROW_INDEX = Object.fromEntries(
  ITAM_DETAIL_COLUMNS.map((column) => [column.key, column.sourceIndex])
);

/* Kolom teks panjang ITAM: satu baris + marquee saat hover. */
const ITAM_MARQUEE_KEYS = ["osName", "groupAdministrator", "groupUser", "lastInventory", "source"];

/* Urutan pemotongan kolom ITAM di kartu "Data ITAM Bermasalah" bila
   tabel meluber: OS Name, lalu Last Inventory, lalu Group Administrator. */
const ITAM_FIT_PLAN = [
  { key: "osName", cls: "is-clip-os", cssVar: "--kav-problem-os-max", minWidth: 80 },
  { key: "groupAdministrator", cls: "is-clip-itam-admin", cssVar: "--kav-problem-itam-admin-max", minWidth: 80 },
  { key: "groupUser", cls: "is-clip-itam-user", cssVar: "--kav-problem-itam-user-max", minWidth: 60 }
];

const KACE_TABLE_PAGE_SIZE = 15;
const KACE_TABLE_COLUMNS = [
  { key: "no", label: "No", sortable: false },
  { key: "namaKomputer", label: "Nama Komputer" },
  { key: "alamatIp", label: "Alamat IP" },
  { key: "workgroup", label: "Workgroup" },
  { key: "osName", label: "OS Name" },
  { key: "administrator", label: "Administrator" },
  { key: "groupUser", label: "Group User" },
  { key: "modelKomputer", label: "model komputer" },
  { key: "totalHardisk", label: "total hardisk" },
  { key: "lastInv", label: "last inv" },
  { key: "status", label: "STATUS" }
].map((column) => ({ ...column, sortable: column.sortable !== false }));
const KACE_PROBLEM_COLUMNS = [
  { key: "no", label: "No", sortable: false },
  ...KACE_TABLE_COLUMNS.slice(1, 8),
  { key: "lastInv", label: "last inv" },
  { key: "status", label: "STATUS" },
  { key: "source", label: "Source" }
].map((column) => ({ ...column, sortable: column.sortable !== false }));
const KACE_PROBLEM_ROW_INDEX = {
  namaKomputer: 0,
  alamatIp: 1,
  workgroup: 2,
  osName: 3,
  administrator: 4,
  groupUser: 5,
  modelKomputer: 6,
  lastInv: 7,
  status: 8,
  source: 9
};
const KACE_MARQUEE_KEYS = ["osName", "administrator", "groupUser", "modelKomputer", "totalHardisk"];
const KACE_FIT_PLAN = [
  { key: "osName", cls: "is-clip-os", cssVar: "--kav-problem-os-max", minWidth: 80 },
  { key: "administrator", cls: "is-clip-last", cssVar: "--kav-problem-last-max", minWidth: 80 },
  { key: "groupUser", cls: "is-clip-model", cssVar: "--kav-problem-model-max", minWidth: 60 }
];

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

/** Info ITAM Version (sheet SOURCE, kolom BD baris 1). */
function renderItamInfo(info = {}, isLoading = false) {
  return `
    <div class="gsp-card__info-row">
      <span class="gsp-card__info-label">${icon("itam", { size: 14 })}<span>ITAM Version</span></span>
      <span class="gsp-card__info-value">${isLoading
        ? '<span class="skeleton" style="width:72px;height:12px;display:inline-block" aria-label="Memuat nilai"></span>'
        : escapeHtml(info.version || "—")}</span>
    </div>
  `;
}

/**
 * Render satu kotak statistik persen.
 * Nilai persen mengikuti perhitungan modul yang ditampilkan.
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

function kasperskyStatusCounts(items) {
  const counts = { total: 0, normal: 0, nik: 0, userDobel: 0, userUpdate: 0, notfound: 0, inactive: 0, other: 0 };
  (Array.isArray(items) ? items : []).forEach((item) => {
    const tone = kasperskyStatusTone(item && item.status);
    const lastConnected = String(item?.lastConnected || "").trim().toUpperCase();
    const isInactive = /\(\s*\d+\s*DAYS?\s*\)|\b\d+\s*DAYS?\b/i.test(lastConnected);

    if (tone === "empty") {
      counts.notfound += 1;
    } else if (isInactive) {
      counts.inactive += 1;
    } else if (tone === "ok") {
      counts.normal += 1;
    } else if (tone === "warn") {
      counts.nik += 1;
    } else if (tone === "danger") {
      counts.userDobel += 1;
    } else if (tone === "info") {
      counts.userUpdate += 1;
    } else {
      counts.other += 1;
    }
  });
  
  // Total Device = normal + nik + userDobel + userUpdate + inactive
  counts.total = counts.normal + counts.nik + counts.userDobel + counts.userUpdate + counts.inactive;
  return counts;
}

function renderKasperskyStatusSummary(items = null) {
  const counts = Array.isArray(items) ? kasperskyStatusCounts(items) : null;
  const value = (key) => counts
    ? Number(counts[key]).toLocaleString("id-ID")
    : '<span class="skeleton metric-skeleton" aria-label="Memuat nilai"></span>';
  const row = (key, label, tone) => `
    <div class="gsp-card__summary-row">
      <span class="gsp-card__summary-dot gsp-card__summary-dot--${tone}" aria-hidden="true"></span>
      <span class="gsp-card__summary-label">${escapeHtml(label)}</span>
      <span class="gsp-card__summary-value" data-kav-summary-value="${key}">${value(key)}</span>
    </div>`;

  return `
    <article class="gsp-card gsp-card--summary" data-kav-status-summary aria-live="polite">
      <div class="gsp-card__header">
        <div class="gsp-card__icon">${icon("kpi", { size: 21 })}</div>
        <div class="gsp-card__body">
          <h4>Summary Data Kaspersky</h4>
          <p>Rekap status endpoint dari tabel Kaspersky.</p>
        </div>
      </div>
      <div class="gsp-card__summary-total">
        <div class="gsp-card__summary-total-copy">
          <span class="gsp-card__summary-total-label">Total Device</span>
        </div>
        <strong data-kav-summary-value="total">${value("total")}</strong>
      </div>
      <div class="gsp-card__summary-list">
        ${row("normal", "Device Normal", "ok")}
        ${row("nik", "Device NIK Dobel", "warn")}
        ${row("userDobel", "Device User Dobel", "danger")}
        ${row("userUpdate", "Device Beda User", "info")}
        ${row("notfound", "Device tidak ditemukan", "empty")}
        ${row("inactive", "Inactive Connection", "late")}
      </div>
    </article>
  `;
}

function updateKasperskyStatusSummary(container, items) {
  const card = container.querySelector("[data-kav-status-summary]");
  if (!card) return;
  const counts = kasperskyStatusCounts(items);
  Object.keys(counts).forEach((key) => {
    const valueElement = card.querySelector(`[data-kav-summary-value="${key}"]`);
    if (valueElement) valueElement.textContent = Number(counts[key]).toLocaleString("id-ID");
  });
}

function setKasperskyStatusSummaryUnavailable(container) {
  const card = container.querySelector("[data-kav-status-summary]");
  if (!card) return;
  card.querySelectorAll("[data-kav-summary-value]").forEach((valueElement) => {
    valueElement.textContent = "—";
  });
}

function endpointStatusCounts(items, lastInventoryKey, privilegeKey) {
  const counts = { total: 0, normal: 0, userDobel: 0, privilegeNok: 0, notFound: 0, lastInvOver4Day: 0 };
  (Array.isArray(items) ? items : []).forEach((item) => {
    counts.total += 1;
    const status = String(item?.status || "").trim().toUpperCase();
    const privilegeStatus = String(item?.[privilegeKey] || "").trim().toUpperCase();
    const lastInv = String(item?.[lastInventoryKey] || "").trim();
    const dayMatch = lastInv.match(/\(\s*(\d+)\s*DAYS?\s*\)/i);

    if (/\bNORMAL\b|^OK$/.test(status)) counts.normal += 1;
    if (/USER\s*(DOBEL|DOUBLE|DUPLIKAT|DUPLICATE)/.test(status)) counts.userDobel += 1;
    const isPrivilegeNok = privilegeKey === "status"
      ? /PRIVILEGE\s*NOK|NOK\s*PRIVILEGE/.test(status)
      : /\bNOK\b/.test(privilegeStatus);
    if (isPrivilegeNok) {
      counts.privilegeNok += 1;
    }
    if (/NOT\s*FOUND|TIDAK\s*(DI\s*)?TEMUKAN/.test(status)) counts.notFound += 1;
    if (dayMatch && Number(dayMatch[1]) > 4) counts.lastInvOver4Day += 1;
  });
  return counts;
}

function renderEndpointStatusSummary(items, { moduleKey, title }) {
  const counts = items == null ? null : endpointStatusCounts(
    items,
    moduleKey === "itam" ? "lastInventory" : "lastInv",
    moduleKey === "itam" ? "statusPrivilege" : "status"
  );
  const attribute = `${moduleKey}-summary-value`;
  const cardAttribute = `data-${moduleKey}-status-summary`;
  const value = (key) => counts
    ? Number(counts[key]).toLocaleString("id-ID")
    : '<span class="skeleton metric-skeleton" aria-label="Memuat nilai"></span>';
  const row = (key, label, tone) => `
    <div class="gsp-card__summary-row">
      <span class="gsp-card__summary-dot gsp-card__summary-dot--${tone}" aria-hidden="true"></span>
      <span class="gsp-card__summary-label">${escapeHtml(label)}</span>
      <span class="gsp-card__summary-value" data-${attribute}="${key}">${value(key)}</span>
    </div>`;

  return `
    <article class="gsp-card gsp-card--summary" ${cardAttribute} aria-live="polite">
      <div class="gsp-card__header">
        <div class="gsp-card__icon">${icon("kpi", { size: 21 })}</div>
        <div class="gsp-card__body">
          <h4>Summary Data ${escapeHtml(title)}</h4>
          <p>Rekap status endpoint dari tabel ${escapeHtml(title)}.</p>
        </div>
      </div>
      <div class="gsp-card__summary-total">
        <div class="gsp-card__summary-total-copy">
          <span class="gsp-card__summary-total-label">Total Device</span>
        </div>
        <strong data-${attribute}="total">${value("total")}</strong>
      </div>
      <div class="gsp-card__summary-list">
        ${row("normal", "Device Normal", "ok")}
        ${row("userDobel", "Device User Dobel", "danger")}
        ${row("privilegeNok", "Privilege NOK", "danger")}
        ${row("notFound", "Device tidak ditemukan", "empty")}
        ${row("lastInvOver4Day", "Last Inv >4 day", "late")}
      </div>
    </article>
  `;
}

function kaceStatusCounts(items) {
  return endpointStatusCounts(items, "lastInv", "status");
}

function renderKaceStatusSummary(items = null) {
  return renderEndpointStatusSummary(items, { moduleKey: "kace", title: "KACE" });
}

function renderItamStatusSummary(items = null) {
  return renderEndpointStatusSummary(items, { moduleKey: "itam", title: "ITAM" });
}

function updateKaceStatusSummary(container, items) {
  updateEndpointStatusSummary(container, "kace", kaceStatusCounts(items));
}

function updateItamStatusSummary(container, items) {
  updateEndpointStatusSummary(container, "itam", endpointStatusCounts(items, "lastInventory", "statusPrivilege"));
}

function updateEndpointStatusSummary(container, moduleKey, counts) {
  const card = container.querySelector(`[data-${moduleKey}-status-summary]`);
  if (!card) return;
  Object.keys(counts).forEach((key) => {
    const valueElement = card.querySelector(`[data-${moduleKey}-summary-value="${key}"]`);
    if (valueElement) valueElement.textContent = Number(counts[key]).toLocaleString("id-ID");
  });
}

function setEndpointStatusSummaryUnavailable(container, moduleKey) {
  const card = container.querySelector(`[data-${moduleKey}-status-summary]`);
  if (!card) return;
  card.querySelectorAll(`[data-${moduleKey}-summary-value]`).forEach((valueElement) => {
    valueElement.textContent = "—";
  });
}

function setKaceStatusSummaryUnavailable(container) {
  setEndpointStatusSummaryUnavailable(container, "kace");
}

function setItamStatusSummaryUnavailable(container) {
  setEndpointStatusSummaryUnavailable(container, "itam");
}

function renderSummary(data, moduleKey, isLoading = false, session = null) {
  const isError = data && data.success === false && data.message;
  const d = data?.data || data || {};
  const totalPc = d.summary?.totalPc ?? d.totalUser ?? (isLoading ? null : 0);
  const cachedKavTable = moduleKey === "manage-pc-kaspersky" && session
    ? getManagePcKasperskyCache(session)
    : null;
  const kavTableItems = cachedKavTable && Array.isArray(cachedKavTable.items) ? cachedKavTable.items : null;
  const cachedItamTable = moduleKey === "manage-pc-itam" && session
    ? getManagePcItamCache(session)
    : null;
  const itamTableItems = cachedItamTable && Array.isArray(cachedItamTable.items) ? cachedItamTable.items : null;
  const cachedKaceTable = moduleKey === "manage-pc-kace" && session
    ? getManagePcKaceCache(session)
    : null;
  const kaceTableItems = cachedKaceTable && Array.isArray(cachedKaceTable.items) ? cachedKaceTable.items : null;

  const makeStats = (statList, extraStat = "") => ({
    html: statList.map(([label, val]) => `
      <div class="gsp-card__stat">
        <small>${escapeHtml(label)}</small>
        <strong>${renderMetricValue(val, isLoading)}</strong>
      </div>
    `).join("") + extraStat,
    hasPercent: Boolean(extraStat)
  });

  // Submenu Kaspersky: 3 kotak (Kaspersky, Versi Kaspersky & Summary)
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
      <section class="gsp-cards gsp-cards--kaspersky gsp-cards--kaspersky-3" data-mpc-summary aria-live="polite">
        ${isError ? `<p class="mpc-summary__error" role="alert">${escapeHtml(data.message)}</p>` : ""}
        ${renderSummaryCardItem("kaspersky", "Kaspersky", "Endpoint Security - proteksi, update database & compliance.", makeStats([["Total Device", totalPc], ["Manage", kavOk], ["Not Manage", kavNok]], renderPercentStat(kavPercent, isLoading)), null, "blue", kavInfoHtml)}
        ${renderSummaryCardItem("kaspersky", "Versi Kaspersky", "Memastikan Versi Kaspersky selalu up to date.", makeStats([["Total Device", totalPc], ["Version OK", verOk], ["Version NOK", verNok]], renderPercentStat(kavPercent, isLoading)), null, "blue", kavInfoHtml)}
        ${renderKasperskyStatusSummary(kavTableItems)}
      </section>
    `;
  }

  // Submenu ITAM: 2 kotak (ITAM & Privilege)
  if (moduleKey === "manage-pc-itam") {
    const itamOk = d.itam?.ok ?? (isLoading ? null : 0);
    const itamNok = d.itam?.nok ?? (totalPc != null && itamOk != null ? totalPc - itamOk : (isLoading ? null : 0));
    const privOk = d.itam?.privilegeOk ?? (isLoading ? null : 0);
    const privNok = d.itam?.privilegeNok ?? (totalPc != null && privOk != null ? totalPc - privOk : (isLoading ? null : 0));
    const itamPercent = totalPc != null && itamOk != null
      ? (totalPc > 0 ? Math.round((itamOk / totalPc) * 100) : 0)
      : (isLoading ? null : 0);
    const privilegePercent = totalPc != null && privOk != null
      ? (totalPc > 0 ? Math.round((privOk / totalPc) * 100) : 0)
      : (isLoading ? null : 0);
    const itamInfoHtml = renderItamInfo(d.itam?.info || {}, isLoading);

    return `
      <section class="gsp-cards gsp-cards--kaspersky gsp-cards--kaspersky-3 gsp-cards--itam" data-mpc-summary aria-live="polite">
        ${isError ? `<p class="mpc-summary__error" role="alert">${escapeHtml(data.message)}</p>` : ""}
        ${renderSummaryCardItem("itam", "ITAM", "IT Asset Management - inventaris & lifecycle aset.", makeStats([["Total Device", totalPc], ["Manage", itamOk], ["Not Manage", itamNok]], renderPercentStat(itamPercent, isLoading)), null, "teal", itamInfoHtml)}
        ${renderSummaryCardItem("itam", "Privilege ITAM", "Status OK dan NOK privilege ITAM pada seluruh device.", makeStats([["Total Device", totalPc], ["Privilege OK", privOk], ["Privilege NOK", privNok]], renderPercentStat(privilegePercent, isLoading)), null, "teal", itamInfoHtml)}
        ${renderItamStatusSummary(itamTableItems)}
      </section>
    `;
  }

  // Submenu KACE: kartu metrik dan rekap status endpoint.
  if (moduleKey === "manage-pc-kace") {
    const kaceOk = d.kace?.ok ?? (isLoading ? null : 0);
    const kaceNok = d.kace?.nok ?? (totalPc != null && kaceOk != null ? totalPc - kaceOk : (isLoading ? null : 0));
    const kacePercent = d.kace?.percent ?? (
      totalPc != null && kaceOk != null
        ? (totalPc > 0 ? Math.round((kaceOk / totalPc) * 100) : 0)
        : (isLoading ? null : 0)
    );

    return `
      <section class="gsp-cards gsp-cards--kaspersky gsp-cards--kaspersky-3 gsp-cards--kace" data-mpc-summary aria-live="polite">
        ${renderSummaryCardItem("kace", "KACE", "Systems Deployment - deployment OS, agent & otomasi.", makeStats([["Total Device", totalPc], ["Manage", kaceOk], ["Not Manage", kaceNok]], renderPercentStat(kacePercent, isLoading)), null, "purple")}
        ${renderKaceStatusSummary(kaceTableItems)}
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


/* ==============================================================
   TABEL ENDPOINT KASPERSKY
   ============================================================== */

/**
 * Warna status berdasarkan keterangan di kolom K:
 *   normal = hijau, NIK dobel = kuning,
 *   user dobel / belum update = merah, tidak ditemukan = abu.
 */
function kasperskyStatusTone(value) {
  const text = String(value == null ? "" : value).trim().toUpperCase();
  if (!text || /TIDAK\s*(DI\s*)?TEMUKAN/.test(text) || /NOT\s*FOUND/.test(text)) return "empty";
  if (/NIK/.test(text) && /(DOBEL|DOUBLE|DUPLIKAT|DUPLICATE)/.test(text)) return "warn";
  if (/USER/.test(text) && /(DOBEL|DOUBLE|DUPLIKAT|DUPLICATE)/.test(text)) return "danger";
  if (/USER/.test(text) && /BELUM\s*UPDATE/.test(text)) return "info";
  if (/NORMAL|AMAN|VALID|^OK$/.test(text)) return "ok";
  return "other";
}

function renderKasperskyStatus(value) {
  const text = String(value == null ? "" : value).trim();
  const label = text || "Tidak ditemukan";
  return `<span class="mpc-kav-status mpc-kav-status--${kasperskyStatusTone(value)}">${escapeHtml(label)}</span>`;
}

/** Last connected: keterangan "(x day)" / "x day" ditampilkan merah. */
function renderKasperskyLastConnected(value) {
  const text = String(value == null ? "" : value).trim();
  if (!text) return "—";
  if (/\(\s*\d+\s*days?\s*\)|\b\d+\s*days?\b/i.test(text)) {
    return `<span class="mpc-kav-last-late">${escapeHtml(text)}</span>`;
  }
  return escapeHtml(text);
}

/** Source (kolom L): Kaspersky merah, KACE oranye, ITAM hitam. */
function kasperskySourceTone(value) {
  const text = String(value == null ? "" : value).trim().toUpperCase();
  if (text.indexOf("KASPERSKY") !== -1) return "kaspersky";
  if (text.indexOf("KACE") !== -1) return "kace";
  if (text.indexOf("ITAM") !== -1) return "itam";
  return "other";
}

function renderKasperskySource(value) {
  const text = String(value == null ? "" : value).trim();
  if (!text) return "—";
  return `<span class="mpc-kav-source mpc-kav-source--${kasperskySourceTone(text)}">${escapeHtml(text)}</span>`;
}

function isKasperskyDetailHeader(row) {
  const first = String(row && row[0] != null ? row[0] : "").trim().toUpperCase();
  return first === "NAMA KOMPUTER" || first === "COMPUTER NAME";
}

function renderKasperskyDetailCell(column, value) {
  const text = String(value == null ? "" : value).trim();
  if (column.key === "status") {
    return `<td data-kav-col="status" class="mpc-table__status">${renderKasperskyStatus(text)}</td>`;
  }
  if (column.key === "source") {
    return `<td data-kav-col="source">${renderKasperskySource(text)}</td>`;
  }
  if (column.key === "model" || column.key === "sistemOperasi" || column.key === "lastConnected") {
    const content = column.key === "lastConnected"
      ? renderKasperskyLastConnected(text)
      : escapeHtml(text || "—");
    return `<td data-kav-col="${column.key}"><span class="mpc-kav-marquee"><span class="mpc-kav-marquee__text">${content}</span></span></td>`;
  }
  const className = column.key === "namaKomputer" ? ' class="mpc-table__device"' : "";
  return `<td data-kav-col="${column.key}"${className}>${escapeHtml(text || "—")}</td>`;
}

function kasperskyDetailDataRows(rows) {
  const list = (Array.isArray(rows) ? rows : [])
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell == null ? "" : cell).trim()));
  if (list.length && isKasperskyDetailHeader(list[0])) list.shift();
  return list;
}

function renderKasperskyDetailRows(rows) {
  return kasperskyDetailDataRows(rows).map((row, rowIndex) => `
    <tr class="mpc-table__row">
      ${KASPERSKY_PROBLEM_COLUMNS.map((column) => {
        if (column.key === "no") {
          return `<td class="mpc-table__number" data-kav-col="no">${rowIndex + 1}</td>`;
        }
        return renderKasperskyDetailCell(column, row[column.sourceIndex]);
      }).join("")}
    </tr>
  `).join("");
}

function renderKasperskyHeaderCell(column) {
  if (column.sortable === false) {
    const className = column.key === "no" ? ' class="mpc-table__number"' : "";
    return `
      <th scope="col" data-kav-col="${column.key}"${className}>
        <span class="mpc-table__th-label">${escapeHtml(column.label)}</span>
      </th>
    `;
  }

  const className = column.key === "status" ? ' class="mpc-kav-th--left"' : "";
  return `
    <th scope="col" data-kav-col="${column.key}"${className} aria-sort="none" data-kav-sort-header="${column.key}">
      <button type="button" class="mpc-table__th-sort" data-kav-sort-key="${column.key}"
        aria-label="Urutkan berdasarkan ${escapeHtml(column.label)}">
        <span class="mpc-table__th-label">${escapeHtml(column.label)}</span>
        <span class="mpc-table__sort-arrows" aria-hidden="true">
          <span class="mpc-table__sort-arrow" data-kav-sort-direction="asc">${icon("arrow-up", { size: 10 })}</span>
          <span class="mpc-table__sort-arrow" data-kav-sort-direction="desc">${icon("arrow-down", { size: 10 })}</span>
        </span>
      </button>
    </th>
  `;
}

function renderTableHead(columns = KASPERSKY_TABLE_COLUMNS) {
  return `<tr>${columns.map(renderKasperskyHeaderCell).join("")}</tr>`;
}

function renderSkeletonRows(columns = KASPERSKY_TABLE_COLUMNS) {
  const rows = [];
  for (let row = 0; row < 6; row++) {
    const cells = columns.map((_, col) => {
      const width = col === 0 ? 85 : 62 + ((row + col) % 3) * 12;
      return `<td><span class="skeleton mpc-table__skeleton-bar" style="width:${width}%"></span></td>`;
    });
    rows.push(`<tr class="mpc-table__skeleton-row">${cells.join("")}</tr>`);
  }
  return rows.join("");
}

function renderKasperskyRows(items, startIndex = 0) {
  if (items.length === 0) {
    return `<tr><td colspan="${KASPERSKY_TABLE_COLUMNS.length}" class="mpc-table__state">Tidak ada perangkat yang cocok.</td></tr>`;
  }

  return items.map((item, index) => `
    <tr class="mpc-table__row">
      <td class="mpc-table__number" data-kav-col="no">${startIndex + index + 1}</td>
      <td data-kav-col="namaKomputer" class="mpc-table__device">${escapeHtml(item.namaKomputer || "—")}</td>
      <td data-kav-col="alamatIp">${escapeHtml(item.alamatIp || "—")}</td>
      <td data-kav-col="workgroup">${escapeHtml(item.workgroup || "—")}</td>
      <td data-kav-col="versionKes">${escapeHtml(item.versionKes || "—")}</td>
      <td data-kav-col="agentVersion">${escapeHtml(item.agentVersion || "—")}</td>
      <td data-kav-col="model">
        <span class="mpc-kav-marquee"><span class="mpc-kav-marquee__text">${escapeHtml(item.model || "—")}</span></span>
      </td>
      <td data-kav-col="sistemOperasi">
        <span class="mpc-kav-marquee"><span class="mpc-kav-marquee__text">${escapeHtml(item.sistemOperasi || "—")}</span></span>
      </td>
      <td data-kav-col="lastConnected">
        <span class="mpc-kav-marquee"><span class="mpc-kav-marquee__text">${renderKasperskyLastConnected(item.lastConnected)}</span></span>
      </td>
      <td data-kav-col="dnsName">${escapeHtml(item.dnsName || "—")}</td>
      <td data-kav-col="status" class="mpc-table__status">${renderKasperskyStatus(item.status)}</td>
    </tr>
  `).join("");
}

/* Sel marquee generik: teks panjang dipotong satu baris. */
function renderMarqueeCell(key, content) {
  return `<td data-kav-col="${key}"><span class="mpc-kav-marquee"><span class="mpc-kav-marquee__text">${content}</span></span></td>`;
}

function renderItamRows(items, startIndex = 0) {
  if (items.length === 0) {
    return `<tr><td colspan="${ITAM_TABLE_COLUMNS.length}" class="mpc-table__state">Tidak ada perangkat yang cocok.</td></tr>`;
  }

  return items.map((item, index) => `
    <tr class="mpc-table__row">
      <td class="mpc-table__number" data-kav-col="no">${startIndex + index + 1}</td>
      <td data-kav-col="namaKomputer" class="mpc-table__device">${escapeHtml(item.namaKomputer || "—")}</td>
      <td data-kav-col="alamatIp">${escapeHtml(item.alamatIp || "—")}</td>
      <td data-kav-col="workgroup">${escapeHtml(item.workgroup || "—")}</td>
      ${renderMarqueeCell("osName", escapeHtml(item.osName || "—"))}
      ${renderMarqueeCell("groupAdministrator", escapeHtml(item.groupAdministrator || "—"))}
      ${renderMarqueeCell("groupUser", escapeHtml(item.groupUser || "—"))}
      <td data-kav-col="itamVersion">${escapeHtml(item.itamVersion || "—")}</td>
      <td data-kav-col="statusPrivilege">${escapeHtml(item.statusPrivilege || "—")}</td>
      ${renderLastInventoryCell(item.lastInventory)}
      <td data-kav-col="status" class="mpc-table__status">${renderKasperskyStatus(item.status)}</td>
    </tr>
  `).join("");
}

function renderLastInventoryCell(value) {
  const text = String(value == null ? "" : value).trim();
  const content = escapeHtml(text || "—");
  const marked = /\(\s*\d+\s*DAYS?\s*\)/i.test(text)
    ? `<span class="mpc-kav-last-late">${content}</span>`
    : content;
  return renderMarqueeCell("lastInventory", marked);
}

function kaceStatusTone(value) {
  const text = String(value == null ? "" : value).trim().toUpperCase();
  if (!text || /NOT\s*FOUND|TIDAK\s*(DI\s*)?TEMUKAN/.test(text)) return "empty";
  if (/NIK\s*(DOBEL|DOUBLE|DUPLIKAT|DUPLICATE)/.test(text)) return "warn";
  if (/USER\s*(DOBEL|DOUBLE|DUPLIKAT|DUPLICATE)|PRIVILEGE\s*NOK/.test(text)) return "danger";
  if (/NOK|ERROR|FAILED|INACTIVE|NOT\s*MANAGED/.test(text)) return "danger";
  if (/WARN|PENDING|CHECK/.test(text)) return "warn";
  if (/OK|NORMAL|ACTIVE|MANAGED/.test(text)) return "ok";
  return "other";
}

function renderKaceStatus(value) {
  const text = String(value == null ? "" : value).trim();
  return `<span class="mpc-kav-status mpc-kav-status--${kaceStatusTone(value)}">${escapeHtml(text || "Tidak ditemukan")}</span>`;
}

function renderKaceLastInv(value) {
  const text = String(value == null ? "" : value).trim();
  const isLate = /\(\s*\d+\s*DAYS?\s*\)/i.test(text);
  return `<td data-kav-col="lastInv"><span${isLate ? ' class="mpc-kav-last-late"' : ""}>${escapeHtml(text || "—")}</span></td>`;
}

function renderKaceRows(items, startIndex = 0) {
  if (items.length === 0) {
    return `<tr><td colspan="${KACE_TABLE_COLUMNS.length}" class="mpc-table__state">Tidak ada perangkat yang cocok.</td></tr>`;
  }

  return items.map((item, index) => `
    <tr class="mpc-table__row">
      <td class="mpc-table__number" data-kav-col="no">${startIndex + index + 1}</td>
      ${KACE_TABLE_COLUMNS.slice(1).map((column) => column.key === "status"
        ? `<td data-kav-col="status" class="mpc-table__status">${renderKaceStatus(item.status)}</td>`
        : column.key === "lastInv"
          ? renderKaceLastInv(item.lastInv)
        : KACE_MARQUEE_KEYS.includes(column.key)
          ? renderMarqueeCell(column.key, escapeHtml(item[column.key] || "—"))
          : `<td data-kav-col="${column.key}">${escapeHtml(item[column.key] || "—")}</td>`
      ).join("")}
    </tr>
  `).join("");
}

function renderKaceDetailRows(rows) {
  return kasperskyDetailDataRows(rows).map((row, rowIndex) => `
    <tr class="mpc-table__row">
      <td class="mpc-table__number" data-kav-col="no">${rowIndex + 1}</td>
      ${KACE_PROBLEM_COLUMNS.slice(1).map((column) => column.key === "status"
        ? `<td data-kav-col="status" class="mpc-table__status">${renderKaceStatus(row[KACE_PROBLEM_ROW_INDEX.status])}</td>`
        : column.key === "source"
          ? `<td data-kav-col="source">${renderKasperskySource(row[KACE_PROBLEM_ROW_INDEX.source])}</td>`
          : column.key === "lastInv"
            ? renderKaceLastInv(row[KACE_PROBLEM_ROW_INDEX.lastInv])
          : KACE_MARQUEE_KEYS.includes(column.key)
            ? renderMarqueeCell(column.key, escapeHtml(row[KACE_PROBLEM_ROW_INDEX[column.key]] || "—"))
            : `<td data-kav-col="${column.key}">${escapeHtml(row[KACE_PROBLEM_ROW_INDEX[column.key]] || "—")}</td>`
      ).join("")}
    </tr>
  `).join("");
}

function renderItamDetailCell(column, value) {
  const text = String(value == null ? "" : value).trim();
  if (column.key === "status") {
    return `<td data-kav-col="status" class="mpc-table__status">${renderKasperskyStatus(text)}</td>`;
  }
  if (column.key === "source") {
    return renderMarqueeCell("source", renderKasperskySource(text));
  }
  if (column.key === "lastInventory") {
    return renderLastInventoryCell(text);
  }
  if (ITAM_MARQUEE_KEYS.indexOf(column.key) !== -1) {
    return renderMarqueeCell(column.key, escapeHtml(text || "—"));
  }
  const className = column.key === "namaKomputer" ? ' class="mpc-table__device"' : "";
  return `<td data-kav-col="${column.key}"${className}>${escapeHtml(text || "—")}</td>`;
}

function renderItamDetailRows(rows) {
  return kasperskyDetailDataRows(rows).map((row, rowIndex) => `
    <tr class="mpc-table__row">
      ${ITAM_PROBLEM_COLUMNS.map((column) => {
        if (column.key === "no") {
          return `<td class="mpc-table__number" data-kav-col="no">${rowIndex + 1}</td>`;
        }
        return renderItamDetailCell(column, row[column.sourceIndex]);
      }).join("")}
    </tr>
  `).join("");
}

/**
 * Kolom teks panjang dipotong satu baris. Saat hover, teks bergeser SATU
 * KALI ke kiri (tanpa bolak-balik) bila melebihi lebar kolom. Kecepatan
 * ~100px/detik dan durasi menyesuaikan panjang teks. Saat mouse keluar,
 * teks kembali ke posisi awal.
 */
function bindMarquee(containerElement, marqueeCells) {
  const MARQUEE_CELL = marqueeCells ||
    '[data-kav-col="model"], [data-kav-col="sistemOperasi"], [data-kav-col="lastConnected"]';

  containerElement.addEventListener("mouseover", (event) => {
    const cell = event.target.closest(MARQUEE_CELL);
    if (!cell || cell.contains(event.relatedTarget)) return;
    const clip = cell.querySelector(".mpc-kav-marquee");
    const text = clip && clip.querySelector(".mpc-kav-marquee__text");
    if (!clip || !text) return;
    const overflow = text.scrollWidth - clip.clientWidth;
    if (overflow <= 1) return;
    text.style.setProperty("--kav-shift", `-${overflow}px`);
    text.style.animationDuration = `${Math.max(1, overflow / 100)}s`;
    text.classList.remove("is-scrolling");
    void text.offsetWidth;
    text.classList.add("is-scrolling");
  });

  containerElement.addEventListener("mouseout", (event) => {
    const cell = event.target.closest(MARQUEE_CELL);
    if (!cell || cell.contains(event.relatedTarget)) return;
    const text = cell.querySelector(".mpc-kav-marquee__text");
    if (!text) return;
    text.classList.remove("is-scrolling");
    text.style.animationDuration = "";
  });
}

function renderKasperskyPageNumbers(page, totalPages) {
  const pages = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : Array.from(new Set([1, totalPages, page - 1, page, page + 1]))
      .filter((number) => number >= 1 && number <= totalPages)
      .sort((a, b) => a - b);
  const entries = [];
  let previousPage = 0;

  pages.forEach((pageNumber) => {
    if (pageNumber - previousPage > 1) entries.push("ellipsis");
    entries.push(pageNumber);
    previousPage = pageNumber;
  });

  return entries.map((entry) => entry === "ellipsis"
    ? '<span class="mpc-table__page-ellipsis" aria-hidden="true">&hellip;</span>'
    : `<button type="button" class="mpc-table__page-button${entry === page ? " is-active" : ""}"
        data-kav-page="${entry}" aria-label="Halaman ${entry}"${entry === page ? ' aria-current="page"' : ""}>${entry}</button>`
  ).join("");
}

function renderItamProblemSection() {
  return `
    <section class="mpc-table-card mpc-kav-problem-card" data-itam-problem-card aria-labelledby="mpcItamProblemTitle" hidden>
      <button type="button" class="mpc-kav-problem-header" data-itam-problem-toggle aria-expanded="false" aria-controls="itamProblemContent" aria-label="Buka detail Data ITAM Bermasalah">
        <span class="mpc-table-card__title-icon mpc-table-card__title-icon--danger" aria-hidden="true">${icon("alert", { size: 18 })}</span>
        <span class="mpc-kav-problem-title" id="mpcItamProblemTitle">Data ITAM Bermasalah</span>
        <span class="mpc-kav-problem-count mpc-table-tab__count" data-itam-problem-count></span>
        <span class="mpc-kav-problem-chevron" aria-hidden="true">${icon("chevron-down", { size: 16 })}</span>
      </button>
      <div id="itamProblemContent" class="mpc-kav-problem-content" aria-hidden="true">
        <div class="mpc-kav-problem-content__inner">
          <div class="mpc-table-wrapper">
            <table class="mpc-table mpc-kav-table mpc-kav-problem-table mpc-itam-problem-table" aria-label="Data ITAM Bermasalah">
              <thead data-itam-problem-head></thead>
              <tbody data-itam-problem-rows></tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderItamTableSection() {
  return `
    <section class="mpc-table-card mpc-kav-card" aria-labelledby="mpcItamTitle">
      <header class="mpc-table-card__header">
        <div class="mpc-table-card__title-group">
          <span class="mpc-table-card__title-icon mpc-table-card__title-icon--teal" aria-hidden="true">${icon("itam", { size: 18 })}</span>
          <div>
            <h2 id="mpcItamTitle">Data ITAM Office</h2>
            <p>Status data dashboard ITAM</p>
          </div>
        </div>
        <div class="mpc-table-card__controls">
          <label class="mpc-table-search">
            ${icon("search", { size: 17 })}
            <span class="visually-hidden">Cari perangkat</span>
            <input type="search" data-itam-search placeholder="Cari perangkat..." autocomplete="off">
          </label>
        </div>
      </header>
      <div class="mpc-table-wrapper">
        <table class="mpc-table mpc-kav-table mpc-itam-table">
          <thead data-itam-head>${renderTableHead(ITAM_TABLE_COLUMNS)}</thead>
          <tbody data-itam-rows>${renderSkeletonRows(ITAM_TABLE_COLUMNS)}</tbody>
        </table>
      </div>
      <footer class="mpc-table__footer">
        <div class="mpc-table__count" data-itam-count aria-live="polite">Memuat data ITAM...</div>
        <div class="mpc-table__footer-right" data-itam-pagination></div>
      </footer>
    </section>
  `;
}

function renderKasperskyProblemSection() {
  return `
    <section class="mpc-table-card mpc-kav-problem-card" data-kav-problem-card aria-labelledby="mpcKavProblemTitle" hidden>
      <button type="button" class="mpc-kav-problem-header" data-kav-problem-toggle aria-expanded="false" aria-controls="kavProblemContent" aria-label="Buka detail Data Kaspersky Bermasalah">
        <span class="mpc-table-card__title-icon mpc-table-card__title-icon--danger" aria-hidden="true">${icon("alert", { size: 18 })}</span>
        <span class="mpc-kav-problem-title" id="mpcKavProblemTitle">Data Kaspersky Bermasalah</span>
        <span class="mpc-kav-problem-count mpc-table-tab__count" data-kav-problem-count></span>
        <span class="mpc-kav-problem-chevron" aria-hidden="true">${icon("chevron-down", { size: 16 })}</span>
      </button>
      <div id="kavProblemContent" class="mpc-kav-problem-content" aria-hidden="true">
        <div class="mpc-kav-problem-content__inner">
          <div class="mpc-table-wrapper">
            <table class="mpc-table mpc-kav-table mpc-kav-problem-table" aria-label="Data Kaspersky Bermasalah">
              <thead>
                <tr>
                  ${KASPERSKY_PROBLEM_COLUMNS.map((column) => `<th scope="col" data-kav-col="${column.key}"${column.key === "no" ? ' class="mpc-table__number"' : ""}><span class="mpc-table__th-label">${escapeHtml(column.label)}</span></th>`).join("")}
                </tr>
              </thead>
              <tbody data-kav-problem-rows></tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderKasperskyTableSection() {
  return `
    <section class="mpc-table-card mpc-kav-card" aria-labelledby="mpcKavTitle">
      <header class="mpc-table-card__header">
        <div class="mpc-table-card__title-group">
          <span class="mpc-table-card__title-icon mpc-table-card__title-icon--blue" aria-hidden="true">${icon("kaspersky", { size: 18 })}</span>
          <div>
            <h2 id="mpcKavTitle">Data Kaspersky Office</h2>
            <p>Status data dashboard kaspersky</p>
          </div>
        </div>
        <div class="mpc-table-card__controls">
          <label class="mpc-table-search">
            ${icon("search", { size: 17 })}
            <span class="visually-hidden">Cari perangkat</span>
            <input type="search" data-kav-search placeholder="Cari perangkat..." autocomplete="off">
          </label>
        </div>
      </header>
      <div class="mpc-table-wrapper">
        <table class="mpc-table mpc-kav-table">
          <thead data-kav-head>${renderTableHead()}</thead>
          <tbody data-kav-rows>${renderSkeletonRows()}</tbody>
        </table>
      </div>
      <footer class="mpc-table__footer">
        <div class="mpc-table__count" data-kav-count aria-live="polite">Memuat data Kaspersky...</div>
        <div class="mpc-table__footer-right" data-kav-pagination></div>
      </footer>
    </section>
  `;
}

function renderKaceProblemSection() {
  return `
    <section class="mpc-table-card mpc-kav-problem-card" data-kace-problem-card aria-labelledby="mpcKaceProblemTitle" hidden>
      <button type="button" class="mpc-kav-problem-header" data-kace-problem-toggle aria-expanded="false" aria-controls="kaceProblemContent" aria-label="Buka detail Data KACE Bermasalah">
        <span class="mpc-table-card__title-icon mpc-table-card__title-icon--danger" aria-hidden="true">${icon("alert", { size: 18 })}</span>
        <span class="mpc-kav-problem-title" id="mpcKaceProblemTitle">Data KACE Bermasalah</span>
        <span class="mpc-kav-problem-count mpc-table-tab__count" data-kace-problem-count></span>
        <span class="mpc-kav-problem-chevron" aria-hidden="true">${icon("chevron-down", { size: 16 })}</span>
      </button>
      <div id="kaceProblemContent" class="mpc-kav-problem-content" aria-hidden="true">
        <div class="mpc-kav-problem-content__inner">
          <div class="mpc-table-wrapper">
            <table class="mpc-table mpc-kav-table mpc-kav-problem-table mpc-kace-table" aria-label="Data KACE Bermasalah">
              <thead data-kace-problem-head></thead>
              <tbody data-kace-problem-rows></tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderKaceTableSection() {
  return `
    <section class="mpc-table-card mpc-kav-card" aria-labelledby="mpcKaceTitle">
      <header class="mpc-table-card__header">
        <div class="mpc-table-card__title-group">
          <span class="mpc-table-card__title-icon mpc-table-card__title-icon--purple" aria-hidden="true">${icon("kace", { size: 18 })}</span>
          <div>
            <h2 id="mpcKaceTitle">Data KACE Office</h2>
            <p>Status data dashboard KACE</p>
          </div>
        </div>
        <div class="mpc-table-card__controls">
          <label class="mpc-table-search">
            ${icon("search", { size: 17 })}
            <span class="visually-hidden">Cari perangkat</span>
            <input type="search" data-kace-search placeholder="Cari perangkat..." autocomplete="off">
          </label>
        </div>
      </header>
      <div class="mpc-table-wrapper">
        <table class="mpc-table mpc-kav-table mpc-kace-table">
          <thead data-kace-head>${renderTableHead(KACE_TABLE_COLUMNS)}</thead>
          <tbody data-kace-rows>${renderSkeletonRows(KACE_TABLE_COLUMNS)}</tbody>
        </table>
      </div>
      <footer class="mpc-table__footer">
        <div class="mpc-table__count" data-kace-count aria-live="polite">Memuat data KACE...</div>
        <div class="mpc-table__footer-right" data-kace-pagination></div>
      </footer>
    </section>
  `;
}

/* Utamakan lebar alami. Hanya bila tabel meluber: potong kolom sesuai
   fit plan (urutan + css var per modul). Dengan begitu tidak ada data
   yang membungkus ke baris baru. */
function fitProblemTable(problemCard, fitPlan = KASPERSKY_FIT_PLAN) {
  if (!problemCard || problemCard.hidden) return;
  const wrapper = problemCard.querySelector(".mpc-table-wrapper");
  const table = problemCard.querySelector(".mpc-kav-problem-table");
  if (!wrapper || !table) return;

  /* Source ITAM tidak dipotong: lebar kolom mengikuti isi. Offset sticky
     kolom STATUS disesuaikan agar tetap menempel di kiri kolom Source. */
  const sourceCell = table.querySelector('td[data-kav-col="source"]');
  if (sourceCell) {
    table.style.setProperty("--mpc-itam-source-width", `${Math.ceil(sourceCell.getBoundingClientRect().width)}px`);
  }

  fitPlan.forEach((step) => {
    table.classList.remove(step.cls);
    table.style.removeProperty(step.cssVar);
  });

  const overflow = () => wrapper.scrollWidth - wrapper.clientWidth;
  const widestText = (columnKey) => {
    const texts = table.querySelectorAll(`td[data-kav-col="${columnKey}"] .mpc-kav-marquee__text`);
    return Math.max(0, ...Array.from(texts, (text) => text.getBoundingClientRect().width));
  };

  for (let i = 0; i < fitPlan.length; i++) {
    if (overflow() <= 1) return;
    const step = fitPlan[i];
    const textWidth = widestText(step.key);
    if (textWidth) {
      const targetWidth = Math.max(step.minWidth, Math.ceil(textWidth - overflow()) - 1);
      table.style.setProperty(step.cssVar, `${targetWidth}px`);
      table.classList.add(step.cls);
    }
  }
}

/**
 * Binding tabel endpoint generik (dipakai Kaspersky & ITAM):
 * search, sort per kolom, pagination client-side, marquee, kartu
 * "Data Bermasalah" + pemotongan kolom adaptif, dan cache-first load.
 */
function bindEndpointTable(container, options) {
  const {
    cardSelector,
    headSelector,
    rowsSelector,
    searchSelector,
    countSelector,
    paginationSelector,
    problemCardSelector,
    problemHeadSelector,
    problemRowsSelector,
    problemCountSelector,
    problemToggleSelector,
    problemContentId,
    problemTitle,
    loadingLabel,
    navLabel,
    columns: initialColumns,
    columnsFromData,
    renderProblemHead,
    problemSortColumns = null,
    problemSortIndexByKey = null,
    pageSize,
    dateSortKeys = [],
    fitPlan,
    marqueeCells,
    renderRows,
    renderDetailRows,
    loadCached,
    getCached,
    session,
    onLoaded,
    onLoadError
  } = options;

  const card = container.querySelector(cardSelector);
  if (!card) return;

  const headElement = card.querySelector(headSelector);
  const rowsElement = card.querySelector(rowsSelector);
  const searchInput = card.querySelector(searchSelector);
  const countElement = card.querySelector(countSelector);
  const paginationElement = card.querySelector(paginationSelector);
  const problemCard = container.querySelector(problemCardSelector);
  const problemHeadElement = problemHeadSelector ? container.querySelector(problemHeadSelector) : null;
  const problemRowsElement = container.querySelector(problemRowsSelector);

  let columns = initialColumns;
  let items = [];
  let detailRows = [];
  let loadError = "";
  let loaded = false;
  let page = 1;
  let search = "";
  let sortBy = "";
  let sortDirection = "asc";
  let problemSortBy = "";
  let problemSortDirection = "asc";
  let totalPages = 1;
  let searchTimer = null;

  function renderProblem() {
    const dataRows = kasperskyDetailDataRows(detailRows);
    if (problemHeadElement && renderProblemHead) {
      problemHeadElement.innerHTML = renderProblemHead(problemSortColumns || columns);
    }
    if (problemSortBy && problemSortColumns) {
      const columnIndex = problemSortIndexByKey
        ? problemSortIndexByKey[problemSortBy]
        : problemSortColumns.findIndex((column) => column.key === problemSortBy) - 1;
      if (columnIndex >= 0) {
        dataRows.sort((left, right) => {
          const a = String(left[columnIndex] == null ? "" : left[columnIndex]).toLowerCase();
          const b = String(right[columnIndex] == null ? "" : right[columnIndex]).toLowerCase();
          const order = a < b ? -1 : a > b ? 1 : 0;
          return problemSortDirection === "desc" ? -order : order;
        });
      }
    }
    const html = renderDetailRows(dataRows);
    if (problemRowsElement) problemRowsElement.innerHTML = html;
    updateProblemSortHeaders();
    if (problemCard) {
      problemCard.hidden = !html;
      const countEl = problemCard.querySelector(problemCountSelector);
      if (countEl) countEl.textContent = dataRows.length ? String(dataRows.length) : "";
    }
    fitProblemTable(problemCard, fitPlan);
  }

  function updateSortHeaders() {
    card.querySelectorAll("[data-kav-sort-key]").forEach((button) => {
      const key = button.getAttribute("data-kav-sort-key");
      const header = button.closest("[data-kav-sort-header]");
      const isSorted = key === sortBy;
      const activeDirection = isSorted ? sortDirection : "";
      const label = button.querySelector(".mpc-table__th-label").textContent;
      header.setAttribute(
        "aria-sort",
        activeDirection === "asc" ? "ascending" : activeDirection === "desc" ? "descending" : "none"
      );
      header.classList.toggle("is-active", isSorted);
      button.setAttribute(
        "aria-label",
        isSorted
          ? `Urutkan berdasarkan ${label}, saat ini ${activeDirection === "asc" ? "naik" : "turun"}`
          : `Urutkan berdasarkan ${label}`
      );
      button.querySelectorAll("[data-kav-sort-direction]").forEach((arrow) => {
        arrow.classList.toggle("is-active", arrow.getAttribute("data-kav-sort-direction") === activeDirection);
      });
    });
  }

  function updateProblemSortHeaders() {
    if (!problemHeadElement || !problemSortColumns) return;
    problemHeadElement.querySelectorAll("[data-kav-sort-key]").forEach((button) => {
      const key = button.getAttribute("data-kav-sort-key");
      const header = button.closest("[data-kav-sort-header]");
      const isSorted = key === problemSortBy;
      const activeDirection = isSorted ? problemSortDirection : "";
      const label = button.querySelector(".mpc-table__th-label").textContent;
      header.setAttribute(
        "aria-sort",
        activeDirection === "asc" ? "ascending" : activeDirection === "desc" ? "descending" : "none"
      );
      header.classList.toggle("is-active", isSorted);
      button.setAttribute(
        "aria-label",
        isSorted
          ? `Urutkan berdasarkan ${label}, saat ini ${activeDirection === "asc" ? "naik" : "turun"}`
          : `Urutkan berdasarkan ${label}`
      );
      button.querySelectorAll("[data-kav-sort-direction]").forEach((arrow) => {
        arrow.classList.toggle("is-active", arrow.getAttribute("data-kav-sort-direction") === activeDirection);
      });
    });
  }

  function compareItems(left, right) {
    if (dateSortKeys.indexOf(sortBy) !== -1) {
      const aTime = Date.parse(left[sortBy]);
      const bTime = Date.parse(right[sortBy]);
      if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) return aTime - bTime;
    }
    const a = String(left[sortBy] == null ? "" : left[sortBy]).toLowerCase();
    const b = String(right[sortBy] == null ? "" : right[sortBy]).toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  }

  function filteredItems() {
    const query = search.trim().toUpperCase();
    let result = items.slice();
    if (query) {
      result = result.filter((item) =>
        columns.some((column) =>
          String(item[column.key] == null ? "" : item[column.key]).toUpperCase().indexOf(query) !== -1));
    }
    if (sortBy) {
      result.sort((left, right) =>
        sortDirection === "desc" ? -compareItems(left, right) : compareItems(left, right));
    }
    return result;
  }

  function updatePagination(total) {
    totalPages = Math.max(1, Math.ceil(total / pageSize));
    page = Math.max(1, Math.min(totalPages, page));
    const first = total ? ((page - 1) * pageSize) + 1 : 0;
    const last = Math.min(page * pageSize, total);
    countElement.textContent = `Menampilkan ${first}–${last} dari ${total} perangkat`;
    paginationElement.innerHTML = totalPages > 1 ? `
      <div class="mpc-table__page-actions" role="navigation" aria-label="${escapeHtml(navLabel)}">
        <button type="button" class="mpc-table__page-button" data-kav-page="prev"
          aria-label="Halaman sebelumnya" ${page <= 1 ? "disabled" : ""}>&lsaquo;</button>
        ${renderKasperskyPageNumbers(page, totalPages)}
        <button type="button" class="mpc-table__page-button" data-kav-page="next"
          aria-label="Halaman berikutnya" ${page >= totalPages ? "disabled" : ""}>&rsaquo;</button>
      </div>
    ` : "";
  }

  function renderPage() {
    if (!loaded) {
      rowsElement.innerHTML = renderSkeletonRows(columns);
      countElement.textContent = `Memuat data ${loadingLabel}...`;
      paginationElement.innerHTML = "";
      return;
    }

    if (loadError) {
      rowsElement.innerHTML = `<tr><td colspan="${columns.length}" class="mpc-table__state mpc-table__state--error" role="alert">${escapeHtml(loadError)}</td></tr>`;
      countElement.textContent = "";
      paginationElement.innerHTML = "";
      return;
    }

    const filtered = filteredItems();
    const total = filtered.length;
    totalPages = Math.max(1, Math.ceil(total / pageSize));
    page = Math.max(1, Math.min(totalPages, page));
    const startIndex = (page - 1) * pageSize;

    rowsElement.innerHTML = renderRows(
      filtered.slice(startIndex, startIndex + pageSize), startIndex);
    if (headElement) headElement.innerHTML = renderTableHead(columns);
    updatePagination(total);
    updateSortHeaders();
  }

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      search = searchInput.value.trim();
      page = 1;
      renderPage();
    }, 250);
  });

  headElement.addEventListener("click", (event) => {
    const button = event.target.closest("[data-kav-sort-key]");
    if (!button) return;
    const key = button.getAttribute("data-kav-sort-key");
    if (sortBy !== key) {
      sortBy = key;
      sortDirection = "asc";
    } else if (sortDirection === "asc") {
      sortDirection = "desc";
    } else if (sortDirection === "desc") {
      sortBy = "";
      sortDirection = "asc";
    } else {
      sortDirection = "asc";
    }
    page = 1;
    renderPage();
  });

  if (problemHeadElement && problemSortColumns) {
    problemHeadElement.addEventListener("click", (event) => {
      const button = event.target.closest("[data-kav-sort-key]");
      if (!button) return;
      const key = button.getAttribute("data-kav-sort-key");
      if (problemSortBy !== key) {
        problemSortBy = key;
        problemSortDirection = "asc";
      } else if (problemSortDirection === "asc") {
        problemSortDirection = "desc";
      } else {
        problemSortBy = "";
        problemSortDirection = "asc";
      }
      renderProblem();
    });
  }

  paginationElement.addEventListener("click", (event) => {
    const button = event.target.closest("[data-kav-page]");
    if (!button || button.disabled) return;
    const pageValue = button.getAttribute("data-kav-page");
    if (pageValue === "prev") page -= 1;
    else if (pageValue === "next") page += 1;
    else page = Number(pageValue);
    renderPage();
  });

  bindMarquee(card, marqueeCells);
  if (problemCard) bindMarquee(problemCard, marqueeCells);

  const toggle = problemCard?.querySelector(problemToggleSelector);
  const content = problemCard?.querySelector(`[id='${problemContentId}']`);
  if (toggle && content) {
    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      const nextExpanded = !isExpanded;
      toggle.setAttribute("aria-expanded", String(nextExpanded));
      toggle.setAttribute("aria-label", nextExpanded ? `Tutup detail ${problemTitle}` : `Buka detail ${problemTitle}`);
      content.classList.toggle("is-open", nextExpanded);
      content.setAttribute("aria-hidden", String(!nextExpanded));
      if (nextExpanded) {
        requestAnimationFrame(() => fitProblemTable(problemCard, fitPlan));
      }
    });
  }

  /* Lebar kartu berubah -> hitung ulang potongan. */
  if (problemCard && typeof ResizeObserver !== "undefined") {
    let lastWidth = 0;
    const observer = new ResizeObserver((entries) => {
      const width = Math.round(entries[0].contentRect.width);
      if (width === lastWidth) return;
      lastWidth = width;
      fitProblemTable(problemCard, fitPlan);
    });
    observer.observe(problemCard.querySelector(".mpc-table-wrapper") || problemCard);
  }

  function applyData(data) {
    if (columnsFromData) columns = columnsFromData(data, initialColumns);
    items = Array.isArray(data.items) ? data.items : [];
    detailRows = Array.isArray(data.detail?.rows) ? data.detail.rows : [];
    loaded = true;
    loadError = "";
    renderProblem();
    if (onLoaded) onLoaded(container, items);
    renderPage();
  }

  /* Cache-first: sesi yang sama cukup load SEKALI (pola tabel Manage PC/CCTV). */
  const cached = getCached(session);
  if (cached) {
    loaded = true;
    applyData(cached);
  }

  renderPage();

  loadCached(session)
    .then((result) => {
      if (!card.isConnected) return;
      if (!result.success) throw new Error(result.message || `Data ${loadingLabel} gagal dimuat.`);
      applyData(result.data || {});
    })
    .catch((error) => {
      if (!card.isConnected) return;
      loaded = true;
      loadError = error.message || `Data ${loadingLabel} gagal dimuat.`;
      detailRows = [];
      renderProblem();
      if (onLoadError) onLoadError(container);
      renderPage();
    });
}

function bindKasperskyTable(container, session) {
  bindEndpointTable(container, {
    cardSelector: ".mpc-kav-card",
    headSelector: "[data-kav-head]",
    rowsSelector: "[data-kav-rows]",
    searchSelector: "[data-kav-search]",
    countSelector: "[data-kav-count]",
    paginationSelector: "[data-kav-pagination]",
    problemCardSelector: "[data-kav-problem-card]",
    problemRowsSelector: "[data-kav-problem-rows]",
    problemCountSelector: "[data-kav-problem-count]",
    problemToggleSelector: "[data-kav-problem-toggle]",
    problemContentId: "kavProblemContent",
    problemTitle: "Data Kaspersky Bermasalah",
    loadingLabel: "Kaspersky",
    navLabel: "Navigasi halaman Kaspersky",
    columns: KASPERSKY_TABLE_COLUMNS,
    pageSize: KASPERSKY_TABLE_PAGE_SIZE,
    dateSortKeys: ["lastConnected"],
    fitPlan: KASPERSKY_FIT_PLAN,
    renderRows: renderKasperskyRows,
    renderDetailRows: renderKasperskyDetailRows,
    loadCached: loadManagePcKasperskyCached,
    getCached: (sess) => getManagePcKasperskyCache(sess),
    session,
    onLoaded: (target, loadedItems) => updateKasperskyStatusSummary(target, loadedItems),
    onLoadError: (target) => setKasperskyStatusSummaryUnavailable(target)
  });
}

function bindItamTable(container, session) {
  bindEndpointTable(container, {
    cardSelector: ".mpc-kav-card",
    headSelector: "[data-itam-head]",
    rowsSelector: "[data-itam-rows]",
    searchSelector: "[data-itam-search]",
    countSelector: "[data-itam-count]",
    paginationSelector: "[data-itam-pagination]",
    problemCardSelector: "[data-itam-problem-card]",
    problemHeadSelector: "[data-itam-problem-head]",
    problemRowsSelector: "[data-itam-problem-rows]",
    problemCountSelector: "[data-itam-problem-count]",
    problemToggleSelector: "[data-itam-problem-toggle]",
    problemContentId: "itamProblemContent",
    problemTitle: "Data ITAM Bermasalah",
    loadingLabel: "ITAM",
    navLabel: "Navigasi halaman ITAM",
    columns: ITAM_TABLE_COLUMNS,
    renderProblemHead: (columns) => `<tr>${columns.map(renderKasperskyHeaderCell).join("")}</tr>`,
    problemSortColumns: ITAM_PROBLEM_COLUMNS,
    pageSize: ITAM_TABLE_PAGE_SIZE,
    dateSortKeys: ["lastInventory"],
    fitPlan: ITAM_FIT_PLAN,
    marqueeCells: ITAM_MARQUEE_KEYS.map((key) => `[data-kav-col="${key}"]`).join(", "),
    renderRows: renderItamRows,
    renderDetailRows: renderItamDetailRows,
    loadCached: loadManagePcItamCached,
    getCached: (sess) => getManagePcItamCache(sess),
    session,
    onLoaded: (target, loadedItems) => updateItamStatusSummary(target, loadedItems),
    onLoadError: (target) => setItamStatusSummaryUnavailable(target)
  });
}

function bindKaceTable(container, session) {
  bindEndpointTable(container, {
    cardSelector: ".mpc-kav-card",
    headSelector: "[data-kace-head]",
    rowsSelector: "[data-kace-rows]",
    searchSelector: "[data-kace-search]",
    countSelector: "[data-kace-count]",
    paginationSelector: "[data-kace-pagination]",
    problemCardSelector: "[data-kace-problem-card]",
    problemHeadSelector: "[data-kace-problem-head]",
    problemRowsSelector: "[data-kace-problem-rows]",
    problemCountSelector: "[data-kace-problem-count]",
    problemToggleSelector: "[data-kace-problem-toggle]",
    problemContentId: "kaceProblemContent",
    problemTitle: "Data KACE Bermasalah",
    loadingLabel: "KACE",
    navLabel: "Navigasi halaman KACE",
    columns: KACE_TABLE_COLUMNS,
    columnsFromData: (data, fallback) => {
      if (!Array.isArray(data.columns) || data.columns.length !== 10) return fallback;
      return [
        fallback[0],
        ...data.columns.map((column, index) => ({
          key: fallback[index + 1].key,
          label: String(column.label || fallback[index + 1].label)
        }))
      ];
    },
    renderProblemHead: (columns) => `<tr>${columns.map(renderKasperskyHeaderCell).join("")}</tr>`,
    problemSortColumns: KACE_PROBLEM_COLUMNS,
    problemSortIndexByKey: KACE_PROBLEM_ROW_INDEX,
    pageSize: KACE_TABLE_PAGE_SIZE,
    fitPlan: KACE_FIT_PLAN,
    marqueeCells: KACE_MARQUEE_KEYS.map((key) => `[data-kav-col="${key}"]`).join(", "),
    renderRows: renderKaceRows,
    renderDetailRows: renderKaceDetailRows,
    loadCached: loadManagePcKaceCached,
    getCached: (sess) => getManagePcKaceCache(sess),
    session,
    onLoaded: (target, loadedItems) => updateKaceStatusSummary(target, loadedItems),
    onLoadError: (target) => setKaceStatusSummaryUnavailable(target)
  });
}

/* Panel konten utama per (modul + scope). Saat backend modul siap,
   bagian inilah yang diganti dengan tabel/detail yang sesungguhnya. */
function renderScopePanel(module, activeScope) {
  /* Submenu Kaspersky Office: tabel endpoint menggantikan panel
     "Dalam Pengembangan" (data blok B203:K400 sheet MASTER REPORT OFFICE). */
  if (module.key === "manage-pc-kaspersky" && activeScope === "office") {
    return `${renderKasperskyProblemSection()}${renderKasperskyTableSection()}`;
  }

  if (module.key === "manage-pc-itam" && activeScope === "office") {
    return `${renderItamProblemSection()}${renderItamTableSection()}`;
  }

  if (module.key === "manage-pc-kace" && activeScope === "office") {
    return `${renderKaceProblemSection()}${renderKaceTableSection()}`;
  }

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
        !cachedSummary,
        session
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

  if (module.key === "manage-pc-kaspersky" && activeScope === "office") {
    bindKasperskyTable(container, session);
  }

  if (module.key === "manage-pc-itam" && activeScope === "office") {
    bindItamTable(container, session);
  }

  if (module.key === "manage-pc-kace" && activeScope === "office") {
    bindKaceTable(container, session);
  }

  if (activeScope !== "office" || cachedSummary) return;

  loadManagePcSummaryCached(activeScope, session)
    .then((result) => {
      const summaryElement = container.querySelector("[data-mpc-summary]");
      if (summaryElement) {
        summaryElement.outerHTML = renderSummary(result.success ? result.data : result, module.key, false, session);
      }
    })
    .catch((error) => {
      const summaryElement = container.querySelector("[data-mpc-summary]");
      if (summaryElement) {
        summaryElement.outerHTML = renderSummary({
          success: false,
          message: error.message || "Ringkasan Manage PC gagal dimuat."
        }, module.key, false, session);
      }
    });
}