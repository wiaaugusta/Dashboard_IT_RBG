/**
 * MODULES/CCTV.JS - HALAMAN CCTV
 * -----------------------------------
 * STAGE 2 UPDATE (docs/UI_AND_DESIGN.md #10-#19):
 * - Data CCTV dimuat per halaman dari backend. Search tetap lintas seluruh
 *   dataset karena filter dan pagination dilakukan server-side.
 *   Response getCCTV berbentuk { items, total, page, limit,
 *   totalPages } maupun array polos.
 * - Skeleton loading menggantikan teks "Memuat data..." polos (#13).
 * - URL suggestion popover dari 5 preset URL (#20).
 * - Generated password UX read-only + tombol "Gunakan" (#17-#19).
 *   Password digenerate oleh BACKEND lewat action "generateCctvPassword"
 *   (deterministic, HMAC + secret di server - frontend TIDAK menyimpan
 *   atau menghitung secret apa pun).
 */

import { renderShell } from "../shell.js";
import { apiRequest } from "../api.js";
import { getSession } from "../auth.js";
import { showSuccess, showError } from "../ui.js";
import { icon } from "../icons.js";

const STATUS_OPTIONS = ["OK - DVR BARU", "OK - DVR LAMA", "CCTV OWNER", "APP"];
const PAGE_SIZE = 10;
const URL_PRESETS = [
  "http://10.234.234.8/doc/page/login.asp",
  "http://10.234.234.8/",
  "http://10.234.234.8:8899/",
  "http://10.234.234.8:9090/doc/page/login.asp",
  "http://10.234.234.8:9090/"
];

// State halaman aktif dan cache dataset CCTV.
let currentPage = 1;
let currentSearch = "";
let cctvRequestId = 0;
let cctvSearchTimer = null;

export async function renderCctvPage(container) {
  const session = getSession();
  if (!session) return;

  currentPage = 1;
  currentSearch = "";

  const contentHtml = `
    <div class="cctv-page">

    <div class="cctv-hero">
      <div class="cctv-hero__content">
        <div class="cctv-hero__icon">${icon("cctv", { size: 26 })}</div>
        <div class="cctv-hero__text">
          <h2>CCTV Management</h2>
          <p class="cctv-hero__subtitle">Kelola URL dan credential DVR CCTV per toko.</p>
        </div>
      </div>
      <div class="cctv-hero__badge">
        <span class="cctv-hero__badge-dot"></span>
        Monitoring Live
      </div>
    </div>

    <div class="cctv-toolbar">
      <div class="cctv-search">
        ${icon("search", { size: 16 })}
        <input
          type="text"
          id="cctvSearchInput"
          class="input cctv-search-input"
          placeholder="Cari kode toko atau nama toko..."
        />
      </div>
      <div class="cctv-toolbar__spacer"></div>
      <span class="cctv-toolbar__count" id="cctvCount"></span>
      <button type="button" class="btn btn-secondary" id="cctvRefreshBtn">
        ${icon("refresh", { size: 15 })}
        Refresh
      </button>
    </div>

    <div class="cctv-page-grid">
      <div id="cctvListArea">${renderTableSkeleton()}</div>
      <div id="cctvPaginationArea"></div>
    </div>

    </div>

    <div class="modal-overlay" id="cctvModalOverlay"></div>
    <div class="modal" id="cctvModal" role="dialog" aria-modal="true"></div>

    <!-- Loading popup saat tombol Simpan diklik: kotak kecil ditengah,
         area sekitar blur tipis. -->
    <div class="cctv-loading-overlay" id="cctvSavingOverlay" aria-hidden="true">
      <div class="cctv-loading-card" role="status">
        <span class="cctv-loading-spinner"></span>
        <div class="cctv-loading-card__text">
          <strong>Menyimpan data...</strong>
          <small>Sedang proses ke server</small>
        </div>
      </div>
    </div>
  `;

  renderShell(container, {
    activeKey: "cctv",
    pageTitle: "CCTV",
    contentHtml,
    onContentMount: (contentEl) => {
      bindCctvPage(contentEl, session);
      loadCctvList(contentEl, session);
    }
  });
}

