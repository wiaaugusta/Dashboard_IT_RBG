/**
 * PAGES/GROUP-SUMMARY.JS - HALAMAN PARENT MENU BERSUBMENU
 * ------------------------------------------------------------
 * Menu utama yang memiliki submenu (AHO, Manage PC, Checklist) sekarang
 * juga punya HALAMAN SENDIRI. Di sidebar, label/icon parent menjadi link
 * ke halaman ini (parent link / clickable dropdown), sedangkan chevron
 * tetap berfungsi membuka/menutup submenu.
 *
 * Isi halaman = RANGKUMAN data submenu:
 * - Satu kartu per submenu (diambil dari NAV_ITEMS, jadi otomatis ikut
 *   nav-config) berisi deskripsi + placeholder angka "Menunggu
 *   integrasi data".
 * - Kartu langsung membuka halaman submenu-nya.
 *
 * Akses halaman dijaga di app.js (GROUP_SUMMARY_ROLES):
 * - /aho       -> semua role yang sudah login.
 * - /manage-pc -> ADMIN, IT_OFFICE, IT_STORE (lingkup data per role
 *                ditentukan di dalam halaman modul masing-masing).
 * - /checklist -> ADMIN saja (submenu Office/Store hanya untuk admin;
 *                IT Office/Store membuka checklist-nya langsung).
 */

import { renderShell } from "../shell.js";
import { getSession } from "../auth.js";
import { getQueryParam } from "../router.js";
import { NAV_ITEMS, isVisibleForRole } from "../nav-config.js";
import { icon } from "../icons.js";
import { initTooltips } from "../ui.js";
import { loadManagePcList, loadManagePcSummary } from "../api.js";

const MANAGE_PC_PAGE_SIZE = 15;
/* Tab tampilan tabel "IT Asset & Device Inventory Management".
 *   inventory : semua perangkat (total device), kolom status KAV, ITAM, KACE
 *   unmanaged : semua perangkat, kolom status H-L (KAV, Versi KAV, ITAM,
 *               Privilege, KACE) - header kolom hanya muncul kalau ada
 *               nilai selain "OK"
 * Tab aktif disimpan di hash query (?view=inventory|unmanaged) supaya
 * deep-linkable: refresh / back button tetap berada di tab yang sama. */
const MANAGE_PC_TABLE_TABS = [
  { key: "inventory", label: "Inventory", icon: "itam" },
  { key: "unmanaged", label: "Unmanaged", icon: "alert" }
];
/* Kolom dasar (identitas perangkat) - selalu tampil di kedua tab.
   Kolom "No" (penomoran baris) TIDAK punya fitur sort -
   urutannya mengikuti urutan data. */
const MANAGE_PC_BASE_COLUMNS = [
  { key: "no", label: "No", sortable: false },
  { key: "namaKomputer", label: "Nama Komputer", sortable: true },
  { key: "divisi", label: "Divisi", sortable: true },
  { key: "alamatIp", label: "Alamat IP", sortable: true },
  { key: "workgroup", label: "Workgroup", sortable: true },
  { key: "model", label: "Model", sortable: true },
  { key: "sistemOperasi", label: "Sistem Operasi", sortable: true }
];
/* Kolom status manajemen perangkat (sheet MASTER REPORT OFFICE kolom H-L):
 *   H = MANAGE KAV, I = VERSI KAV, J = MANAGE ITAM, K = PRIVILEGE ITAM, L = MANAGE KACE
 * Pada tab Unmanaged HANYA kolom yang punya nilai selain "OK" yang ditampilkan
 * - daftar kolom dikirim backend pada field "statusColumns".
 * Tab Inventory memakai kolom status tetap (KAV, ITAM, KACE).
 * Privilege ITAM memakai nilai mentah sel supaya "tidak ditemukan" tetap
 * tampil sebagai ikon "tidak ditemukan" (bukan NOK). */
const MANAGE_PC_STATUS_COLUMNS = [
  { key: "manageKav", label: "KAV", inventoryLabel: "Kaspersky", value: "manageKav" },
  { key: "versiKav", label: "Versi KAV", value: "versiKav" },
  { key: "manageItam", label: "ITAM", value: "manageItam" },
  { key: "privilegeItam", label: "Privilege", value: "privilegeItam" },
  { key: "manageKace", label: "KACE", value: "manageKace" }
].map((column) => ({
  ...column,
  sortable: true
}));
/* Kolom status tetap pada tab Inventory. */
const MANAGE_PC_INVENTORY_STATUS_KEYS = ["manageKav", "manageItam", "manageKace"];
/* Kolom yang boleh disembunyikan kalau tabel terlalu sempit (urutan prioritas:
   "Sistem Operasi" lebih dulu, lalu "Model" dan "Workgroup"), supaya judul
   kolom lain tetap muat dan tidak ada kolom yang terpotong. */
const MANAGE_PC_HIDEABLE_COLUMNS = ["sistemOperasi", "model", "workgroup"];

/**
 * Kolom inventaris yang ditampilkan saat Nama Komputer diklik (baris detail).
 * Sumber data: kolom M-V sheet MASTER REPORT OFFICE yang sudah dipetakan
 * backend ke field item getManagePcList. Urutan = urutan tampil; layout
 * pasangan vertikal 5 kolom x 2 baris (kolom 1: M atas N bawah, kolom 2:
 * O atas P bawah, kolom 3: Q atas R bawah, kolom 4: S atas T bawah,
 * kolom 5: U atas V bawah).
 */
