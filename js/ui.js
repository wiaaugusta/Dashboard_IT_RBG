/**
 * UI.JS - SHARED UI HELPERS
 * ----------------------------
 * Helper UI lintas modul. Modul lain memakai fungsi di sini
 * alih-alih membuat toast/loading versi sendiri
 * (docs/UI_AND_DESIGN.md #56, docs/PROJECT_CONSTITUTION.md #20).
 *
 * Phase 1: hanya toast, karena itu satu-satunya elemen global yang
 * sudah ada di index.html (#toastContainer). Modal, Drawer, Skeleton,
 * dsb ditambahkan saat komponen tersebut pertama kali dibutuhkan.
 */

import { icon } from "./icons.js";

const TOAST_DURATION_MS = 3500;

let activeActionDialog = null;

function escapeDialogHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * @param {string} message
 * @param {"info"|"success"|"danger"} [type]
 */
export function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) {
    console.warn("[ui.js] #toastContainer tidak ditemukan.");
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute("role", "status");

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, TOAST_DURATION_MS);
}

export function showSuccess(message) {
  showToast(message, "success");
}

export function showError(message) {
  showToast(message, "danger");
}

export function showActionDialog(options = {}) {
  const {
    title = "Konfirmasi",
    message = "",
    detail = "",
    confirmLabel = "Yes",
    cancelLabel = "No",
    confirmTone = "danger",
    loadingText = "Memproses...",
    successText = "Berhasil.",
    errorText = "Gagal memproses.",
    action
  } = options;

  if (typeof action !== "function") return Promise.resolve(false);
  if (activeActionDialog) activeActionDialog.close(false);

  return new Promise((resolve) => {
    const titleId = `actionDialogTitle-${Date.now()}`;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay is-visible";

    const dialog = document.createElement("div");
    dialog.className = "modal modal-confirm is-visible";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", titleId);
    dialog.innerHTML = `
      <div class="modal__header modal-confirm__header">
        <p class="modal__eyebrow">Konfirmasi</p>
        <h3 id="${titleId}" data-dialog-title></h3>
      </div>
      <div class="modal__body modal-confirm__body">
        <p class="modal-confirm__message" data-dialog-message></p>
        <p class="modal-confirm__detail" data-dialog-detail hidden></p>
        <div class="modal-confirm__state" data-dialog-state hidden aria-live="polite"></div>
        <div class="modal__actions modal-confirm__actions" data-dialog-actions>
          <button type="button" class="btn btn-secondary" data-dialog-cancel>${escapeDialogHtml(cancelLabel)}</button>
          <button type="button" class="btn btn-${confirmTone === "primary" ? "primary" : "danger"}" data-dialog-confirm>${escapeDialogHtml(confirmLabel)}</button>
        </div>
      </div>
    `;

    const titleEl = dialog.querySelector("[data-dialog-title]");
    const messageEl = dialog.querySelector("[data-dialog-message]");
    const detailEl = dialog.querySelector("[data-dialog-detail]");
    const stateEl = dialog.querySelector("[data-dialog-state]");
    const actionsEl = dialog.querySelector("[data-dialog-actions]");
    const cancelBtn = dialog.querySelector("[data-dialog-cancel]");
    const confirmBtn = dialog.querySelector("[data-dialog-confirm]");
    const previousFocus = document.activeElement;

    titleEl.textContent = title;
    messageEl.textContent = message;
    if (detail) {
      detailEl.textContent = detail;
      detailEl.hidden = false;
    }

    let closed = false;
    let busy = false;
    let successTimer = null;

    function close(result) {
      if (closed) return;
      closed = true;
      clearTimeout(successTimer);
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      dialog.remove();
      activeActionDialog = null;
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
      resolve(result);
    }

    function onKeyDown(event) {
      if (event.key === "Escape" && !busy) close(false);
    }

    function showState(type, text) {
      stateEl.hidden = false;
      stateEl.className = `modal-confirm__state modal-confirm__state--${type}`;
      const iconName = type === "success" ? "check" : type === "error" ? "alert" : "";
      stateEl.innerHTML = `
        ${iconName ? `<span class="modal-confirm__icon" aria-hidden="true">${icon(iconName, { size: 18 })}</span>` : '<span class="btn-spinner" aria-hidden="true"></span>'}
        <span>${escapeDialogHtml(text)}</span>
      `;
    }

    async function runAction() {
      if (busy) return;
      busy = true;
      cancelBtn.disabled = true;
      confirmBtn.disabled = true;
      showState("loading", loadingText);

      try {
        await action();
        busy = false;
        cancelBtn.disabled = false;
        confirmBtn.disabled = true;
        actionsEl.hidden = true;
        showState("success", successText);
        successTimer = setTimeout(() => close(true), 1500);
      } catch (error) {
        busy = false;
        showState("error", error && error.message ? error.message : errorText);
        cancelBtn.disabled = false;
        cancelBtn.textContent = "Tutup";
        confirmBtn.hidden = true;
        actionsEl.hidden = false;
      }
    }

    activeActionDialog = { close };
    cancelBtn.addEventListener("click", () => close(false));
    confirmBtn.addEventListener("click", runAction);
    overlay.addEventListener("click", () => {
      if (!busy) close(false);
    });
    document.addEventListener("keydown", onKeyDown);
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    confirmBtn.focus();
  });
}

