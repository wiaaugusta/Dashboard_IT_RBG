import { getSession } from "../auth.js";
import { icon } from "../icons.js";
import { renderShell } from "../shell.js";
import {
  getAhoSlaStoreCache,
  loadAhoSlaStoreCached
} from "../aho-sla-cache.js";
import {
  aggregateAhoSlaByDate,
  formatAhoSlaDate,
  formatAhoSlaDuration,
  getAhoSlaAvailableYears,
  getAhoSlaMonths,
  resolveAhoSlaFields
} from "../aho-sla-data.js";

const PAGE_SIZE = 15;
const AHO_SLA_ROLES = new Set(["ADMIN", "IT_STORE"]);

export function renderAhoSummaryPage(container, routeInfo) {
  const session = getSession();
  if (!session) return;

  if (!AHO_SLA_ROLES.has(session.role)) {
    renderShell(container, {
      activeKey: routeInfo.key,
      pageTitle: "AHO",
      contentHtml: `
        <section class="aho-sla-access" role="status">
          <div class="aho-sla-access__icon">${icon("lock", { size: 22 })}</div>
          <div>
            <h2>Akses data terbatas</h2>
            <p>Dashboard SLA AHO Store hanya tersedia untuk ADMIN dan IT_STORE.</p>
          </div>
        </section>
      `
    });
    return;
  }

  const now = new Date();
  const state = {
    year: now.getFullYear(),
    months: new Set([now.getMonth() + 1]),
    page: 1,
    table: getAhoSlaStoreCache(session)?.table || null,
    loading: !getAhoSlaStoreCache(session),
    error: ""
  };

  renderShell(container, {
    activeKey: routeInfo.key,
    pageTitle: "AHO",
    contentHtml: `<div class="aho-sla-page" data-aho-sla-page></div>`
  });

  const page = container.querySelector("[data-aho-sla-page]");
  if (!page) return;

  const render = () => {
    if (!container.contains(page)) return;
    page.innerHTML = renderDashboard(state);
  };

  page.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const monthButton = target?.closest("[data-aho-month]");
    const allMonthsButton = target?.closest("[data-aho-months-all]");
    const pageButton = target?.closest("[data-aho-page]");
    const retryButton = target?.closest("[data-aho-retry]");

    if (monthButton) {
      const month = Number(monthButton.getAttribute("data-aho-month"));
      if (state.months.has(month)) state.months.delete(month);
      else state.months.add(month);
      state.page = 1;
      render();
      return;
    }

    if (allMonthsButton) {
      state.months = state.months.size === 12
        ? new Set()
        : new Set(getAhoSlaMonths().map((month) => month.value));
      state.page = 1;
      render();
      return;
    }

    if (pageButton) {
      state.page = Number(pageButton.getAttribute("data-aho-page")) || 1;
      render();
      return;
    }

    if (retryButton) {
      loadData(true);
    }
  });

  page.addEventListener("change", (event) => {
    const target = event.target instanceof HTMLSelectElement ? event.target : null;
    if (!target || !target.matches("[data-aho-year]")) return;
    state.year = Number(target.value);
    state.page = 1;
    render();
  });

  render();
  if (state.table) {
    try {
      resolveAhoSlaFields(state.table);
    } catch (error) {
      state.table = null;
      state.error = error.message || "Struktur data SLA AHO Store tidak sesuai.";
      render();
      console.error("[aho-summary.js] Header data SLA tidak dikenali:", error);
    }
    return;
  }
  loadData();

  function loadData(forceRefresh = false) {
    state.loading = true;
    state.error = "";
    render();

    loadAhoSlaStoreCached(session, { forceRefresh })
      .then((result) => {
        if (getSession()?.sessionToken !== session.sessionToken || !container.contains(page)) return;
        if (!result?.success || !result.data?.table) {
          state.error = result?.message || "Data SLA AHO Store gagal dimuat.";
          state.table = null;
          return;
        }

        try {
          resolveAhoSlaFields(result.data.table);
          state.table = result.data.table;
        } catch (error) {
          state.error = error.message || "Struktur data SLA AHO Store tidak sesuai.";
          state.table = null;
          console.error("[aho-summary.js] Header data SLA tidak dikenali:", error);
        }
      })
      .catch((error) => {
        if (getSession()?.sessionToken !== session.sessionToken || !container.contains(page)) return;
        state.error = error.message || "Data SLA AHO Store gagal dimuat.";
        state.table = null;
        console.error("[aho-summary.js] Data SLA AHO Store gagal dimuat:", error);
      })
      .finally(() => {
        if (getSession()?.sessionToken !== session.sessionToken || !container.contains(page)) return;
        state.loading = false;
        render();
      });
  }
}