const MANAGE_PC_SPEC_FIELDS = [
  { key: "macAddress", label: "MAC Address" },        // M
  { key: "serialNumber", label: "Serial Number" },     // N
  { key: "merk", label: "Merk" },                      // O
  { key: "modelKomputer", label: "Model Komputer" },   // P
  { key: "totalRam", label: "Total RAM" },             // Q
  { key: "totalHardisk", label: "Total Harddisk" },    // R
  { key: "kapasitasDriveC", label: "Kapasitas Drive C" }, // S
  { key: "kapasitasDriveD", label: "Kapasitas Drive D" }, // T
  { key: "userLogged", label: "User Logged" },         // U
  { key: "processors", label: "Processors" }           // V
];

// Keterangan "tidak ditemukan" di sheet -> tampil sebagai unknown.
const MANAGE_PC_NOT_FOUND_RE = /^(?:NOT\s*FOUND|(?:TIDAK|TDK|BELUM)\s+(?:DI\s*)?TEMUKAN)$/i;

/**
 * Nilai sel inventaris M-V untuk ditampilkan.
 * - kosong -> "-"
 * - keterangan tidak ditemukan -> "unknown"
 * - tanpa huruf & angka (mis. "-", "—", "/") -> "-"
 * - selain itu apa adanya
 */
function formatInventoryValue(value) {
  const text = value == null ? "" : String(value).trim();
  if (!text) return "-";
  if (MANAGE_PC_NOT_FOUND_RE.test(text)) return "unknown";
  if (!/[A-Za-z0-9]/.test(text)) return "-";
  return text;
}

/**
 * Panel detail inventaris: kalau lima pasangan kolom tidak muat dalam satu
 * baris, pasangan terakhir dipisah - baris bawahnya (mis. "Processors")
 * dipindahkan ke tabel pasangan pertama, sehingga posisinya tepat di bawah
 * "Serial Number" dan titik dua-nya tetap segaris. Dengan begitu tepi kanan
 * kotak tidak terpotong dan tabel utama tidak ikut bergeser.
 * @param {HTMLElement} panel - elemen .mpc-spec
 */
function fitManagePcSpecPanel(panel) {
  const grid = panel.querySelector(".mpc-spec__grid");
  if (!grid) return;
  const tables = Array.from(grid.querySelectorAll(".mpc-spec__table"));
  if (tables.length < 2) return;

  /* Lebar isi seluruh pasangan + jarak antar kolom. */
  const gap = 28;
  let contentWidth = 0;
  tables.forEach((table) => {
    contentWidth += Math.max(table.getBoundingClientRect().width, table.scrollWidth);
  });
  contentWidth += gap * (tables.length - 1);
  if (contentWidth <= grid.clientWidth + 1) return;

  const lastTable = tables[tables.length - 1];
  const lastBody = lastTable.querySelector("tbody");
  const lastRows = lastBody ? lastBody.querySelectorAll("tr") : [];
  if (lastRows.length < 2) return;
  const firstBody = tables[0].querySelector("tbody");
  if (!firstBody) return;

  /* Baris bawah pasangan terakhir pindah ke pasangan pertama; gaya baris
     ditukar supaya garis bawahnya tetap rapi. */
  const moved = lastRows[1];
  const staying = lastRows[0];
  moved.classList.remove("mpc-spec__row--bottom");
  moved.classList.add("mpc-spec__row--top");
  staying.classList.remove("mpc-spec__row--top");
  staying.classList.add("mpc-spec__row--bottom");
  firstBody.appendChild(moved);
}

function renderManagePcSpecPanel(item) {
  const deviceName = item.namaKomputer == null || String(item.namaKomputer).trim() === ""
    ? "—"
    : String(item.namaKomputer).trim();
  const renderSpecItem = (field, position) => `
    <tr class="mpc-spec__row mpc-spec__row--${position}">
      <td class="mpc-spec__label">${escapeHtml(field.label)}</td>
      <td class="mpc-spec__sep" aria-hidden="true">:</td>
      <td class="mpc-spec__value">${escapeHtml(formatInventoryValue(item[field.key]))}</td>
    </tr>
  `;
  /* Satu TABEL per pasangan vertikal (M/N, O/P, Q/R, S/T, U). Table
     auto-layout membuat lebar kolom label otomatis mengikuti label
     terpanjang di pasangan itu (mis. "Merk" & "Model Komputer"), sehingga
     TITIK DUA selalu segaris. Garis bawah satu per baris (td), jadi
     label & value punya garis yang sama. */
  const cols = [];
  for (let i = 0; i < MANAGE_PC_SPEC_FIELDS.length; i += 2) {
    const pair = [MANAGE_PC_SPEC_FIELDS[i], MANAGE_PC_SPEC_FIELDS[i + 1]].filter(Boolean);
    const rows = pair.map((field, j) => renderSpecItem(field, j === 0 ? "top" : "bottom")).join("");
    cols.push(`
      <table class="mpc-spec__table">
        <tbody>${rows}</tbody>
      </table>
    `);
  }

  return `
    <div class="mpc-spec">
      <p class="mpc-spec__title">${icon("pc", { size: 15 })}<span>Inventory Device</span><span class="mpc-spec__device">[${escapeHtml(deviceName)}]</span></p>
      <div class="mpc-spec__grid" role="presentation">${cols.join("")}</div>
    </div>
  `;
}