function bindCctvPage(contentEl, session) {
  const searchInput = contentEl.querySelector("#cctvSearchInput");
  const refreshBtn = contentEl.querySelector("#cctvRefreshBtn");

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    currentSearch = searchInput.value.trim();
    clearTimeout(cctvSearchTimer);
    cctvSearchTimer = setTimeout(() => loadCctvList(contentEl, session), 180);
  });

  refreshBtn.addEventListener("click", () => {
    loadCctvList(contentEl, session);
  });

  contentEl.querySelector("#cctvModalOverlay").addEventListener("click", () => closeCctvModal(contentEl));
}

/**
 * Muat satu halaman dari server. Backend menangani pencarian terhadap
 * seluruh dataset, sehingga page 2+ tetap cepat tanpa payload besar.
 */
async function loadCctvList(contentEl, session) {
  const listArea = contentEl.querySelector("#cctvListArea");
  const paginationArea = contentEl.querySelector("#cctvPaginationArea");
  const requestId = ++cctvRequestId;
  listArea.innerHTML = renderTableSkeleton();
  paginationArea.innerHTML = "";

  const result = await apiRequest(
    "getCCTV",
    { page: currentPage, limit: PAGE_SIZE, search: currentSearch },
    { sessionToken: session.sessionToken }
  );

  if (requestId !== cctvRequestId) return;

  if (!result.success) {
    listArea.innerHTML = `
      <div class="state-card">
        <div class="state-card__icon state-card__icon--error">!</div>
        <p class="state-card__title">Data CCTV gagal dimuat.</p>
        <p class="state-card__subtitle">Periksa koneksi Anda lalu coba lagi.</p>
        <button type="button" class="btn btn-secondary" id="cctvRetryBtn">Coba Lagi</button>
      </div>
    `;
    listArea.querySelector("#cctvRetryBtn").addEventListener("click", () => loadCctvList(contentEl, session));
    return;
  }

  renderCctvList(contentEl, session, result.data || {});
}

/** Stage 2: render 1 halaman hasil dari server + pagination + total count global. */
function renderCctvList(contentEl, session, payload) {
  const listArea = contentEl.querySelector("#cctvListArea");
  const paginationArea = contentEl.querySelector("#cctvPaginationArea");
  const countEl = contentEl.querySelector("#cctvCount");

  const items = payload.items || [];
  const totalRecords = payload.total || 0;
  const totalPages = payload.totalPages || 1;
  const page = payload.page || 1;

  countEl.textContent = totalRecords > 0 ? `${totalRecords} toko` : "";

  if (totalRecords === 0) {
    listArea.innerHTML = `
      <div class="state-card">
        <div class="state-card__icon state-card__icon--empty">-</div>
        <p class="state-card__title">Data CCTV tidak ditemukan.</p>
        <p class="state-card__subtitle">Coba ubah kata kunci pencarian.</p>
      </div>
    `;
    paginationArea.innerHTML = "";
    return;
  }

  const startIndex = (page - 1) * PAGE_SIZE;

  listArea.innerHTML = `
    <div class="cctv-table-wrapper">
      <table class="cctv-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Kode Toko</th>
            <th>Nama Toko</th>
            <th>IT AREA</th>
            <th>Status</th>
            <th>URL</th>
            <th>Terakhir Update</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, i) => renderCctvRow(item, startIndex + i + 1)).join("")}
        </tbody>
      </table>
    </div>
  `;

  listArea.querySelectorAll("[data-edit-kdstore]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openCctvModal(contentEl, btn.getAttribute("data-edit-kdstore"));
    });
  });

  bindCctvUrlMarquee(listArea);

  paginationArea.innerHTML = renderPagination(page, totalPages, startIndex, items.length, totalRecords);
  bindPagination(contentEl, session, totalPages);
}