function renderDashboard(state) {
  const months = getAhoSlaMonths();
  const selectedMonths = Array.from(state.months).sort((a, b) => a - b);
  const years = state.table
    ? getAhoSlaAvailableYears(state.table)
    : [new Date().getFullYear()];
  const summary = state.table && !state.error
    ? aggregateAhoSlaByDate(state.table, state.year, selectedMonths)
    : null;
  const monthLabel = selectedMonths.length === 12
    ? "Semua bulan"
    : selectedMonths.length
      ? selectedMonths.map((value) => months[value - 1].label).join(", ")
      : "Belum ada bulan dipilih";

  return `
    <header class="aho-sla-header">
      <div class="aho-sla-header__title">
        <div class="aho-sla-header__icon">${icon("aho", { size: 24 })}</div>
        <div>
          <p>ASSET &amp; HARDWARE OPERATION</p>
          <h1>SLA AHO Store</h1>
          <span>Ringkasan waktu penyelesaian tiket berdasarkan tanggal diterima.</span>
        </div>
      </div>
      <label class="aho-sla-year">
        <span>${icon("calendar", { size: 17 })} Tahun</span>
        <select data-aho-year aria-label="Pilih tahun">
          ${years.map((year) => `
            <option value="${year}"${year === state.year ? " selected" : ""}>${year}</option>
          `).join("")}
        </select>
      </label>
    </header>

    <section class="aho-sla-filter" aria-label="Filter bulan">
      <div class="aho-sla-filter__heading">
        <div>
          <h2>Pilih periode</h2>
          <p>Pilih satu atau beberapa bulan untuk memperbarui ringkasan dan rincian harian.</p>
        </div>
        <button
          class="aho-sla-filter__all${selectedMonths.length === 12 ? " is-active" : ""}"
          type="button"
          data-aho-months-all
          aria-pressed="${selectedMonths.length === 12}"
        >${selectedMonths.length === 12 ? "Batalkan semua" : "Semua bulan"}</button>
      </div>
      <div class="aho-sla-months" role="group" aria-label="Bulan yang ditampilkan">
        ${months.map((month) => {
          const selected = state.months.has(month.value);
          return `
            <button
              class="aho-sla-month${selected ? " is-selected" : ""}"
              type="button"
              data-aho-month="${month.value}"
              aria-pressed="${selected}"
            >${month.label}</button>
          `;
        }).join("")}
      </div>
      <p class="aho-sla-filter__selection" aria-live="polite">
        ${escapeHtml(monthLabel)} ${selectedMonths.length ? `· ${state.year}` : ""}
      </p>
    </section>

    <section class="aho-sla-stats" aria-label="Ringkasan SLA AHO Store">
      ${renderStatCard("clock", "Total waktu", summary ? formatAhoSlaDuration(summary.totalMinutes) : "—", "aho-sla-stat--time")}
      ${renderStatCard("alert", "Total problem", summary ? formatNumber(summary.totalProblems) : "—", "aho-sla-stat--problems")}
      ${renderStatCard("bar-chart-2", "Rata-rata waktu / problem", summary ? formatAhoSlaDuration(summary.averageMinutes) : "—", "aho-sla-stat--average")}
    </section>

    ${state.error ? renderErrorState(state.error) : ""}
    ${state.loading ? renderLoadingState() : ""}
    ${summary && !state.loading && !state.error ? renderDailyTable(summary, state, monthLabel) : ""}
  `;
}

function renderStatCard(iconName, label, value, className) {
  return `
    <article class="aho-sla-stat ${className}">
      <div class="aho-sla-stat__icon">${icon(iconName, { size: 25 })}</div>
      <div class="aho-sla-stat__content">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    </article>
  `;
}

function renderLoadingState() {
  return `
    <div class="aho-sla-state" role="status" aria-live="polite">
      <span class="aho-sla-spinner" aria-hidden="true"></span>
      <span>Memuat data SLA AHO Store...</span>
    </div>
  `;
}

function renderErrorState(message) {
  return `
    <div class="aho-sla-error" role="alert">
      <div>
        <strong>Data SLA belum dapat ditampilkan</strong>
        <p>${escapeHtml(message)}</p>
      </div>
      <button class="btn btn-secondary btn-sm" type="button" data-aho-retry>Muat ulang</button>
    </div>
  `;
}