/**
 * Meta per menu parent: warna aksen hero + deskripsi, aksen, dan label
 * statistik per submenu. Angka statistik masih placeholder (backend
 * belum tersedia) - saat backend siap, cukup hidupkan nilainya tanpa
 * mengubah navigasi.
 */
const GROUP_META = {
  aho: {
    accent: "amber",
    kicker: "Asset & Hardware Operation",
    subtitle: "Ringkasan SLA AHO Store dan SLA Form Hardware dalam satu tampilan.",
    children: {
      "aho-sla-store": {
        accent: "amber",
        description: "Monitoring & rekap SLA AHO seluruh Store.",
        stats: ["Total Ticket", "SLA Achievement", "Overdue"]
      },
      "aho-sla-hardware": {
        accent: "amber",
        description: "Pengajuan & pemantauan SLA Form Hardware.",
        stats: ["Total Request", "Selesai", "Overdue"]
      }
    }
  },

  "manage-pc": {
    accent: "purple",
    kicker: "Kaspersky · ITAM · KACE",
    subtitle: "Ringkasan ketiga modul pengelolaan PC dalam satu tampilan.",
    children: {
      "manage-pc-kaspersky": {
        accent: "blue",
        description: "Endpoint Security - proteksi, update database & compliance.",
        stats: ["Total Device", "Manage", "Not Manage"]
      },
      "manage-pc-itam": {
        accent: "teal",
        description: "IT Asset Management - inventaris & lifecycle aset.",
        stats: ["Total Device", "Manage", "Not Manage"]
      },
      "manage-pc-kace": {
        accent: "purple",
        description: "Systems Deployment - deployment OS, agent & otomasi.",
        stats: ["Total Device", "Manage", "Not Manage"]
      }
    }
  },

  checklist: {
    accent: "blue",
    kicker: "Operational IT Checklist",
    subtitle: "Ringkasan checklist lingkup Office dan Store dalam satu tampilan.",
    children: {
      "checklist-office": {
        accent: "blue",
        description: "Checklist pekerjaan IT lingkup Head Office.",
        stats: ["Item", "Selesai", "Pending"]
      },
      "checklist-store": {
        accent: "blue",
        description: "Checklist pekerjaan IT seluruh Store.",
        stats: ["Item", "Selesai", "Pending"]
      }
    }
  }
};

const MANAGE_PC_EXTRA_CARDS = {
  "manage-pc-kaspersky-version": {
    key: "manage-pc-kaspersky-version",
    label: "Versi Kaspersky",
    path: "/manage-pc/kaspersky",
    icon: "kaspersky",
    accent: "blue",
    description: "Status OK dan NOK versi Kaspersky pada seluruh device.",
    stats: ["Total Device", "Version OK", "Version NOK"]
  },
  "manage-pc-itam-privilege": {
    key: "manage-pc-itam-privilege",
    label: "Privilege ITAM",
    path: "/manage-pc/itam",
    icon: "itam",
    accent: "teal",
    description: "Status OK dan NOK privilege ITAM pada seluruh device.",
    stats: ["Total Device", "Privilege OK", "Privilege NOK"]
  }
};

/**
 * Catatan lingkup data per menu parent sesuai role login.
 * IT Office/Store membuka Manage PC TANPA pembagian Office/Store karena
 * login sudah menentukan jabatannya.
 */
function getScopeNote(role, groupKey) {
  if (groupKey === "manage-pc" && role !== "ADMIN") {
    const scopeLabel = role === "IT_STORE" ? "Store" : "Office";
    return `Lingkup data mengikuti jabatan login Anda (${scopeLabel}) - tanpa pemilihan scope Office/Store.`;
  }

  if (groupKey === "manage-pc") {
    return "Lingkup Office/Store dipilih di dalam halaman tiap modul (tab in-page).";
  }

  return "Klik kartu untuk membuka halaman submenu.";
}

/**
 * Render halaman parent (rangkuman submenu).
 * @param {HTMLElement} container
 * @param {{key: string, label: string, path: string, parentKey: string,
 *          parentLabel: string}} routeInfo - item flat route dari nav-config.
 */