function renderPagination(page, totalPages, startIndex, pageCount, totalRecords) {
  if (totalPages <= 1) {
    return `<div class="pagination__info">Menampilkan ${totalRecords} dari ${totalRecords} toko</div>`;
  }

  const rangeStart = startIndex + 1;
  const rangeEnd = startIndex + pageCount;

  return `
    <div class="pagination">
      <div class="pagination__info">
        Menampilkan ${rangeStart}-${rangeEnd} dari ${totalRecords} toko
      </div>
      <div class="pagination__controls">
        <button type="button" class="pagination__btn" data-page="prev" ${page === 1 ? "disabled" : ""}>&lsaquo;</button>
        ${renderPageNumbers(page, totalPages)}
        <button type="button" class="pagination__btn" data-page="next" ${page === totalPages ? "disabled" : ""}>&rsaquo;</button>
      </div>
    </div>
  `;
}

function renderPageNumbers(page, totalPages) {
  const pages = getPageNumberList(page, totalPages);
  return pages
    .map((p) =>
      p === "..."
        ? `<span class="pagination__ellipsis">&hellip;</span>`
        : `<button type="button" class="pagination__btn ${p === page ? "is-active" : ""}" data-page="${p}">${p}</button>`
    )
    .join("");
}

/** Maks 7 slot terlihat: 1 ... p-1 p p+1 ... total (dipangkas otomatis kalau totalPages kecil). */
function getPageNumberList(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = Array.from(pages).filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result = [];
  let prev = null;
  sorted.forEach((p) => {
    if (prev !== null && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  });
  return result;
}

/** Ganti halaman = request baru ke server (bukan slice array lokal lagi). */
function bindPagination(contentEl, session, totalPages) {
  const paginationArea = contentEl.querySelector("#cctvPaginationArea");
  paginationArea.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-page");

      if (value === "prev") currentPage = Math.max(1, currentPage - 1);
      else if (value === "next") currentPage = Math.min(totalPages, currentPage + 1);
      else currentPage = parseInt(value, 10);

      loadCctvList(contentEl, session);
      contentEl.querySelector("#cctvListArea").scrollIntoView({ block: "nearest" });
    });
  });
}

function renderTableSkeleton() {
  const rows = Array.from({ length: 6 })
    .map(
      () => `
        <div class="skeleton-table-row">
          <div class="skeleton" style="width:32px"></div>
          <div class="skeleton" style="flex:1.2"></div>
          <div class="skeleton" style="flex:1.5"></div>
          <div class="skeleton" style="flex:0.8"></div>
          <div class="skeleton" style="flex:1"></div>
        </div>
      `
    )
    .join("");

  return `<div class="cctv-table-wrapper">${rows}</div>`;
}

/**
 * URL yang terlalu panjang otomatis "berjalan" (marquee) saat hover.
 * Hanya teks yang melebihi lebar kolom yang mendapat animasi.
 */
function bindCctvUrlMarquee(scopeEl) {
  scopeEl.querySelectorAll(".cctv-url-cell").forEach((cell) => {
    const link = cell.querySelector(".cctv-url-link");
    if (!link) return;

    link.classList.remove("is-overflow");
    link.style.removeProperty("--marquee-dist");
    link.style.removeProperty("--marquee-dur");

    if (link.scrollWidth > cell.clientWidth + 4) {
      link.classList.add("is-overflow");
      const dist = (link.scrollWidth - cell.clientWidth) + 28;
      link.style.setProperty("--marquee-dist", dist + "px");
      link.style.setProperty("--marquee-dur", Math.max(3, (dist / 48).toFixed(2)) + "s");
    }
  });
}

function getStatusClass(statusLabel) {
  if (statusLabel.indexOf("BARU") !== -1) return "success";   // DVR BARU -> hijau
  if (statusLabel.indexOf("LAMA") !== -1) return "info";      // DVR LAMA -> biru tipis
  if (statusLabel.indexOf("OWNER") !== -1) return "danger";   // CCTV OWNER -> merah tipis
  if (statusLabel.indexOf("APP") !== -1) return "orange";     // APP -> orange
  return "info";
}

/**
 * Format kolom "Terakhir Update" -> "NAMA - dd/MM/yyyy HH:mm"
 * Contoh: "JALIL - 27/08/2026 16:45".
 * Backend menulis "Diupdate oleh <NIK> - <dd/MM/yyyy HH:mm>" di kolom S.
 */