/* =========================================================
   TOOLTIP
   =========================================================
   Tooltip kustom (bukan `title` bawaan browser) supaya tampilannya
   bisa dibuat terang dan menyatu dengan warna tabel. Elemen pemicu
   memakai atribut data-tooltip="...".
   ========================================================= */

const TOOLTIP_EDGE_PADDING_PX = 8;

let tooltipElement = null;
let tooltipTarget = null;

function getTooltipElement() {
  if (tooltipElement && document.body.contains(tooltipElement)) return tooltipElement;
  tooltipElement = document.createElement("div");
  tooltipElement.className = "app-tooltip";
  tooltipElement.setAttribute("role", "tooltip");
  tooltipElement.hidden = true;
  document.body.appendChild(tooltipElement);
  return tooltipElement;
}

/**
 * Tampilkan tooltip untuk sebuah elemen pemicu.
 * @param {HTMLElement} target
 */
export function showTooltip(target) {
  const text = target.getAttribute("data-tooltip");
  if (!text) return;
  const element = getTooltipElement();
  element.textContent = text;
  element.hidden = false;
  element.classList.remove("is-visible");
  /* Hitung posisi setelah konten terisi agar lebar tooltip diketahui. */
  element.style.visibility = "hidden";
  const targetRect = target.getBoundingClientRect();
  const tipRect = element.getBoundingClientRect();
  let left = targetRect.left + (targetRect.width / 2) - (tipRect.width / 2);
  left = Math.max(TOOLTIP_EDGE_PADDING_PX,
    Math.min(left, window.innerWidth - tipRect.width - TOOLTIP_EDGE_PADDING_PX));
  let top = targetRect.top - tipRect.height - TOOLTIP_EDGE_PADDING_PX;
  if (top < TOOLTIP_EDGE_PADDING_PX) {
    top = targetRect.bottom + TOOLTIP_EDGE_PADDING_PX;
  }
  element.style.left = `${Math.round(left)}px`;
  element.style.top = `${Math.round(top)}px`;
  element.style.visibility = "";
  setTimeout(() => element.classList.add("is-visible"), 10);
  tooltipTarget = target;
}

export function hideTooltip() {
  if (!tooltipElement) return;
  tooltipElement.classList.remove("is-visible");
  tooltipElement.hidden = true;
  tooltipTarget = null;
}

/**
 * Aktifkan tooltip untuk semua elemen [data-tooltip] di dalam root.
 * Dipakai sekali per halaman (listener dipasang di root = document).
 * @param {Document|HTMLElement} [root]
 */
export function initTooltips(root = document) {
  if (root.__tooltipsReady) return;
  root.__tooltipsReady = true;

  root.addEventListener("mouseover", (event) => {
    const target = event.target.closest
      ? event.target.closest("[data-tooltip]")
      : null;
    if (!target) {
      if (tooltipTarget) hideTooltip();
      return;
    }
    if (target === tooltipTarget) return;
    showTooltip(target);
  });

  root.addEventListener("mouseout", (event) => {
    const target = event.target.closest
      ? event.target.closest("[data-tooltip]")
      : null;
    if (target && tooltipTarget && !target.contains(event.relatedTarget)) {
      hideTooltip();
    }
  });

  root.addEventListener("focusin", (event) => {
    const target = event.target.closest
      ? event.target.closest("[data-tooltip]")
      : null;
    if (target) showTooltip(target);
  });

  root.addEventListener("focusout", () => hideTooltip());
  root.addEventListener("scroll", () => hideTooltip(), true);
  window.addEventListener("resize", () => hideTooltip());
}