export function renderGroupSummaryPage(container, routeInfo) {
  const session = getSession();
  if (!session) return;

  const group = NAV_ITEMS.find((item) => item.key === routeInfo.key);
  const meta = GROUP_META[routeInfo.key];
  if (!group || !meta || !group.children) return;

  const visibleChildren = group.children
    .filter((child) => isVisibleForRole(child, session.role));
  const isManagePc = routeInfo.key === "manage-pc";
  const canChooseScope = isManagePc && session.role === "ADMIN";
  const activeScope = canChooseScope
    ? (getQueryParam("scope") === "store" ? "store" : "office")
    : (session.role === "IT_STORE" ? "store" : "office");
  const activeView = getManagePcActiveView();
  const cards = renderGroupCards(visibleChildren, meta, null, isManagePc, activeScope, isManagePc && activeScope === "office");

  const contentHtml = `
    <div class="gsp-page">
      ${isManagePc ? renderManagePcScopeBar(activeScope, canChooseScope, activeView) : renderHero(group, meta)}

      <section class="gsp-cards${isManagePc ? " gsp-cards--manage-pc" : ""}" data-group-summary-cards aria-label="Rangkuman submenu ${escapeHtml(group.label)}">
        ${cards.join("")}
      </section>

      ${isManagePc && activeScope === "office" ? '<p class="mpc-table__summary-error" data-manage-pc-summary-error role="alert" hidden></p>' : ""}
      ${isManagePc && activeScope === "office" ? renderManagePcTable(activeView, activeScope) : ""}
      ${!isManagePc ? `
        <div class="mpc-note" aria-live="polite">
          ${icon("info", { size: 16 })}
          <span>${escapeHtml(getScopeNote(session.role, routeInfo.key))} Angka pada kartu masih placeholder &mdash; menunggu integrasi data backend.</span>
        </div>
      ` : ""}
    </div>
  `;

  renderShell(container, {
    activeKey: routeInfo.key,
    pageTitle: isManagePc ? "Manage PC" : routeInfo.label,
    contentHtml
  });

  if (isManagePc && activeScope === "office") {
    bindManagePcTable(container, session, activeView);
  }

  /* Tooltip kustom (data-tooltip) untuk ikon status. */
  initTooltips(document);

  if (isManagePc && activeScope === "office") {
    loadManagePcSummary("office", { sessionToken: session.sessionToken })
      .then((result) => {
        const cardsElement = container.querySelector("[data-group-summary-cards]");
        const errorElement = container.querySelector("[data-manage-pc-summary-error]");
        if (result.success && result.data) {
          if (cardsElement) {
            cardsElement.innerHTML = renderGroupCards(visibleChildren, meta, result.data, true, activeScope).join("");
          }
          updateManagePcViewCounts(container, result.data);
        } else if (errorElement) {
          errorElement.textContent = result.message || "Ringkasan Manage PC gagal dimuat.";
          errorElement.hidden = false;
        }
      })
      .catch((error) => {
        const errorElement = container.querySelector("[data-manage-pc-summary-error]");
        if (errorElement) {
          errorElement.textContent = error.message || "Ringkasan Manage PC gagal dimuat.";
          errorElement.hidden = false;
        }
        console.error("[group-summary.js] Ringkasan Manage PC gagal dimuat:", error);
      });
  }
}

/**
 * Tab inventaris yang sedang aktif (dari hash query ?view=...).
 * Nilai yang tidak dikenal -> tab utama "Inventory".
 * @returns {string} key tab aktif
 */
function getManagePcActiveView() {
  const requested = getQueryParam("view");
  return MANAGE_PC_TABLE_TABS.some((tab) => tab.key === requested)
    ? requested
    : MANAGE_PC_TABLE_TABS[0].key;
}

/**
 * Isi angka jumlah perangkat pada badge tiap tab (Inventory / Unmanaged).
 * Inventory = total device, Unmanaged = perangkat dengan status H-L
 * yang selain "OK".
 * @param {HTMLElement} container
 * @param {object} summaryData
 */
function updateManagePcViewCounts(container, summaryData) {
  const inventory = summaryData?.inventory || {};
  const counts = {
    inventory: inventory.total,
    unmanaged: inventory.unmanaged
  };
  container.querySelectorAll("[data-mpc-view-count]").forEach((element) => {
    const key = element.getAttribute("data-mpc-view-count");
    const value = counts[key];
    element.textContent = value == null ? "" : Number(value).toLocaleString();
  });
}

/**
 * Tab tampilan di dalam card tabel inventaris.
 * @param {string} activeView - tab aktif (inventory | unmanaged)
 * @param {string} activeScope - scope aktif (office | store)
 */
function renderManagePcTableTabs(activeView, activeScope) {
  return `
    <nav class="mpc-table-tabs" role="tablist" aria-label="Tampilan inventaris perangkat">
      ${MANAGE_PC_TABLE_TABS.map((tab) => {
        const isActive = tab.key === activeView;
        return `
          <a
            href="#/manage-pc?scope=${encodeURIComponent(activeScope)}&view=${encodeURIComponent(tab.key)}"
            class="mpc-table-tab${isActive ? " is-active" : ""}"
            role="tab"
            aria-selected="${isActive}"
            ${isActive ? 'aria-current="page"' : ""}
            data-mpc-view="${tab.key}"
          >
            ${icon(tab.icon, { size: 15 })}
            <span>${escapeHtml(tab.label)}</span>
            <span class="mpc-table-tab__count" data-mpc-view-count="${tab.key}"></span>
          </a>
        `;
      }).join("")}
    </nav>
  `;
}

/**
 * Card tabel "IT Asset & Device Inventory Management".
 * @param {string} activeView - tab aktif (inventory | unmanaged)
 * @param {string} activeScope - scope aktif (office | store)
 */
