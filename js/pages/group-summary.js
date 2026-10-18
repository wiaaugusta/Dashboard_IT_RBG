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
import { loadManagePcSummary } from "../api.js";

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
  const cards = renderGroupCards(visibleChildren, meta, null, isManagePc, activeScope);

  const contentHtml = `
    <div class="gsp-page">
      ${isManagePc ? renderManagePcScopeBar(activeScope, canChooseScope) : renderHero(group, meta)}

      <section class="gsp-cards${isManagePc ? " gsp-cards--manage-pc" : ""}" data-group-summary-cards aria-label="Rangkuman submenu ${escapeHtml(group.label)}">
        ${cards.join("")}
      </section>

      <div class="mpc-note" data-group-summary-message aria-live="polite">
        ${icon("info", { size: 16 })}
        <span>
          ${isManagePc ? (activeScope === "store" ? "Ringkasan data Store akan ditampilkan setelah sumber data Store dihubungkan." : "Memuat ringkasan data Manage PC Office...") : `${escapeHtml(getScopeNote(session.role, routeInfo.key))} Angka pada kartu masih placeholder &mdash; menunggu integrasi data backend.`}
        </span>
      </div>
    </div>
  `;

  renderShell(container, {
    activeKey: routeInfo.key,
    pageTitle: isManagePc ? "Manage PC" : routeInfo.label,
    contentHtml
  });

  if (isManagePc && activeScope === "office") {
    loadManagePcSummary("office", { sessionToken: session.sessionToken })
      .then((result) => {
        const cardsElement = container.querySelector("[data-group-summary-cards]");
        const messageElement = container.querySelector("[data-group-summary-message] span");
        if (result.success && result.data) {
          if (cardsElement) {
            cardsElement.innerHTML = renderGroupCards(visibleChildren, meta, result.data, true, activeScope).join("");
          }
          if (messageElement) messageElement.textContent = "Status OK dihitung sebagai Device Manage; status selain OK dihitung sebagai Not Manage.";
        } else if (messageElement) {
          messageElement.textContent = result.message || "Ringkasan Manage PC gagal dimuat.";
        }
      })
      .catch((error) => {
        const messageElement = container.querySelector("[data-group-summary-message] span");
        if (messageElement) messageElement.textContent = error.message || "Ringkasan Manage PC gagal dimuat.";
      });
  }
}

function renderManagePcScopeBar(activeScope, canChooseScope) {
  const scopes = ["office", "store"];
  const tabs = canChooseScope
    ? `
      <nav class="mpc-scope-tabs" role="tablist" aria-label="Lingkup Manage PC">
        ${scopes.map((scope) => `
          <a
            href="#/manage-pc?scope=${scope}"
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
    : `
      <div class="mpc-scope-tabs mpc-scope-tabs--single">
        ${icon(activeScope === "office" ? "office" : "store", { size: 17 })}
        <span>${activeScope === "office" ? "Office" : "Store"}</span>
      </div>
    `;
  const description = activeScope === "store"
    ? "Ringkasan data Manage PC Store akan tersedia setelah sumber datanya terhubung."
    : "Ringkasan status Kaspersky, ITAM, Privilege ITAM, dan KACE untuk Office.";

  return `
    <header class="mpc-scope-bar">
      ${tabs}
      <p>${escapeHtml(description)}</p>
    </header>
  `;
}

function renderGroupCards(children, meta, summaryData, isManagePc, activeScope = "office") {
  const cards = [];
  children.forEach((child) => {
    cards.push(renderSummaryCard(child, meta.children[child.key], summaryData, isManagePc, activeScope));

    if (isManagePc && child.key === "manage-pc-kaspersky") {
      cards.push(renderSummaryCard(
        MANAGE_PC_EXTRA_CARDS["manage-pc-kaspersky-version"],
        MANAGE_PC_EXTRA_CARDS["manage-pc-kaspersky-version"],
        summaryData,
        true,
        activeScope
      ));
    }

    if (isManagePc && child.key === "manage-pc-itam") {
      cards.push(renderSummaryCard(
        MANAGE_PC_EXTRA_CARDS["manage-pc-itam-privilege"],
        MANAGE_PC_EXTRA_CARDS["manage-pc-itam-privilege"],
        summaryData,
        true,
        activeScope
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

function renderSummaryCard(child, childMeta = {}, summaryData = null, showManageStats = false, activeScope = "office") {
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
        <strong>${statValues[index] == null ? "&mdash;" : Number(statValues[index]).toLocaleString()}</strong>
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

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

function getScopeSuffix(showManageStats, activeScope) {
  return showManageStats ? `?scope=${activeScope}` : "";
}