function renderDailyTable(summary, state, monthLabel) {
  const pageCount = Math.ceil(summary.rows.length / PAGE_SIZE);
  const page = Math.min(Math.max(state.page, 1), Math.max(pageCount, 1));
  const start = (page - 1) * PAGE_SIZE;
  const rows = summary.rows.slice(start, start + PAGE_SIZE);
  const tableTitle = state.months.size === 1
    ? `Rincian harian · ${monthLabel} ${state.year}`
    : `Rincian harian · ${state.year}`;
  const rangeLabel = summary.rows.length
    ? `Menampilkan ${start + 1}–${Math.min(start + PAGE_SIZE, summary.rows.length)} dari ${summary.rows.length} tanggal`
    : "Tidak ada tanggal untuk periode yang dipilih";

  return `
    <section class="aho-sla-daily" aria-labelledby="ahoSlaDailyTitle">
      <header class="aho-sla-daily__header">
        <div class="aho-sla-daily__heading">
          <span class="aho-sla-daily__accent"></span>
          <div>
            <h2 id="ahoSlaDailyTitle">${escapeHtml(tableTitle)}</h2>
            <p>Tanggal dari kolom Tgl Terima; total problem menghitung jumlah tiket.</p>
          </div>
        </div>
        <span class="aho-sla-daily__period">${escapeHtml(monthLabel)}${state.months.size ? ` ${state.year}` : ""}</span>
      </header>

      ${state.months.size ? `
        <div class="aho-sla-table-wrap">
          <table class="aho-sla-table">
            <thead>
              <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Total waktu</th>
                <th scope="col">Total problem</th>
                <th scope="col">Rata-rata waktu</th>
                <th scope="col">Tren waktu</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((row) => renderDailyRow(row, summary.maxDailyMinutes)).join("")}
            </tbody>
          </table>
        </div>
      ` : '<div class="aho-sla-empty">Pilih setidaknya satu bulan untuk melihat rincian.</div>'}

      <footer class="aho-sla-daily__footer">
        <span>${rangeLabel}</span>
        ${pageCount > 1 ? renderPagination(page, pageCount) : ""}
      </footer>
    </section>
  `;
}

function renderDailyRow(row, maxDailyMinutes) {
  const trend = maxDailyMinutes > 0
    ? Math.max(0, Math.min(100, (row.totalMinutes / maxDailyMinutes) * 100))
    : 0;

  return `
    <tr>
      <td data-label="Tanggal">${formatAhoSlaDate(row.date)}</td>
      <td data-label="Total waktu">${formatAhoSlaDuration(row.totalMinutes)}</td>
      <td data-label="Total problem"><span class="aho-sla-problem-count">${formatNumber(row.problems)}</span></td>
      <td data-label="Rata-rata waktu">${formatAhoSlaDuration(row.averageMinutes)}</td>
      <td class="aho-sla-trend-cell" data-label="Tren waktu">
        <span class="aho-sla-trend" role="img" aria-label="Tren total waktu ${formatAhoSlaDuration(row.totalMinutes)}">
          <span class="aho-sla-trend__fill" style="width:${trend.toFixed(1)}%"></span>
        </span>
      </td>
    </tr>
  `;
}

function renderPagination(currentPage, pageCount) {
  const pages = new Set([1, pageCount]);
  for (let page = Math.max(1, currentPage - 1); page <= Math.min(pageCount, currentPage + 1); page++) {
    pages.add(page);
  }
  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  let previousPage = 0;
  const pageButtons = sortedPages.map((page) => {
    const gap = previousPage && page - previousPage > 1
      ? '<span class="aho-sla-pagination__gap" aria-hidden="true">…</span>'
      : "";
    previousPage = page;
    return `${gap}
      <button
        class="aho-sla-pagination__button${page === currentPage ? " is-active" : ""}"
        type="button"
        data-aho-page="${page}"
        aria-label="Halaman ${page}"
        aria-current="${page === currentPage ? "page" : "false"}"
      >${page}</button>
    `;
  }).join("");

  return `
    <nav class="aho-sla-pagination" aria-label="Navigasi halaman rincian">
      <button
        class="aho-sla-pagination__button"
        type="button"
        data-aho-page="${Math.max(1, currentPage - 1)}"
        aria-label="Halaman sebelumnya"
        ${currentPage === 1 ? "disabled" : ""}
      >${icon("chevron-right", { size: 15, className: "aho-sla-pagination__previous" })}</button>
      ${pageButtons}
      <button
        class="aho-sla-pagination__button"
        type="button"
        data-aho-page="${Math.min(pageCount, currentPage + 1)}"
        aria-label="Halaman berikutnya"
        ${currentPage === pageCount ? "disabled" : ""}
      >${icon("chevron-right", { size: 15 })}</button>
    </nav>
  `;
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}