function renderManagePcTable(activeView, activeScope) {
  const statusColumns = managePcInitialStatusColumns(activeView);
  const headers = renderManagePcTableHead(activeView, statusColumns);

  return `
    <section class="mpc-table-card" aria-labelledby="mpcTableTitle">
      <header class="mpc-table-card__header">
        <div class="mpc-table-card__title-group">
          <span class="mpc-table-card__title-icon" aria-hidden="true">${icon("pc", { size: 18 })}</span>
          <h2 id="mpcTableTitle">IT Asset &amp; Device Inventory Management</h2>
        </div>
        <div class="mpc-table-card__controls">
          <label class="mpc-table-search">
            ${icon("search", { size: 17 })}
            <span class="visually-hidden">Cari perangkat</span>
            <input type="search" data-mpc-search placeholder="Cari perangkat..." autocomplete="off">
          </label>
        </div>
      </header>
      ${renderManagePcTableTabs(activeView, activeScope)}
      <div class="mpc-table-wrapper">
        <table class="mpc-table">
          <thead>${headers}</thead>
          <tbody data-mpc-rows>
            ${renderManagePcSkeletonRows(MANAGE_PC_BASE_COLUMNS.length + statusColumns.length)}
          </tbody>
        </table>
      </div>
      <footer class="mpc-table__footer">
        <div class="mpc-table__count" data-mpc-count aria-live="polite"></div>
        <div class="mpc-table__footer-right" data-mpc-pagination></div>
      </footer>
    </section>
  `;
}

/**
 * Label kolom sesuai tab aktif.
 * @param {object} column - definisi kolom
 * @param {string} activeView - tab aktif (inventory | unmanaged)
 */
function managePcColumnLabel(column, activeView) {
  if (activeView === "inventory" && column.inventoryLabel) return column.inventoryLabel;
  return column.label;
}

/**
 * Daftar kolom status yang tampil sebelum data arrived.
 * Tab Inventory memakai kolom status tetap; tab Unmanaged menunggu
 * daftar kolom dari backend (hanya kolom H-L yang ada nilai != "OK").
 * @param {string} activeView - tab aktif (inventory | unmanaged)
 */
function managePcInitialStatusColumns(activeView) {
  if (activeView === "unmanaged") return [];
  return MANAGE_PC_STATUS_COLUMNS.filter((column) =>
    MANAGE_PC_INVENTORY_STATUS_KEYS.indexOf(column.key) !== -1);
}

/**
 * Daftar kolom status dari response backend (field statusColumns).
 * @param {string} activeView - tab aktif (inventory | unmanaged)
 * @param {object} data - response getManagePcList
 */
function managePcStatusColumnsFor(activeView, data) {
  const keys = data && Array.isArray(data.statusColumns) ? data.statusColumns : [];
  const columns = [];
  keys.forEach((key) => {
    const column = MANAGE_PC_STATUS_COLUMNS.find((item) => item.key === key);
    if (column) columns.push(column);
  });
  return columns.length ? columns : managePcInitialStatusColumns(activeView);
}

function renderManagePcHeaderCell(column, label) {
  if (column.sortable === false) {
    return `
        <th scope="col" data-mpc-col="${column.key}">
          <span class="mpc-table__th-label">${escapeHtml(label)}</span>
        </th>
      `;
  }
  return `
        <th scope="col" data-mpc-col="${column.key}" aria-sort="none" data-sort-header="${column.key}">
          <button type="button" class="mpc-table__th-sort" data-sort-key="${column.key}"
            aria-label="Urutkan berdasarkan ${escapeHtml(label)}">
            <span class="mpc-table__th-label">${escapeHtml(label)}</span>
            <span class="mpc-table__sort-arrows" aria-hidden="true">
              <span class="mpc-table__sort-arrow" data-sort-direction="asc">${icon("arrow-up", { size: 10 })}</span>
              <span class="mpc-table__sort-arrow" data-sort-direction="desc">${icon("arrow-down", { size: 10 })}</span>
            </span>
          </button>
        </th>
      `;
}

/**
 * Header tabel: kolom dasar + kolom status yang sedang tampil.
 * @param {string} activeView - tab aktif (inventory | unmanaged)
 * @param {Array} statusColumns - kolom status yang tampil
 */
function renderManagePcTableHead(activeView, statusColumns) {
  const columns = MANAGE_PC_BASE_COLUMNS.concat(statusColumns);
  return `<tr>${columns.map((column) =>
    renderManagePcHeaderCell(column, managePcColumnLabel(column, activeView))).join("")}</tr>`;
}

function renderManagePcStatus(value) {
  const status = value == null ? "" : String(value).trim().toUpperCase();
  if (status === "OK") {
    return '<span class="mpc-status mpc-status--ok" role="img" aria-label="OK" data-tooltip="OK">✓</span>';
  }
  if (status === "NOK") {
    return '<span class="mpc-status mpc-status--nok" role="img" aria-label="NOK" data-tooltip="NOK">×</span>';
  }
  if (!status || status === "-" || status === "NOT FOUND" || /^TIDAK\s+(?:DI\s*)?TEMUKAN$/.test(status)) {
    return '<span class="mpc-status mpc-status--empty" role="img" aria-label="Tidak ditemukan" data-tooltip="Tidak ditemukan">−</span>';
  }
  return `<span class="mpc-status mpc-status--other">${escapeHtml(value)}</span>`;
}

/**
 * Baris skeleton saat tabel sedang memuat data (pola sama dengan tabel
 * CCTV: blok abu-abu beranimasi, bukan teks "Memuat data...").
 * @param {number} columnCount - jumlah kolom yang tampil
 */