function formatUpdatedInfo(raw) {
  const value = (raw == null ? "" : String(raw)).trim();
  if (!value) return "-";

  // Format backend: "Diupdate oleh JALIL - 27/08/2026 16:45"
  let match = value.match(/Diupdate oleh\s+(.+?)\s*-\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/i);
  if (match) {
    return `${match[1].trim()} - ${match[2].trim()}`;
  }

  // Format lain yang sudah "NAMA - tanggal jam"
  match = value.match(/^(.+?)\s*-\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})$/);
  if (match) {
    return `${match[1].trim()} - ${match[2].trim()}`;
  }

  return value;
}

function renderCctvRow(item, rowNumber) {
  const statusLabel = (item.status || "").toUpperCase();
  const statusClass = getStatusClass(statusLabel);
  const storeCode = escapeHtml(item.kdStore);
  const storeName = escapeHtml(item.namaStore || "-");
  const area = escapeHtml(item.itArea || "-");

  return `
    <tr>
      <td data-label="No" class="cctv-table__index">${rowNumber}</td>
      <td data-label="Kode Toko"><span class="cctv-store-code">${storeCode}</span></td>
      <td data-label="Nama Toko">
        <div class="cctv-store-cell">
          <span class="cctv-store-cell__name">${storeName}</span>
        </div>
      </td>
      <td data-label="IT AREA"><span class="cctv-area-chip">${area}</span></td>
      <td data-label="Status">
        <span class="badge badge-${statusClass} cctv-status-badge"><i></i>${escapeHtml(statusLabel)}</span>
      </td>
      <td data-label="URL">
        ${item.url
          ? `<span class="cctv-url-cell"><span class="cctv-url-link">${escapeHtml(item.url)}</span></span>`
          : '<span class="cctv-table__muted">-</span>'}
      </td>
      <td data-label="Terakhir Update" class="cctv-table__muted">${escapeHtml(formatUpdatedInfo(item.updatedInfo))}</td>
      <td data-label="">
        <button type="button" class="cctv-edit-btn" aria-label="Edit ${escapeAttr(item.kdStore)}" data-edit-kdstore="${escapeAttr(item.kdStore)}">
          ${icon("edit", { size: 15 })}
        </button>
      </td>
    </tr>
  `;
}

async function openCctvModal(contentEl, kdStore) {
  const session = getSession();
  const overlay = contentEl.querySelector("#cctvModalOverlay");
  const modal = contentEl.querySelector("#cctvModal");

  overlay.classList.add("is-visible");
  modal.classList.add("is-visible");
  modal.innerHTML = `
    <div class="modal__body">
      <div class="skeleton skeleton-text" style="width:50%"></div>
      <div class="skeleton skeleton-text" style="width:80%"></div>
      <div class="skeleton skeleton-text"></div>
    </div>
  `;

  const result = await apiRequest(
    "getCCTVDetail",
    { kdStore },
    { sessionToken: session.sessionToken }
  );

  if (!result.success || !result.data) {
    modal.innerHTML = `
      <div class="modal__body">
        <p>${escapeHtml(result.message || "Data toko gagal dimuat.")}</p>
        <button type="button" class="btn btn-secondary" id="cctvModalCloseBtn">Tutup</button>
      </div>
    `;
    modal.querySelector("#cctvModalCloseBtn").addEventListener("click", () => closeCctvModal(contentEl));
    return;
  }

  renderCctvForm(contentEl, result.data);
}

