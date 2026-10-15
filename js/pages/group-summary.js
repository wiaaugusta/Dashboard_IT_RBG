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
import { NAV_ITEMS, isVisibleForRole } from "../nav-config.js";
import { icon } from "../icons.js";

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
        stats: ["Total Device", "Protected", "Threat"]
      },
      "manage-pc-itam": {
        accent: "teal",
        description: "IT Asset Management - inventaris & lifecycle aset.",
        stats: ["Total Asset", "Ter-Assign", "Verifikasi"]
      },
      "manage-pc-kace": {
        accent: "purple",
        description: "Systems Deployment - deployment OS, agent & otomasi.",
        stats: ["Total Device", "Deployed", "Antrian Service"]
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

/* Submenu yang sudah punya halaman nyata (bukan coming soon) - kartunya
   ditandai "Tersedia". Tambahkan key di sini saat modul baru selesai. */
const AVAILABLE_CHILD_KEYS = new Set([
  "manage-pc-kaspersky",
  "manage-pc-itam",
  "manage-pc-kace"
]);

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

  const cards = group.children
    .filter((child) => isVisibleForRole(child, session.role))
    .map((child) => renderSummaryCard(child, meta.children[child.key]));

  const contentHtml = `
    <div class="gsp-page">
      ${renderHero(group, meta)}

      <section class="gsp-cards" aria-label="Rangkuman submenu ${escapeHtml(group.label)}">
        ${cards.join("")}
      </section>

      <div class="mpc-note">
        ${icon("info", { size: 16 })}
        <span>
          ${escapeHtml(getScopeNote(session.role, routeInfo.key))}
          Angka pada kartu masih placeholder &mdash; menunggu integrasi data backend.
        </span>
      </div>
    </div>
  `;

  renderShell(container, {
    activeKey: routeInfo.key,
    pageTitle: routeInfo.label,
    contentHtml
  });
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

function renderSummaryCard(child, childMeta = {}) {
  const isAvailable = AVAILABLE_CHILD_KEYS.has(child.key);
  const stats = (childMeta.stats || [])
    .map((statLabel) => `
      <div class="gsp-card__stat">
        <small>${escapeHtml(statLabel)}</small>
        <strong>&mdash;</strong>
      </div>
    `)
    .join("");

  return `
    <a
      href="#${child.path}"
      class="gsp-card gsp-card--${childMeta.accent || "blue"}"
    >
      <div class="gsp-card__top">
        <div class="gsp-card__icon">${icon(child.icon, { size: 21 })}</div>
        <span class="gsp-card__status ${isAvailable ? "gsp-card__status--active" : ""}">
          ${isAvailable ? "Tersedia" : "Dalam Pengembangan"}
        </span>
      </div>

      <div class="gsp-card__body">
        <h4>${escapeHtml(child.label)}</h4>
        <p>${escapeHtml(childMeta.description || "")}</p>
      </div>

      <div class="gsp-card__stats">${stats}</div>

      <div class="gsp-card__footer">
        <span>Buka halaman ${escapeHtml(child.label)}</span>
        ${icon("arrow-right", { size: 16 })}
      </div>
    </a>
  `;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}