function renderManagePcSkeletonRows(columnCount) {
  const rowCount = 6;
  const rows = [];
  for (let row = 0; row < rowCount; row++) {
    const cells = [];
    for (let col = 0; col < columnCount; col++) {
      const width = col === 0 ? 55 : col === 1 ? 85 : 62 + ((row + col) % 3) * 12;
      cells.push(`<td><span class="skeleton mpc-table__skeleton-bar" style="width:${width}%"></span></td>`);
    }
    rows.push(`<tr class="mpc-table__skeleton-row">${cells.join("")}</tr>`);
  }
  return rows.join("");
}

/**
 * Baris tabel perangkat.
 * @param {Array} items - perangkat pada halaman ini
 * @param {number} startIndex - index baris pertama pada seluruh hasil
 * @param {Array} statusColumns - kolom status yang tampil
 * @param {string} activeView - tab aktif (inventory | unmanaged)
 */
function renderManagePcRows(items, startIndex, statusColumns, activeView = "inventory") {
  const columnCount = MANAGE_PC_BASE_COLUMNS.length + statusColumns.length;
  if (items.length === 0) {
    return `<tr><td colspan="${columnCount}" class="mpc-table__state">Tidak ada perangkat yang cocok.</td></tr>`;
  }

  return items.map((item, index) => {
    const globalIndex = startIndex + index;
    const detailId = `mpc-spec-${globalIndex}`;
    /* Tab Inventory memakai nomor dari sheet, tab Unmanaged memakai nomor
       urut (dimulai dari 1) sesuai urutan tampil. */
    const rowNumber = activeView === "unmanaged"
      ? globalIndex + 1
      : (item.no == null || item.no === "" ? globalIndex + 1 : item.no);
    const statusCells = statusColumns.map((column) => `
      <td class="mpc-table__status">${renderManagePcStatus(item[column.value])}</td>
    `).join("");
    return `
    <tr class="mpc-table__row">
      <td class="mpc-table__number" data-mpc-col="no">${escapeHtml(rowNumber)}</td>
      <td class="mpc-table__device" data-mpc-col="namaKomputer">
        <button type="button" class="mpc-device-toggle" data-mpc-toggle
          aria-expanded="false" aria-controls="${detailId}">
          <span class="mpc-device-toggle__name">${escapeHtml(item.namaKomputer || "—")}</span>
        </button>
      </td>
      <td data-mpc-col="divisi">${escapeHtml(item.divisi || "—")}</td>
      <td data-mpc-col="alamatIp">${escapeHtml(item.alamatIp || "—")}</td>
      <td data-mpc-col="workgroup">${escapeHtml(item.workgroup || "—")}</td>
      <td data-mpc-col="model">${escapeHtml(item.model || "—")}</td>
      <td data-mpc-col="sistemOperasi">${escapeHtml(item.sistemOperasi || "—")}</td>
      ${statusCells}
    </tr>
    <tr class="mpc-table__spec" id="${detailId}" hidden>
      <td class="mpc-table__spec-cell" colspan="${columnCount}">${renderManagePcSpecPanel(item)}</td>
    </tr>`;
  }).join("");
}

