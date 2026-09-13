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
 *
 * OPTIMASI ADMIN (ratusan-648 toko):
 * - Chunk 1 (100 toko, FULL termasuk kredensial) dirender dulu - irama load
 *   mirip user biasa (~100 toko) yang terbukti lancar.
 * - Chunk berikutnya diambil 100-per-100 di BACKGROUND sampai dataset penuh.
 * - Form edit INSTAN dari cache (cache-first) utk toko yang sudah ter-load;
 *   toko yang belum, fallback ke action getCCTVDetail.
 * - Pencarian saat cache masih partial -> lewat server (akurat lintas toko).
 */

import { renderShell } from "../shell.js";
import { apiRequest } from "../api.js";
import { getSession } from "../auth.js";
import { showSuccess, showError } from "../ui.js";
import { icon } from "../icons.js";

const STATUS_OPTIONS = ["OK - DVR BARU", "OK - DVR LAMA", "CCTV OWNER", "APP"];
const PAGE_SIZE = 10;
/* Ukuran chunk hydration admin - mirip beban per-user (~100 toko) yang
   terbukti lancar; chunk 1 tampil langsung, sisanya 100-per-chunk di
   background sampai dataset penuh (648 toko ~ 7 chunk). */
const ADMIN_CHUNK_SIZE = 100;
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
/* TOTAL TOKO = jumlah seluruh toko milik user (tanpa filter pencarian.
   Di-cache saat list dimuat TANPA search; angka ini tidak berubah-ubah
   walau user mengetik filter. */
let cctvTotalAll = null;
/* Client-side cache item CCTV (FULL, termasuk kredensial) - dipakai untuk
   form edit INSTAN (cache-first) + pagination/pencarian lokal saat penuh.
   ADMIN: terisi BERTAHAP per chunk 100 toko (chunk 1 dirender dulu,
   sisanya di-hydrate di background). */
let cctvClientCache = null;       // item yang sudah ter-load (bisa partial)
let cctvClientCacheOwner = null; // "role|nik" - cache dibuang kalau ganti user
let cctvClientCacheLoadedAt =  0;
let cctvHydrated = false;        // chunk pertama sudah masuk cache?
let cctvTotalKnown = null;       // total dataset server (penuh, tanpa filter)
let cctvHydrateToken = 0;        // pembatal loop hydration background
/* Filter tombol "Belum Lengkap": true = tampilkan HANYA toko yang status
   atau URL-nya masih kosong (data belum lengkap). */
let cctvIncompleteOnly = false;

export async function renderCctvPage(container) {
  const session = getSession();
  if (!session) return;

  currentPage = 1;
  currentSearch = "";
  cctvIncompleteOnly = false;
  cctvTotalAll = null;

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
      <button
        type="button"
        class="btn btn-secondary cctv-filter-btn"
        id="cctvIncompleteBtn"
        aria-pressed="false"
        title="Tampilkan hanya toko yang status / URL-nya masih kosong"
        aria-label="Filter toko belum lengkap"
      >
        ${icon("filter", { size: 15 })}
      </button>
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
    /* Paksa huruf kapital otomatis utk pencarian KD & NAMA toko. */
    const upper = searchInput.value.toUpperCase();
    if (upper !== searchInput.value) searchInput.value = upper;
    currentSearch = upper.trim();
    clearTimeout(cctvSearchTimer);
    cctvSearchTimer = setTimeout(() => {
      if (isCctvFullyLoaded()) {
        // Cache penuh -> pencarian lokal, instan tanpa request.
        renderFromLocalCache(contentEl, session);
      } else {
        // Cache admin masih partial -> cari lewat server supaya hasil
        // akurat lintas SELURUH toko (bukan hanya yang sudah ter-load).
        loadCctvServerSearch(contentEl, session);
      }
    }, 180);
  });

  refreshBtn.addEventListener("click", () => {
    // Refresh manual: bypass SEMUA cache (server & client) agar data
    // langsung tersinkron dengan isi Google Sheet terbaru.
    loadCctvList(contentEl, session, true);
  });

  // Toggle filter "Belum Lengkap": tampilkan hanya toko yang datanya
  // belum lengkap (status / URL kosong). Filter dikerjakan LOKAL dari cache.
  const incompleteBtn = contentEl.querySelector("#cctvIncompleteBtn");
  incompleteBtn.addEventListener("click", () => {
    cctvIncompleteOnly = !cctvIncompleteOnly;
    incompleteBtn.classList.toggle("is-active", cctvIncompleteOnly);
    incompleteBtn.setAttribute("aria-pressed", cctvIncompleteOnly ? "true" : "false");
    currentPage = 1;
    loadCctvList(contentEl, session);
  });

  contentEl.querySelector("#cctvModalOverlay").addEventListener("click", () => closeCctvModal(contentEl));
}