function renderCctvForm(contentEl, detail) {
  const modal = contentEl.querySelector("#cctvModal");

  modal.innerHTML = `
    <div class="modal__header cctv-edit-header">
      <div class="cctv-edit-header__icon">${icon("edit", { size: 18 })}</div>
      <div class="cctv-edit-header__text">
        <h3>EDIT DATA CCTV</h3>
        <span class="cctv-edit-header__sub">${escapeHtml(detail.kdStore)} - ${escapeHtml(detail.namaStore || "-")}</span>
      </div>
      <button type="button" class="cctv-modal-close" id="cctvHeaderCloseBtn" aria-label="Tutup edit">
        ${icon("close", { size: 15 })}
      </button>
    </div>
    <form id="cctvEditForm" class="modal__body">
      <div class="form-group">
        <label class="form-label" for="cctvStatusTrigger">Status</label>
        <div class="status-dropdown">
          <input type="hidden" id="cctvStatusInput" value="${escapeAttr(detail.status)}" />
          <button type="button" class="input status-dropdown__trigger" id="cctvStatusTrigger">
            <span id="cctvStatusValue">${escapeHtml(detail.status)}</span>
            ${icon("chevron", { size: 14 })}
          </button>
          <div class="status-dropdown__popover" id="cctvStatusPopover">
            ${STATUS_OPTIONS.map((opt) => `
              <button type="button" class="status-dropdown__item ${opt === detail.status ? "is-selected" : ""}" data-status-value="${escapeAttr(opt)}">
                ${escapeHtml(opt)}
              </button>
            `).join("")}
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="cctvUrlInput">URL CCTV</label>
        <div class="url-suggest-wrapper">
          <input type="text" id="cctvUrlInput" class="input" autocomplete="off"
            value="" placeholder="Pilih atau ketik URL..." />
          <div class="url-suggest-popover" id="cctvUrlPopover">
            ${URL_PRESETS.map((u) => `<button type="button" class="url-suggest-item" data-url-preset="${escapeAttr(u)}">${escapeHtml(u)}</button>`).join("")}
          </div>
        </div>
        <span class="form-hint">Klik field untuk melihat preset URL yang tersedia.</span>
      </div>

      <div id="cctvCredentialFields"></div>

      <div class="modal__actions">
        <button type="button" class="btn btn-secondary" id="cctvCancelBtn">Batal</button>
        <button type="submit" class="btn btn-primary" id="cctvSaveBtn">Simpan</button>
      </div>
    </form>
  `;

  bindUrlSuggestion(modal);
  modal.querySelector("#cctvHeaderCloseBtn").addEventListener("click", () => closeCctvModal(contentEl));

  const statusInput = modal.querySelector("#cctvStatusInput");
  const credentialFieldsContainer = modal.querySelector("#cctvCredentialFields");

  function renderCredentialFieldsForStatus() {
    const isDvrBaru = statusInput.value.toUpperCase().indexOf("BARU") !== -1;
    const group = isDvrBaru ? detail.dvrBaru : detail.dvrLama;
    const groupKey = isDvrBaru ? "dvrBaru" : "dvrLama";

    credentialFieldsContainer.innerHTML = `
      <p class="modal__section-title">${isDvrBaru ? "Kredensial DVR Baru" : "Kredensial DVR Lama"}</p>
      ${renderCredentialInputPair("User", groupKey, "userUsername", "userPassword", group, detail.kdStore)}
      ${renderCredentialInputPair("Admin", groupKey, "adminUsername", "adminPassword", group, detail.kdStore)}
    `;

    bindPasswordToggles(credentialFieldsContainer);
    bindGeneratePasswordButtons(credentialFieldsContainer, groupKey, detail.kdStore);
  }

  // Status dropdown custom: popover yang tampil PERSIS dengan popover URL.
  const statusPopover = modal.querySelector("#cctvStatusPopover");
  const statusValueEl = modal.querySelector("#cctvStatusValue");

  modal.querySelector("#cctvStatusTrigger").addEventListener("click", () => {
    statusPopover.classList.toggle("is-visible");
  });

  document.addEventListener("click", function outsideStatusClick(event) {
    if (!modal.isConnected) {
      document.removeEventListener("click", outsideStatusClick);
      return;
    }
    if (!event.target.closest(".status-dropdown")) {
      statusPopover.classList.remove("is-visible");
    }
  });

  modal.querySelectorAll("[data-status-value]").forEach((btn) => {
    btn.addEventListener("click", () => {
      statusInput.value = btn.getAttribute("data-status-value");
      statusValueEl.textContent = btn.textContent;
      statusPopover.classList.remove("is-visible");

      modal.querySelectorAll("[data-status-value]").forEach((b) => {
        b.classList.toggle("is-selected", b === btn);
      });

      renderCredentialFieldsForStatus();
    });
  });

  renderCredentialFieldsForStatus();

  modal.querySelector("#cctvCancelBtn").addEventListener("click", () => closeCctvModal(contentEl));

  modal.querySelector("#cctvEditForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitCctvUpdate(contentEl, detail);
  });
}