function bindManagePcTable(container, session, activeView = "inventory") {
  const table = container.querySelector(".mpc-table-card");
  if (!table) return;

  const searchInput = table.querySelector("[data-mpc-search]");
  const rowsElement = table.querySelector("[data-mpc-rows]");
  const headElement = table.querySelector("thead");
  const tableElement = table.querySelector(".mpc-table");
  const tableWrapper = table.querySelector(".mpc-table-wrapper");
  const countElement = table.querySelector("[data-mpc-count]");
  const paginationElement = table.querySelector("[data-mpc-pagination]");
  let page = 1;
  let search = "";
  let sortBy = "";
  let sortDirection = "asc";
  let requestId = 0;
  let searchTimer = null;
  let totalPages = 1;
  /* Kolom status yang tampil. Pada tab Unmanaged kolomnya ditentukan backend:
     hanya kolom H-L yang punya nilai selain "OK". */
  let statusColumns = managePcInitialStatusColumns(activeView);
  const hiddenColumns = new Set();

  function columnCount() {
    return MANAGE_PC_BASE_COLUMNS.length + statusColumns.length;
  }

  /* ---------- Penyesuaian kolom saat tabel menyempit ----------
     Kalau lebar tabel melebihi card (mis. sidebar di-hover sehingga area
     konten menyempit), kolom dengan prioritas terendah disembunyikan satu
     per satu -|System Operasi dulu- supaya judul kolom lain tetap muat
     dan tidak ada kolom yang terpotong. */
  function applyHiddenColumns() {
    MANAGE_PC_HIDEABLE_COLUMNS.forEach((key) => {
      const isHidden = hiddenColumns.has(key);
      table.querySelectorAll(`[data-mpc-col="${key}"]`).forEach((element) => {
        element.classList.toggle("is-hidden-column", isHidden);
      });
    });
  }

  function updateColumnFit() {
    if (!tableElement || !tableWrapper) return;
    hiddenColumns.clear();
    applyHiddenColumns();
    const available = tableWrapper.clientWidth;
    for (const key of MANAGE_PC_HIDEABLE_COLUMNS) {
      if (tableElement.getBoundingClientRect().width <= available + 1) break;
      hiddenColumns.add(key);
      applyHiddenColumns();
    }
  }

  function updateSortHeaders() {
    table.querySelectorAll("[data-sort-key]").forEach((button) => {
      const key = button.getAttribute("data-sort-key");
      const header = button.closest("[data-sort-header]");
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
      button.querySelectorAll("[data-sort-direction]").forEach((arrow) => {
        arrow.classList.toggle("is-active", arrow.getAttribute("data-sort-direction") === activeDirection);
      });
    });
  }

  function updatePagination(data) {
    const total = Number(data.total) || 0;
    totalPages = Math.max(1, Number(data.totalPages) || 1);
    const first = total ? ((page - 1) * MANAGE_PC_PAGE_SIZE) + 1 : 0;
    const last = Math.min(page * MANAGE_PC_PAGE_SIZE, total);
    countElement.textContent = `Menampilkan ${first}–${last} dari ${total} perangkat`;
    paginationElement.innerHTML = totalPages > 1 ? `
      <div class="mpc-table__page-actions" role="navigation" aria-label="Navigasi halaman perangkat">
        <button type="button" class="mpc-table__page-button" data-page="prev"
          aria-label="Halaman sebelumnya" ${page <= 1 ? "disabled" : ""}>&lsaquo;</button>
        ${renderManagePcPageNumbers(page, totalPages)}
        <button type="button" class="mpc-table__page-button" data-page="next"
          aria-label="Halaman berikutnya" ${page >= totalPages ? "disabled" : ""}>&rsaquo;</button>
      </div>
    ` : "";
  }

  async function loadPage() {
    const thisRequest = ++requestId;
    rowsElement.innerHTML = renderManagePcSkeletonRows(columnCount());
    countElement.textContent = "";
    paginationElement.innerHTML = "";
    const result = await loadManagePcList("kaspersky", "office", {
      page,
      limit: MANAGE_PC_PAGE_SIZE,
      search,
      sortBy,
      sortDirection,
      view: activeView,
      sessionToken: session.sessionToken
    });
    if (thisRequest !== requestId) return;
    if (!result.success) {
      rowsElement.innerHTML = `<tr><td colspan="${columnCount()}" class="mpc-table__state mpc-table__state--error" role="alert">${escapeHtml(result.message || "Data perangkat gagal dimuat.")}</td></tr>`;
      countElement.textContent = "";
      return;
    }

    const data = result.data || {};
    const items = Array.isArray(data.items) ? data.items : [];
    page = Number(data.page) || page;
    /* Kolom status (dan header-nya) mengikuti data: pada tab Unmanaged
       hanya kolom H-L dengan nilai selain "OK" yang ditampilkan. */
    statusColumns = managePcStatusColumnsFor(activeView, data);
    if (headElement) {
      headElement.innerHTML = renderManagePcTableHead(activeView, statusColumns);
    }
    rowsElement.innerHTML = renderManagePcRows(items, (page - 1) * MANAGE_PC_PAGE_SIZE, statusColumns, activeView);
    updateColumnFit();
    updatePagination(data);
    updateSortHeaders();
  }

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      search = searchInput.value.trim();
      page = 1;
      loadPage();
    }, 250);
  });

  table.querySelector("thead").addEventListener("click", (event) => {
    const button = event.target.closest("[data-sort-key]");
    if (!button) return;
    const key = button.getAttribute("data-sort-key");
    // Siklus: ascending -> descending -> urutan asli.
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
    updateSortHeaders();
    loadPage();
  });

  paginationElement.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const pageValue = button.getAttribute("data-page");
    if (pageValue === "prev") page -= 1;
    else if (pageValue === "next") page += 1;
    else page = Number(pageValue);
    page = Math.max(1, Math.min(totalPages, page));
    loadPage();
  });

  /* Nama Komputer diklik -> buka/tutup baris inventaris (kolom M-V) tepat
     di bawah baris perangkat. Delegasi pada tbody: tetap bekerja setelah
     rows di-render ulang oleh search / sort / pagination. */
  rowsElement.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-mpc-toggle]");
    if (!toggle) return;
    const specRow = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!specRow) return;
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isExpanded));
    specRow.hidden = isExpanded;
    toggle.closest("tr").classList.toggle("is-expanded", !isExpanded);
    /* Panel detail: pasangan kolom yang tidak muat dipisah, supaya tepi
       kotak tidak terpotong dan tabel utama tidak ikut bergeser. */
    if (!isExpanded) {
      const panel = specRow.querySelector(".mpc-spec");
      if (panel) fitManagePcSpecPanel(panel);
    }
  });

  /* Lebar card berubah (mis. sidebar di-hover) -> sesuaikan kolom yang
     disembunyikan supaya tabel tetap muut tanpa kolom terpotong. */
  if (typeof ResizeObserver !== "undefined" && tableWrapper) {
    let lastWidth = 0;
    const observer = new ResizeObserver((entries) => {
      const width = Math.round(entries[0].contentRect.width);
      if (width === lastWidth) return;
      lastWidth = width;
      updateColumnFit();
    });
    observer.observe(tableWrapper);
  }

  loadPage();
}