/**
 * Muat data CCTV.
 * - USER BIASA (IT_STORE, ~100 toko): satu request all:true (FULL, termasuk
 *   kredensial) -> cache client -> form edit instan. Sudah terbukti lancar.
 * - ADMIN (ratusan-648 toko): hydration BERTAHAP per chunk 100 toko.
 *   Chunk 1 di-await & dirender langsung (cepat), chunk berikutnya diambil
 *   berurutan di BACKGROUND sampai dataset penuh (~7 chunk).
 * - Form edit = cache-first dari item FULL di cache (instan).
 * @param {boolean} [forceRefresh] true = bypass semua cache (tombol Refresh).
 */
async function loadCctvList(contentEl, session, forceRefresh) {
  const listArea = contentEl.querySelector("#cctvListArea");
  const paginationArea = contentEl.querySelector("#cctvPaginationArea");
  const owner = (session.role || "") + "|" + (session.nik || "");

  // Cache valid & bukan refresh -> render lokal, nol request.
  if (cctvHydrated && cctvClientCacheOwner === owner && !forceRefresh) {
    renderFromLocalCache(contentEl, session);
    return;
  }

  const requestId = ++cctvRequestId;
  const hydrateToken = ++cctvHydrateToken;
  const isAdmin = session.role === "ADMIN";

  // Reset state cache untuk hydration baru.
  cctvClientCache = [];
  cctvClientCacheOwner = owner;
  cctvClientCacheLoadedAt = Date.now();
  cctvHydrated = false;
  cctvTotalKnown = null;

  listArea.innerHTML = renderTableSkeleton();
  paginationArea.innerHTML = "";

  // CHUNK 1 (admin, 100 toko) / dataset penuh (user biasa) - di-await agar
  // tabel cepat tampil; payload sekecil beban per-user yang sudah lancar.
  const firstRequest = isAdmin
    ? { page: 1, limit: PAGE_SIZE, search: "", all: true, offset: 0, chunk: ADMIN_CHUNK_SIZE, gz: true, refresh: forceRefresh ? true : undefined }
    : { page: 1, limit: PAGE_SIZE, search: "", all: true, gz: true, refresh: forceRefresh ? true : undefined };

  const first = await Promise.race([
    apiRequest("getCCTV", firstRequest, { sessionToken: session.sessionToken }),
    new Promise((resolve) =>
      setTimeout(() => resolve({ success: false, message: "Server tidak merespons dalam 30 detik.", data: null }), 30000)
    )
  ]);
  if (requestId !== cctvRequestId) return;

  if (!first.success) {
    console.error("[cctv] chunk-1 gagal:", first.message);
    listArea.innerHTML = `
      <div class="state-card">
        <div class="state-card__icon state-card__icon--error">!</div>
        <p class="state-card__title">Data CCTV gagal dimuat.</p>
        <p class="state-card__subtitle">${escapeHtml(first.message || "Periksa koneksi Anda lalu coba lagi.")}</p>
        <button type="button" class="btn btn-secondary" id="cctvRetryBtn">Coba Lagi</button>
      </div>
    `;
    listArea.querySelector("#cctvRetryBtn").addEventListener("click", () => loadCctvList(contentEl, session, forceRefresh));
    return;
  }

  const firstData = first.data || {};

  try {
    appendCctvChunk(firstData.items || []);
    cctvTotalKnown = typeof firstData.total === "number" ? firstData.total : cctvClientCache.length;
    cctvTotalAll = !currentSearch ? cctvTotalKnown : cctvTotalAll;
    cctvHydrated = true;

    /* DIAGNOSA DEPLOY: kalau console menulis "backend-lama", berarti
       Apps Script belum berisi fitur chunk (jalankan clasp push ulang). */
    console.log(
      "[cctv] chunk-1 OK - build:", firstData.api || "backend-lama (clasp push ulang!)",
      "| ter-load:", cctvClientCache.length, "/", cctvTotalKnown
    );

    renderFromLocalCache(contentEl, session);
  } catch (renderError) {
    console.error("[cctv] render chunk-1 gagal:", renderError);
    listArea.innerHTML = `
      <div class="state-card">
        <div class="state-card__icon state-card__icon--error">!</div>
        <p class="state-card__title">Terjadi kesalahan saat menampilkan data.</p>
        <p class="state-card__subtitle">${escapeHtml(String(renderError && renderError.message ? renderError.message : renderError))}</p>
        <button type="button" class="btn btn-secondary" id="cctvRetryBtn">Coba Lagi</button>
      </div>
    `;
    listArea.querySelector("#cctvRetryBtn").addEventListener("click", () => loadCctvList(contentEl, session, forceRefresh));
    return;
  }

  // BACKGROUND: chunk berikutnya (khusus admin) - berurutan 100 per request
  // sampai dataset penuh, tanpa memblokir interaksi user.
  if (isAdmin) {
    hydrateRemainingChunks(contentEl, session, hydrateToken);
  }
}

