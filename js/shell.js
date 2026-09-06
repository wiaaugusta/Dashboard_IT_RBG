/**
 * SHELL.JS - APPLICATION SHELL
 * --------------------------------
 * UPDATE (moodboard baru): sidebar & bottom nav sekarang pakai icon
 * line-style (js/icons.js) di depan label, chevron submenu pakai SVG
 * (bukan +/- teks), avatar user pakai lingkaran inisial yang lebih
 * tegas (mengikuti referensi "Nexus/Vektora" - avatar bulat di topbar
 * & sidebar footer).
 */

import { NAV_ITEMS, BOTTOM_NAV_ITEMS, isVisibleForRole, findParentKey } from "./nav-config.js";
import { getSession, logout } from "./auth.js";
import { navigate } from "./router.js";
import { icon } from "./icons.js";

let expandedGroups = new Set();

export function renderShell(container, options) {
  const session = getSession();
  if (!session) {
    navigate("/login");
    return;
  }

  const parentKey = findParentKey(options.activeKey);
  if (parentKey) expandedGroups.add(parentKey);

  container.innerHTML = `
    <div class="app-shell">
      <aside class="app-sidebar" id="appSidebar">

          <div class="app-sidebar__brand">
            <div class="app-sidebar__mark">IT</div>

            <span class="app-sidebar__brand-text">
              IT Platform
            </span>
          </div>


          <div class="app-sidebar__body">

            <nav class="app-nav">
              ${renderNavList(session.role, options.activeKey)}
            </nav>

          </div>


          <div class="app-sidebar__footer">

            <div class="app-user">

              <div class="app-user__avatar">
                ${escapeHtml(getInitials(session.nik))}
              </div>

              <div class="app-user__details">

                <div class="app-user__nik">
                  ${escapeHtml(session.nik)}
                </div>

                <div class="app-user__role">
                  ${escapeHtml(session.role)}
                </div>

              </div>

            </div>


            <button
              type="button"
              class="app-logout-btn"
              id="logoutBtn"
              aria-label="Logout"
              title="Keluar"
            >

              ${icon("logout", { size: 18 })}

              <span class="app-logout-btn__label">
                Keluar
              </span>

            </button>

          </div>

    </aside>

      <div class="app-shell__main">
        <header class="app-header">
          <button type="button" class="app-hamburger" id="hamburgerBtn" aria-label="Buka menu">
            <span></span><span></span><span></span>
          </button>
          <h1 class="app-header__title">${escapeHtml(options.pageTitle)}</h1>
          <div class="app-header__user" title="${escapeHtml(session.nik)} - ${escapeHtml(session.role)}">
            ${escapeHtml(getInitials(session.nik))}
          </div>
        </header>

        <main class="app-content" id="appContent">
          ${options.contentHtml}
        </main>
      </div>
    </div>
    <div class="app-drawer-overlay" id="appDrawerOverlay"></div>
    ${renderBottomNav(session.role, options.activeKey)}
  `;

  bindShellEvents(container);

  const contentEl = container.querySelector("#appContent");
  if (options.onContentMount && contentEl) {
    options.onContentMount(contentEl);
  }
}

function renderNavList(role, activeKey) {
  return NAV_ITEMS.filter((item) => isVisibleForRole(item, role))
    .map((item) => renderNavItem(item, role, activeKey))
    .join("");
}

function renderNavItem(item, role, activeKey) {
  if (item.children) {
    const visibleChildren = item.children.filter((child) => isVisibleForRole(child, role));
    if (visibleChildren.length === 0) return "";

    const isExpanded = expandedGroups.has(item.key);

    return `
      <div class="app-nav-group ${isExpanded ? "is-expanded" : ""}">
        <button type="button" class="app-nav-item app-nav-item--group" data-group-toggle="${item.key}">
          <span class="app-nav-item__icon">${icon(item.icon, { size: 18 })}</span>
          <span class="app-nav-item__label">${escapeHtml(item.label)}</span>
          <span class="app-nav-item__chevron">${icon("chevron", { size: 15 })}</span>
        </button>
        <div class="app-nav-submenu">
          ${visibleChildren.map((child) => renderLeafItem(child, activeKey, true)).join("")}
        </div>
      </div>
    `;
  }

  return renderLeafItem(item, activeKey, false);
}

function renderLeafItem(item, activeKey, isChild) {
  const isActive = item.key === activeKey;
  return `
    <a
      href="#${item.path}"
      class="app-nav-item ${isChild ? "app-nav-item--child" : ""} ${isActive ? "is-active" : ""}"
      data-nav-key="${item.key}"
    >
      ${item.icon ? `<span class="app-nav-item__icon">${icon(item.icon, { size: 18 })}</span>` : ""}
      <span class="app-nav-item__label">${escapeHtml(item.label)}</span>
    </a>
  `;
}