function renderManagePcPageNumbers(page, totalPages) {
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
        data-page="${entry}" aria-label="Halaman ${entry}"${entry === page ? ' aria-current="page"' : ""}>${entry}</button>`
  ).join("");
}

function renderManagePcScopeBar(activeScope, canChooseScope, activeView = "inventory") {
  const scopes = ["office", "store"];
  const tabs = canChooseScope
    ? `
      <nav class="mpc-scope-tabs" role="tablist" aria-label="Lingkup Manage PC">
        ${scopes.map((scope) => `
          <a
            href="#/manage-pc?scope=${scope}&view=${activeView}"
            class="mpc-scope-tab${activeScope === scope ? " is-active" : ""}"
            role="tab"
            aria-selected="${activeScope === scope}"
            ${activeScope === scope ? 'aria-current="page"' : ""}
          >
            ${icon(scope === "office" ? "office" : "store", { size: 17 })}
            <span>${scope === "office" ? "Office" : "Store"}</span>
          </a>
        `).join("")}
      </nav>
    `
    : "";

  const description = activeScope === "store"
    ? "Ringkasan data Manage PC Store akan tersedia setelah sumber datanya terhubung."
    : "Ringkasan status Kaspersky, ITAM, Privilege ITAM, dan KACE untuk Office.";

  return `
    <header class="mpc-scope-bar${!canChooseScope ? " mpc-scope-bar--no-tabs" : ""}">
      ${tabs}
      <p>${escapeHtml(description)}</p>
    </header>
  `;
}

function renderGroupCards(children, meta, summaryData, isManagePc, activeScope = "office", isLoading = false) {
  const cards = [];
  children.forEach((child) => {
    cards.push(renderSummaryCard(child, meta.children[child.key], summaryData, isManagePc, activeScope, isLoading));

    if (isManagePc && child.key === "manage-pc-kaspersky") {
      cards.push(renderSummaryCard(
        MANAGE_PC_EXTRA_CARDS["manage-pc-kaspersky-version"],
        MANAGE_PC_EXTRA_CARDS["manage-pc-kaspersky-version"],
        summaryData,
        true,
        activeScope,
        isLoading
      ));
    }

    if (isManagePc && child.key === "manage-pc-itam") {
      cards.push(renderSummaryCard(
        MANAGE_PC_EXTRA_CARDS["manage-pc-itam-privilege"],
        MANAGE_PC_EXTRA_CARDS["manage-pc-itam-privilege"],
        summaryData,
        true,
        activeScope,
        isLoading
      ));
    }
  });
  return cards;
}

function renderHero(group, meta) {
  return `
    <section class="gsp-hero gsp-hero--${meta.accent}">
      <div class="gsp-hero__content">
        <div class="gsp-hero__crumbs">
          <a href="#/dashboard">Home</a>
          <span class="gsp-hero__crumb-sep">${icon("chevron", { size: 12 })}</span>
          <span class="gsp-hero__crumb-current">${escapeHtml(group.label)}</span>
        </div>
        <h2 class="gsp-hero__title">${escapeHtml(group.label)}</h2>
        <p class="gsp-hero__subtitle">${escapeHtml(meta.subtitle)}</p>
      </div>
      <div class="gsp-hero__badge">
        <span class="gsp-hero__badge-dot"></span>
        ${escapeHtml(meta.kicker)}
      </div>
    </section>
  `;
}

function renderSummaryCard(child, childMeta = {}, summaryData = null, showManageStats = false, activeScope = "office", isLoading = false) {
  const moduleData = child.key === "manage-pc-kaspersky-version"
    ? {
        ok: summaryData?.kaspersky?.versionOk,
        nok: summaryData?.kaspersky?.versionNok
      }
    : child.key === "manage-pc-itam-privilege"
      ? {
          ok: summaryData?.itam?.privilegeOk,
          nok: summaryData?.itam?.privilegeNok
        }
      : child.key === "manage-pc-kaspersky"
    ? summaryData?.kaspersky
    : child.key === "manage-pc-itam"
      ? summaryData?.itam
      : child.key === "manage-pc-kace"
        ? summaryData?.kace
        : null;
  const statValues = showManageStats
    ? [summaryData?.summary?.totalPc, moduleData?.ok, moduleData?.nok]
    : [];
  const stats = (childMeta.stats || [])
    .map((statLabel, index) => `
      <div class="gsp-card__stat">
        <small>${escapeHtml(statLabel)}</small>
        <strong>${renderMetricValue(statValues[index], isLoading)}</strong>
      </div>
    `)
    .join("");
  const pageLabel = child.key === "manage-pc-kaspersky-version"
    ? "Kaspersky"
    : child.key === "manage-pc-itam-privilege"
      ? "ITAM"
      : child.label;

  return `
    <a
      href="#${child.path}${getScopeSuffix(showManageStats, activeScope)}"
      class="gsp-card gsp-card--${childMeta.accent || "blue"}"
    >
      <div class="gsp-card__header">
        <div class="gsp-card__icon">${icon(child.icon, { size: 21 })}</div>
        <div class="gsp-card__body">
          <h4>${escapeHtml(child.label)}</h4>
          <p>${escapeHtml(childMeta.description || "")}</p>
        </div>
      </div>

      <div class="gsp-card__stats">${stats}</div>

      <div class="gsp-card__footer">
        <span>Buka halaman ${escapeHtml(pageLabel)}</span>
        ${icon("arrow-right", { size: 16 })}
      </div>
    </a>
  `;
}

function renderMetricValue(value, isLoading) {
  if (isLoading) return '<span class="skeleton metric-skeleton" aria-label="Memuat nilai"></span>';
  return value == null ? "&mdash;" : Number(value).toLocaleString();
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

function getScopeSuffix(showManageStats, activeScope) {
  return showManageStats ? `?scope=${activeScope}` : "";
}