/** Stage 2 - docs/UI_AND_DESIGN.md #20: popover preset URL saat field difokus. */
function bindUrlSuggestion(modal) {
  const urlInput = modal.querySelector("#cctvUrlInput");
  const popover = modal.querySelector("#cctvUrlPopover");
  // Supaya list tidak kebuka ulang saat focus() dipanggil setelah pilih.
  let suppressOpen = false;

  urlInput.addEventListener("focus", () => {
    if (suppressOpen) {
      suppressOpen = false;
      return;
    }
    popover.classList.add("is-visible");
  });

  document.addEventListener("click", function outsideClick(event) {
    if (!modal.isConnected) {
      document.removeEventListener("click", outsideClick);
      return;
    }
    if (!event.target.closest(".url-suggest-wrapper")) {
      popover.classList.remove("is-visible");
    }
  });

  popover.querySelectorAll("[data-url-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      urlInput.value = btn.getAttribute("data-url-preset");
      popover.classList.remove("is-visible");
      suppressOpen = true;
      urlInput.focus();
    });
  });
}

function renderCredentialInputPair(label, groupKey, usernameKey, passwordKey, group, kdStore) {
  const usernameId = `cctv_${groupKey}_${usernameKey}`;
  const passwordId = `cctv_${groupKey}_${passwordKey}`;
  const generateBoxId = `cctv_${groupKey}_${passwordKey}_gen`;

  return `
    <div class="cctv-credential-pair">
      <div class="form-group">
        <label class="form-label" for="${usernameId}">${label} Username</label>
        <input type="text" id="${usernameId}" class="input" data-cred-field="${usernameKey}"
          value="${escapeAttr(group[usernameKey] || "")}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="${passwordId}">${label} Password</label>
        <div class="input-wrapper">
          <input type="password" id="${passwordId}" class="input" data-cred-field="${passwordKey}"
            value="${escapeAttr(group[passwordKey] || "")}" />
          <button type="button" class="password-toggle-btn" data-toggle-for="${passwordId}">Show</button>
        </div>
      </div>
    </div>
    <div class="form-group" data-generate-group="${passwordId}">
      <div class="generated-password-box" id="${generateBoxId}">
        <span class="generated-password-box__value generated-password-box__value--placeholder" data-gen-value>
          Belum ada password baru
        </span>
        <button type="button" class="btn btn-secondary btn-sm" data-generate-password
          data-target-input="${passwordId}" data-kdstore="${escapeAttr(kdStore)}">
          Generate Password Baru
        </button>
      </div>
    </div>
  `;
}

/**
 * Stage 2 - docs/UI_AND_DESIGN.md #17-#19.
 * Meminta password baru ke BACKEND (bukan dihitung di frontend), lalu
 * menampilkannya read-only dengan tombol "Gunakan" untuk mengisi field
 * password sesungguhnya. Membutuhkan action backend "generateCctvPassword"
 * (belum ada di Apps Script existing - lihat catatan di header file ini).
 */