function renderBottomNav(role, activeKey) {
  const items = BOTTOM_NAV_ITEMS.filter((item) => isVisibleForRole(item, role));

  const itemsHtml = items
    .map((item) => {
      const isActive = item.key === activeKey;
      if (item.action === "open-drawer") {
        return `
          <button type="button" class="app-bottom-nav__item" data-bottom-nav-action="open-drawer">
            <span class="app-bottom-nav__icon">${icon(item.icon, { size: 20 })}</span>
            <span>${escapeHtml(item.label)}</span>
          </button>
        `;
      }
      if (item.action === "logout") {
        return `
          <button type="button" class="app-bottom-nav__item" data-bottom-nav-action="logout">
            <span class="app-bottom-nav__icon">${icon(item.icon, { size: 20 })}</span>
            <span>${escapeHtml(item.label)}</span>
          </button>
        `;
      }
      return `
        <a href="#${item.path}" class="app-bottom-nav__item ${isActive ? "is-active" : ""}">
          <span class="app-bottom-nav__icon">${icon(item.icon, { size: 20 })}</span>
          <span>${escapeHtml(item.label)}</span>
        </a>
      `;
    })
    .join("");

  return `<nav class="app-bottom-nav" id="appBottomNav">${itemsHtml}</nav>`;
}

function bindShellEvents(container) {
  const sidebar = container.querySelector("#appSidebar");
  const overlay = container.querySelector("#appDrawerOverlay");
  const hamburgerBtn = container.querySelector("#hamburgerBtn");
  const logoutBtn = container.querySelector("#logoutBtn");
  const bottomNav = container.querySelector("#appBottomNav");
  
    /* =====================================================
     DESKTOP SIDEBAR MOTION
     ===================================================== */

  let sidebarCloseTimer = null;

  if (sidebar) {

    sidebar.addEventListener("mouseenter", () => {

      if (window.innerWidth < 769) return;

      clearTimeout(sidebarCloseTimer);

      sidebar.classList.add("is-expanded");
      sidebar.closest(".app-shell")?.classList.add("sidebar-expanded");

    });


    sidebar.addEventListener("mouseleave", () => {

      if (window.innerWidth < 769) return;

      /*
       * Sedikit delay supaya ketika mouse bergerak
       * melewati ujung sidebar tidak terasa berkedip.
       */
      clearTimeout(sidebarCloseTimer);

      sidebarCloseTimer = setTimeout(() => {

        sidebar.classList.remove("is-expanded");
        sidebar.closest(".app-shell")
          ?.classList.remove("sidebar-expanded");

      }, 60);

    });

  }

  function openDrawer() {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-visible");
  }

  function closeDrawer() {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-visible");
  }

  hamburgerBtn.addEventListener("click", openDrawer);
  overlay.addEventListener("click", closeDrawer);

  container.querySelectorAll("[data-nav-key]").forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  if (bottomNav) {
    const moreBtn = bottomNav.querySelector('[data-bottom-nav-action="open-drawer"]');
    if (moreBtn) moreBtn.addEventListener("click", openDrawer);
    const bottomLogoutBtn = bottomNav.querySelector('[data-bottom-nav-action="logout"]');
    if (bottomLogoutBtn) bottomLogoutBtn.addEventListener("click", () => performLogout(bottomLogoutBtn));

    /* Auto-hide bottom nav saat scroll (mobile): ke bawah -> nav hilang,
       ke atas / kembali top -> auto tampil ulang. */
    const contentEl = container.querySelector("#appContent");
    if (contentEl && window.innerWidth < 769) {
      let lastScrollY = 0;

      contentEl.addEventListener("scroll", () => {
        const y = contentEl.scrollTop;
        const delta = y - lastScrollY;
        lastScrollY = y;

        if (delta > 8) {
          bottomNav.classList.add("is-hidden");
        } else if (delta < -8 || y <= 2) {
          bottomNav.classList.remove("is-hidden");
        }
      });
    }
  }

  container.querySelectorAll("[data-group-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-group-toggle");
      if (expandedGroups.has(key)) {
        expandedGroups.delete(key);
      } else {
        expandedGroups.add(key);
      }
      btn.closest(".app-nav-group").classList.toggle("is-expanded");
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => performLogout(logoutBtn));
  }

}

async function performLogout(button) {
  button.disabled = true;
  const logoutRequest = logout();
  navigate("/login");
  await logoutRequest;
}

function getInitials(text) {
  const clean = (text || "").toString().trim();
  return clean.substring(0, 2).toUpperCase();
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}