/**
 * Ambil sisa dataset admin per chunk 100 di background (berurutan).
 * Setiap chunk sukses -> render ulang list dari cache sehingga pagination
 * dan filter "Belum Lengkap" tumbuh mengikuti data yang baru ter-load.
 */
async function hydrateRemainingChunks(contentEl, session, hydrateToken) {
  while (cctvHydrateToken === hydrateToken) {
    const offset = cctvClientCache.length;
    if (cctvTotalKnown === null || offset >= cctvTotalKnown) {
      if (cctvTotalKnown !== null) {
        console.log("[cctv] hydration selesai:", cctvTotalKnown, "toko di cache.");
      }
      return;
    }

    const result = await apiRequest(
      "getCCTV",
      { page: 1, limit: PAGE_SIZE, search: "", all: true, offset: offset, chunk: ADMIN_CHUNK_SIZE, gz: true },
      { sessionToken: session.sessionToken }
    );

    if (cctvHydrateToken !== hydrateToken) return;
    if (!result.success) {
      console.warn("[cctv] chunk offset", offset, "gagal - hydration berhenti:", result.message);
      return; // berhenti - user bisa tekan Refresh
    }

    /* GUARD ANTI-LOOP: kalau chunk tidak menambah data (backend tidak
       mengenali offset/chunk), hentikan hydration supaya tidak request
       offset yang sama terus-menerus. */
    const added = appendCctvChunk((result.data || {}).items || []);
    if (added === 0) {
      console.warn("[cctv] chunk offset", offset, "kosong - hydration dihentikan.");
      return;
    }

    console.log("[cctv] hydration:", cctvClientCache.length, "/", cctvTotalKnown, "toko");

    // Render ulang hanya saat tidak sedang memfilter pencarian supaya
    // tampilan yang sedang dibaca user tidak tiba-tiba berganti.
    if (!currentSearch && cctvHydrated) {
      renderFromLocalCache(contentEl, session);
    }
  }
}

/** Tambah hasil satu chunk ke cache client (menjaga urutan offset). */
function appendCctvChunk(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  if (!Array.isArray(cctvClientCache)) cctvClientCache = [];
  for (let i = 0; i < items.length; i++) cctvClientCache.push(items[i]);
  return items.length;
}

/** true = seluruh dataset sudah di cache client (semua operasi bisa lokal). */
function isCctvFullyLoaded() {
  return Boolean(
    cctvHydrated &&
    cctvTotalKnown !== null &&
    Array.isArray(cctvClientCache) &&
    cctvClientCache.length >= cctvTotalKnown
  );
}

/** Pencarian lewat server (dipakai saat cache admin masih partial). */
async function loadCctvServerSearch(contentEl, session) {
  const requestId = ++cctvRequestId;
  const result = await apiRequest(
    "getCCTV",
    { page: currentPage, limit: PAGE_SIZE, search: currentSearch, gz: true },
    { sessionToken: session.sessionToken }
  );
  if (requestId !== cctvRequestId) return;
  if (result.success) {
    renderCctvList(contentEl, session, result.data || {});
  }
  // Gagal: biarkan tampilan terakhir agar tidak "reset" ke skeleton.
}

/**
 * Filter + paginate dari cache client (tanpa menyentuh server).
 */
