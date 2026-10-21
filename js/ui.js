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

const TOAST_DURATION_MS = 3500;

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