function bindGeneratePasswordButtons(scopeEl, groupKey, kdStore) {
  scopeEl.querySelectorAll("[data-generate-password]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetInputId = btn.getAttribute("data-target-input");
      const box = btn.closest(".generated-password-box");
      const valueEl = box.querySelector("[data-gen-value]");
      const session = getSession();

      btn.disabled = true;
      const originalLabel = btn.textContent;
      btn.innerHTML = `<span class="btn-spinner"></span> Membuat...`;

      const purpose = targetInputId.indexOf("admin") !== -1 ? "admin" : "user";
      const dvrType = groupKey === "dvrBaru" ? "DVR_BARU" : "DVR_LAMA";

      const result = await apiRequest(
        "generateCctvPassword",
        { kdStore, dvrType, purpose },
        { sessionToken: session.sessionToken }
      );

      btn.disabled = false;
      btn.textContent = originalLabel;

      if (!result.success || !result.data || !result.data.password) {
        showError(result.message || "Gagal membuat password baru.");
        return;
      }

      const generatedPassword = result.data.password;

      valueEl.textContent = generatedPassword;
      valueEl.classList.remove("generated-password-box__value--placeholder");

      if (!box.querySelector("[data-use-password]")) {
        const useBtn = document.createElement("button");
        useBtn.type = "button";
        useBtn.className = "btn btn-primary btn-sm";
        useBtn.setAttribute("data-use-password", "");
        useBtn.textContent = "Gunakan";
        box.appendChild(useBtn);

        useBtn.addEventListener("click", () => {
          const targetInput = scopeEl.querySelector(`#${targetInputId}`) || document.getElementById(targetInputId);
          if (targetInput) {
            targetInput.value = generatedPassword;
            targetInput.type = "text";
            const toggleBtn = scopeEl.querySelector(`[data-toggle-for="${targetInputId}"]`);
            if (toggleBtn) toggleBtn.textContent = "Hide";
          }

          let check = box.querySelector(".generated-password-box__check");
          if (!check) {
            check = document.createElement("span");
            check.className = "generated-password-box__check";
            box.insertBefore(check, useBtn);
          }
          check.textContent = "\u2713 Dipilih";
        });
      }
    });
  });
}

function bindPasswordToggles(scopeEl) {
  scopeEl.querySelectorAll("[data-toggle-for]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = scopeEl.querySelector("#" + btn.getAttribute("data-toggle-for"));
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      btn.textContent = isHidden ? "Hide" : "Show";
    });
  });
}

async function submitCctvUpdate(contentEl, detail) {
  const modal = contentEl.querySelector("#cctvModal");
  const session = getSession();
  const saveBtn = modal.querySelector("#cctvSaveBtn");
  const loadingOverlay = contentEl.querySelector("#cctvSavingOverlay");

  // Cegah submit ganda saat request masih berjalan.
  if (saveBtn.disabled) {
    return;
  }

  const statusValue = modal.querySelector("#cctvStatusInput").value;
  const urlValue = modal.querySelector("#cctvUrlInput").value.trim();
  const isDvrBaru = statusValue.toUpperCase().indexOf("BARU") !== -1;
  const groupKey = isDvrBaru ? "dvrBaru" : "dvrLama";

  const credentialData = {};
  modal.querySelectorAll("[data-cred-field]").forEach((input) => {
    credentialData[input.getAttribute("data-cred-field")] = input.value;
  });

  const payload = {
    kdStore: detail.kdStore,
    data: {
      status: statusValue,
      url: urlValue
    }
  };
  payload.data[groupKey] = credentialData;

  // Tombol spinner + popup loading di tengah dengan blur ringan.
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<span class="btn-spinner"></span> Menyimpan...`;
  loadingOverlay.classList.add("is-visible");
  loadingOverlay.setAttribute("aria-hidden", "false");

  try {
    const result = await apiRequest("updateCCTV", payload, { sessionToken: session.sessionToken });

    if (result.success) {
      showSuccess(result.message || "Data berhasil diperbarui.");
      closeCctvModal(contentEl);
      loadCctvList(contentEl, session);
    } else {
      showError(result.message || "Data gagal diperbarui.");
    }
  } catch (error) {
    showError("Data gagal diperbarui. Tidak dapat menghubungi server.");
  } finally {
    loadingOverlay.classList.remove("is-visible");
    loadingOverlay.setAttribute("aria-hidden", "true");
    saveBtn.disabled = false;
    saveBtn.textContent = "Simpan";
  }
}

function closeCctvModal(contentEl) {
  contentEl.querySelector("#cctvModalOverlay").classList.remove("is-visible");
  contentEl.querySelector("#cctvModal").classList.remove("is-visible");
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