function renderFromLocalCache(contentEl, session) {
  const all = cctvClientCache || [];
  let filtered = currentSearch
    ? all.filter((item) => {
        const text = ((item.kdStore || "") + " " + (item.namaStore || "")).toUpperCase();
        return text.indexOf(currentSearch) !== -1;
      })
    : all;

  // Tombol "Belum Lengkap": hanya toko dengan status / URL masih kosong.
  if (cctvIncompleteOnly) {
    filtered = filtered.filter(isCctvIncomplete_);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const payload = {
    items: filtered.slice(startIndex, startIndex + PAGE_SIZE),
    total: total,
    page: currentPage,
    totalPages: totalPages
  };

  renderCctvList(contentEl, session, payload);
}

/** true = data toko belum lengkap (status ATAU URL masih kosong). */
function isCctvIncomplete_(item) {
  const status = (item.status || "").toString().trim();
  const url = (item.url || "").toString().trim();
  return !status || !url;
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

  /* Cache total keseluruhan HANYA saat dimuat tanpa filter pencarian,
     supaya label TOTAL TOKO tidak terpengaruh filter. */
  if (!currentSearch && !cctvIncompleteOnly && isCctvFullyLoaded()) {
    cctvTotalAll = totalRecords;
  }
  const totalForPagination = cctvTotalAll !== null ? cctvTotalAll : totalRecords;

  /* Saat admin hydration berjalan (cache partial), label memakai total
     server supaya angka tidak "beranjak" dari 100 ke 648. */
  const shownTotal = (!currentSearch && !cctvIncompleteOnly && cctvTotalAll !== null)
    ? cctvTotalAll
    : totalRecords;
  countEl.textContent = shownTotal > 0
    ? (cctvIncompleteOnly ? `${totalRecords} toko belum lengkap` : `${shownTotal} toko`)
    : "";

  if (totalRecords === 0) {
    listArea.innerHTML = `
      <div class="state-card">
        <div class="state-card__icon state-card__icon--empty">-</div>
        <p class="state-card__title">Data CCTV tidak ditemukan.</p>
        <p class="state-card__subtitle">${cctvIncompleteOnly && !currentSearch ? "Semua toko sudah lengkap datanya." : "Coba ubah kata kunci pencarian."}</p>
      </div>
    `;
    paginationArea.innerHTML = renderPagination(page, 0, 0, 0, totalForPagination);
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

  paginationArea.innerHTML = renderPagination(page, totalPages, startIndex, items.length, totalForPagination);
  bindPagination(contentEl, session, totalPages);
}

function renderPagination(page, totalPages, startIndex, pageCount, totalRecords) {
  // Bar pagination: label TOTAL TOKO di kiri + kontrol halaman di kanan.
  // Label disembunyikan di desktop via CSS (display:none) supaya tampilan
  // desktop tidak berubah; di mobile tampil di pojok kiri.
  const controls = `
    <div class="pagination__controls">
      <button type="button" class="pagination__btn" data-page="prev" ${page === 1 ? "disabled" : ""}>&lsaquo;</button>
      ${renderPageNumbers(page, totalPages)}
      <button type="button" class="pagination__btn" data-page="next" ${page === totalPages ? "disabled" : ""}>&rsaquo;</button>
    </div>
  `;

  return `
    <div class="pagination">
      <span class="pagination__total">TOTAL TOKO : ${totalRecords}</span>
      ${totalPages > 1 ? controls : ""}
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

      if (!isCctvFullyLoaded() && currentSearch) {
        // Cache admin masih partial -> hasil pencarian diambil dari server
        // agar akurat lintas seluruh toko.
        loadCctvServerSearch(contentEl, session);
      } else {
        loadCctvList(contentEl, session);
      }
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
  const label = String(statusLabel == null ? "" : statusLabel);
  if (label.indexOf("BARU") !== -1) return "success";   // DVR BARU -> hijau
  if (label.indexOf("LAMA") !== -1) return "info";      // DVR LAMA -> biru tipis
  if (label.indexOf("OWNER") !== -1) return "danger";   // CCTV OWNER -> merah tipis
  if (label.indexOf("APP") !== -1) return "orange";     // APP -> orange
  return "info";
}

/**
 * Format kolom "Terakhir Update" -> "NAMA - dd/MM/yyyy HH:mm"
 * Contoh: "ALI MUTOHA - 27/08/2026 16:45".
 * Backend menulis "NAMA - <dd/MM/yyyy HH:mm>" di kolom S (tanpa
 * "Diupdate oleh"). Baris lama berformat "Diupdate oleh <NIK> - ..."
 * tetap dikenali untuk kompatibilitas.
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
  /* Kolom STATUS di spreadsheet bisa berisi angka (bukan teks) ->
     konversi paksa ke string supaya toUpperCase()/indexOf tidak error. */
  const statusLabel = String(item.status == null ? "" : item.status).toUpperCase();
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

  // Modal WAJIB dibuka lebih dulu - berlaku untuk jalur cache maupun request.
  overlay.classList.add("is-visible");
  modal.classList.add("is-visible");

  /* CACHE-FIRST (dikembalikan): chunk/all:true mengirim item FULL termasuk
     kredensial, jadi toko yang sudah ter-load form-nya terbuka INSTAN tanpa
     request. Cek per-item -> aman saat cache admin masih partial; toko yang
     belum ter-load jatuh ke jalur getCCTVDetail di bawah. */
  const cached = Array.isArray(cctvClientCache)
    ? cctvClientCache.find((it) => String(it.kdStore) === String(kdStore))
    : null;
  if (cctvHydrated && cached && cached.dvrLama && cached.dvrBaru) {
    renderCctvForm(contentEl, cached);
    return;
  }

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
          <!-- Status default KOSONG - wajib dipilih user sebelum simpan. -->
          <input type="hidden" id="cctvStatusInput" value="" />
          <button type="button" class="input status-dropdown__trigger" id="cctvStatusTrigger">
            <span id="cctvStatusValue" class="status-dropdown__placeholder">Pilih status...</span>
            ${icon("chevron", { size: 14 })}
          </button>
          <div class="status-dropdown__popover" id="cctvStatusPopover">
            ${STATUS_OPTIONS.map((opt) => `
              <button type="button" class="status-dropdown__item" data-status-value="${escapeAttr(opt)}">
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
      // Status sudah dipilih -> buang tampilan placeholder abu-abu.
      statusValueEl.classList.remove("status-dropdown__placeholder");
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

  urlInput.addEventListener("focus", () => {
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
      // Keyboard di mobile otomatis turun setelah URL dipilih (blur, bukan focus).
      urlInput.blur();
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
          <button type="button" class="password-toggle-btn" data-toggle-for="${passwordId}">
            ${icon("eye-off", { size: 16 })}
          </button>
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
            // Password sedang ditampilkan -> icon mata normal (tidak disilang).
            if (toggleBtn) toggleBtn.innerHTML = icon("eye", { size: 16 });
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
      // Icon mata: disilang saat password disembunyikan,
      // mata normal saat password sedang ditampilkan.
      btn.innerHTML = icon(isHidden ? "eye" : "eye-off", { size: 16 });
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

  const statusValue = modal.querySelector("#cctvStatusInput").value.trim();
  const urlValue = modal.querySelector("#cctvUrlInput").value.trim();

  // Validasi: kolom STATUS wajib terisi sebelum simpan (URL boleh kosong).
  if (!statusValue) {
    showError("Kolom Status harus diisi terlebih dahulu.");
    modal.querySelector("#cctvStatusTrigger").focus();
    return;
  }

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
      /* Sinkronkan cache lokal dengan hasil simpan, lalu render ulang list
         dari cache -> perubahan LANGSUNG tampil tanpa reload dari server. */
      applyCctvUpdateToCache(detail.kdStore, result.data, {
        statusValue,
        urlValue,
        credentialData,
        groupKey
      });
      renderFromLocalCache(contentEl, session);
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

/**
 * Update 1 item di cache client setelah simpan (menghindari reload server).
 * Response backend berisi baris FULL (termasuk kredensial) -> ganti penuh
 * supaya form edit berikutnya tetap terbuka instan dari cache. Jika response
 * tidak lengkap, merge manual dari nilai form + timestamp lokal.
 */
function applyCctvUpdateToCache(kdStore, serverItem, formData) {
  if (!Array.isArray(cctvClientCache)) return;
  const idx = cctvClientCache.findIndex((it) => String(it.kdStore) === String(kdStore));
  if (idx === -1) return;

  if (serverItem && serverItem.kdStore) {
    cctvClientCache[idx] = serverItem;
    return;
  }

  // Fallback: merge manual dari nilai form.
  // Format sama dengan backend: "NAMA - dd/MM/yyyy HH:mm" (tanpa "Diupdate oleh").
  const session = getSession();
  const actor = (session && (session.name || session.nik)) || "";
  const item = cctvClientCache[idx];
  item.status = formData.statusValue;
  item.url = formData.urlValue;
  item[formData.groupKey] = Object.assign({}, item[formData.groupKey] || {}, formData.credentialData);
  item.updatedInfo = actor + " - " + formatCctvTimestamp(new Date());
}

/** Format timestamp dd/MM/yyyy HH:mm (menyamai format catatan backend). */
function formatCctvTimestamp(date) {
  const p = (n) => String(n).padStart(2, "0");
  return (
    p(date.getDate()) + "/" + p(date.getMonth() + 1) + "/" + date.getFullYear() +
    " " + p(date.getHours()) + ":" + p(date.getMinutes())
  );
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
