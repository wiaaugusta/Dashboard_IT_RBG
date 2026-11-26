import { getSession } from "../auth.js";
import { icon } from "../icons.js";
import { renderShell } from "../shell.js";
import {
  getAhoSlaStoreCache,
  loadAhoSlaStoreCached
} from "../aho-sla-cache.js";
import {
  aggregateAhoSlaByDate,
  formatAhoSlaAchievement,
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
    periodOpen: false,
    expandedDate: "",
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
  let outsidePeriodClick = null;

  const render = () => {
    if (!container.contains(page)) return;
    page.innerHTML = renderDashboard(state);
  };

  const isReducedMotion = () =>
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setPeriodPanelOpen = (open) => {
    state.periodOpen = open;
    const panel = page.querySelector("[data-aho-period-panel]");
    const toggle = page.querySelector("[data-aho-period-toggle]");
    if (!panel || !toggle) return;

    toggle.setAttribute("aria-expanded", String(open));
    const chevron = toggle.querySelector(".aho-sla-period__chevron");
    if (chevron) chevron.innerHTML = icon(open ? "chevron-up" : "chevron-down", { size: 17 });

    panel.inert = !open;
    panel.setAttribute("aria-hidden", String(!open));
    if (open) {
      panel.hidden = false;
      if (isReducedMotion()) panel.classList.add("is-open");
      else requestAnimationFrame(() => {
        if (state.periodOpen && panel.isConnected) panel.classList.add("is-open");
      });
      return;
    }

    panel.classList.remove("is-open");
    if (isReducedMotion()) panel.hidden = true;
  };

  const setDetailsRowOpen = (dateKey, open) => {
    const row = page.querySelector(`[data-aho-details-row="${dateKey}"]`);
    const toggle = Array.from(page.querySelectorAll("[data-aho-details]"))
      .find((button) => button.getAttribute("data-aho-details") === dateKey);
    if (!row || !toggle) return;

    toggle.setAttribute("aria-expanded", String(open));
    const dateLabel = toggle.querySelector("span")?.textContent || dateKey;
    const problemCount = toggle.getAttribute("data-problems") || "";
    toggle.setAttribute(
      "aria-label",
      `${open ? "Sembunyikan" : "Tampilkan"} detail ${problemCount} problem pada ${dateLabel}`
    );
    row.inert = !open;
    row.setAttribute("aria-hidden", String(!open));

    if (open) {
      row.hidden = false;
      requestAnimationFrame(() => {
        if (state.expandedDate === dateKey && row.isConnected) row.classList.add("is-open");
      });
      return;
    }

    row.classList.remove("is-open");
    if (isReducedMotion()) row.hidden = true;
  };

  page.addEventListener("transitionend", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (
      target.matches("[data-aho-period-panel]") &&
      event.propertyName === "opacity" &&
      !state.periodOpen
    ) {
      target.hidden = true;
      return;
    }

    const detailsMotion = target.closest(".aho-sla-details__motion");
    const detailsRow = detailsMotion?.closest("[data-aho-details-row]");
    if (
      detailsRow &&
      event.propertyName === "grid-template-rows" &&
      !detailsRow.classList.contains("is-open") &&
      state.expandedDate !== detailsRow.getAttribute("data-aho-details-row")
    ) {
      detailsRow.hidden = true;
    }
  });

  const closePeriod = () => {
    if (state.periodOpen) setPeriodPanelOpen(false);
    if (outsidePeriodClick) {
      document.removeEventListener("click", outsidePeriodClick);
      outsidePeriodClick = null;
    }
  };

  const openPeriod = () => {
    setPeriodPanelOpen(true);
    if (outsidePeriodClick) document.removeEventListener("click", outsidePeriodClick);
    outsidePeriodClick = (outsideEvent) => {
      const outsideTarget = outsideEvent.target;
      if (outsideTarget instanceof Element && outsideTarget.closest("[data-aho-period]")) return;
      closePeriod();
    };
    document.addEventListener("click", outsidePeriodClick);
  };

  page.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const periodToggle = target?.closest("[data-aho-period-toggle]");
    const monthButton = target?.closest("[data-aho-month]");
    const allMonthsButton = target?.closest("[data-aho-months-all]");
    const detailToggle = target?.closest("[data-aho-details]");
    const pageButton = target?.closest("[data-aho-page]");
    const retryButton = target?.closest("[data-aho-retry]");
    const clickedOutsidePeriod = state.periodOpen && !target?.closest("[data-aho-period]");

    if (clickedOutsidePeriod) closePeriod();

    if (periodToggle) {
      if (state.periodOpen) closePeriod();
      else openPeriod();
      page.querySelector("[data-aho-period-toggle]")?.focus();
      return;
    }

    if (detailToggle) {
      const dateKey = detailToggle.getAttribute("data-aho-details");
      const previousDate = state.expandedDate;
      const nextDate = previousDate === dateKey ? "" : dateKey;
      state.expandedDate = nextDate;
      if (previousDate) setDetailsRowOpen(previousDate, false);
      if (nextDate) setDetailsRowOpen(nextDate, true);
      detailToggle.focus();
      return;
    }

    if (monthButton) {
      const month = Number(monthButton.getAttribute("data-aho-month"));
      if (state.months.has(month)) state.months.delete(month);
      else state.months.add(month);
      state.page = 1;
      state.expandedDate = "";
      render();
      page.querySelector(`[data-aho-month="${month}"]`)?.focus();
      return;
    }

    if (allMonthsButton) {
      state.months = state.months.size === 12
        ? new Set()
        : new Set(getAhoSlaMonths().map((month) => month.value));
      state.page = 1;
      state.expandedDate = "";
      render();
      page.querySelector("[data-aho-months-all]")?.focus();
      return;
    }

    if (pageButton) {
      state.page = Number(pageButton.getAttribute("data-aho-page")) || 1;
      state.expandedDate = "";
      render();
      return;
    }

    if (retryButton) {
      loadData(true);
      return;
    }

  });

  page.addEventListener("change", (event) => {
    const target = event.target instanceof HTMLSelectElement ? event.target : null;
    if (!target || !target.matches("[data-aho-year]")) return;
    state.year = Number(target.value);
    state.page = 1;
    state.expandedDate = "";
    render();
    page.querySelector("[data-aho-year]")?.focus();
  });

  page.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !state.periodOpen) return;
    closePeriod();
    page.querySelector("[data-aho-period-toggle]")?.focus();
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
  const periodSummary = selectedMonths.length === 12
    ? "Semua bulan"
    : selectedMonths.length === 1
      ? months[selectedMonths[0] - 1].label
      : selectedMonths.length
        ? `${selectedMonths.length} bulan`
        : "Pilih bulan";

  return `
    <header class="aho-sla-header">
      <div class="aho-sla-header__title">
        <div class="aho-sla-header__icon" aria-hidden="true">${icon("aho", { size: 24 })}</div>
        <div>
          <p>AHO <span aria-hidden="true">/</span> STORE OPERATIONS</p>
          <h1>SLA AHO Store</h1>
          <span>Performa penyelesaian tiket berdasarkan tanggal diterima.</span>
        </div>
      </div>
      ${renderPeriodPicker(state, years, months, periodSummary)}
    </header>

    <section class="aho-sla-stats" aria-label="Ringkasan SLA AHO Store">
      ${renderStatCard("clock", "Total waktu penyelesaian", summary ? formatAhoSlaDuration(summary.totalMinutes) : "—", "aho-sla-stat--time")}
      ${renderStatCard("inbox", "Total problem", summary ? formatNumber(summary.totalProblems) : "—", "aho-sla-stat--problems")}
      ${renderStatCard("activity", "Rata-rata per problem", summary ? formatAhoSlaDuration(summary.averageMinutes) : "—", "aho-sla-stat--average")}
    </section>

    ${state.error ? renderErrorState(state.error) : ""}
    ${state.loading ? renderLoadingState() : ""}
    ${summary && !state.loading && !state.error ? renderDailyTable(summary, state, monthLabel) : ""}
  `;
}

function renderPeriodPicker(state, years, months, periodSummary) {
  const monthLabel = state.months.size === 12
    ? "Semua bulan"
    : state.months.size
      ? Array.from(state.months)
        .sort((a, b) => a - b)
        .map((month) => months[month - 1].label)
        .join(", ")
      : "Belum ada bulan dipilih";

  return `
    <div class="aho-sla-period" data-aho-period>
      <button
        class="aho-sla-period__trigger"
        type="button"
        data-aho-period-toggle
        aria-expanded="${state.periodOpen}"
        aria-controls="ahoSlaPeriodPanel"
      >
        <span class="aho-sla-period__icon" aria-hidden="true">${icon("calendar", { size: 18 })}</span>
        <span class="aho-sla-period__text">
          <span>Periode</span>
          <strong>${escapeHtml(periodSummary)} · ${state.year}</strong>
        </span>
        <span class="aho-sla-period__chevron" aria-hidden="true">${icon(state.periodOpen ? "chevron-up" : "chevron-down", { size: 17 })}</span>
      </button>
      <div
        class="aho-sla-period__panel${state.periodOpen ? " is-open" : ""}"
        id="ahoSlaPeriodPanel"
        data-aho-period-panel
        role="region"
        aria-label="Filter tahun dan bulan"
        aria-hidden="${!state.periodOpen}"
        ${state.periodOpen ? "" : "hidden"}
        ${state.periodOpen ? "" : "inert"}
      >
        <div class="aho-sla-period__panel-heading">
          <div>
            <h2>Pilih periode</h2>
            <p>Tentukan tahun dan satu atau beberapa bulan.</p>
          </div>
          <button
            class="aho-sla-period__all"
            type="button"
            data-aho-months-all
            aria-pressed="${state.months.size === 12}"
          >${state.months.size === 12 ? "Hapus pilihan" : "Pilih semua"}</button>
        </div>
        <label class="aho-sla-period__year">
          <span>Tahun</span>
          <select data-aho-year aria-label="Pilih tahun">
            ${years.map((year) => `
              <option value="${year}"${year === state.year ? " selected" : ""}>${year}</option>
            `).join("")}
          </select>
        </label>
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
        <p class="aho-sla-period__selection" aria-live="polite">
          ${escapeHtml(monthLabel)} · ${state.year}
        </p>
      </div>
    </div>
  `;
}

function renderStatCard(iconName, label, value, className) {
  return `
    <article class="aho-sla-stat ${className}">
      <div class="aho-sla-stat__icon" aria-hidden="true">${icon(iconName, { size: 22 })}</div>
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
  const selectedPeriod = state.months.size === 12
    ? "Semua bulan"
    : state.months.size === 1
      ? monthLabel
      : state.months.size
        ? `${state.months.size} bulan dipilih`
        : "Belum ada bulan dipilih";
  const rangeLabel = summary.rows.length
    ? `Menampilkan ${start + 1}–${Math.min(start + PAGE_SIZE, summary.rows.length)} dari ${summary.rows.length} tanggal`
    : "Tidak ada tanggal untuk periode yang dipilih";

  return `
    <section class="aho-sla-daily" aria-labelledby="ahoSlaDailyTitle">
      <header class="aho-sla-daily__header">
        <div class="aho-sla-daily__heading">
          <span class="aho-sla-daily__icon" aria-hidden="true">${icon("calendar", { size: 19 })}</span>
          <div>
            <h2 id="ahoSlaDailyTitle">${escapeHtml(tableTitle)}</h2>
            <p>Tanggal dari kolom Tgl Terima; total problem menghitung jumlah tiket.</p>
          </div>
        </div>
        <span class="aho-sla-daily__period">${summary.rows.length} tanggal aktif <span aria-hidden="true">·</span> ${escapeHtml(selectedPeriod)}${state.months.size ? ` ${state.year}` : ""}</span>
      </header>

      ${!state.months.size ? `
        <div class="aho-sla-empty">Pilih setidaknya satu bulan untuk melihat rincian.</div>
      ` : !summary.rows.length ? `
        <div class="aho-sla-empty">Belum ada problem pada periode yang dipilih.</div>
      ` : `
        <div class="aho-sla-table-wrap">
          <table class="aho-sla-table">
            <thead>
              <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Total waktu</th>
                <th scope="col">Total problem</th>
                <th scope="col">Rata-rata waktu</th>
                <th scope="col">Perbandingan waktu</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((row) => renderDailyRow(row, summary.maxDailyMinutes, state.expandedDate)).join("")}
            </tbody>
          </table>
        </div>
      `}

      <footer class="aho-sla-daily__footer">
        <span>${rangeLabel}</span>
        ${pageCount > 1 ? renderPagination(page, pageCount) : ""}
      </footer>
    </section>
  `;
}

function renderDailyRow(row, maxDailyMinutes, expandedDate) {
  const trend = maxDailyMinutes > 0
    ? Math.max(0, Math.min(100, (row.totalMinutes / maxDailyMinutes) * 100))
    : 0;
  const expandable = row.problems > 1;
  const expanded = expandable && expandedDate === row.key;
  const dateLabel = formatAhoSlaDate(row.date);

  return `
    <tr class="${expanded ? "is-expanded" : ""}">
      <td data-label="Tanggal">
        ${expandable ? `
          <button
            class="aho-sla-date-toggle"
            type="button"
            data-aho-details="${row.key}"
            data-problems="${formatNumber(row.problems)}"
            aria-expanded="${expanded}"
            aria-controls="ahoSlaDetails-${row.key}"
            aria-label="${expanded ? "Sembunyikan" : "Tampilkan"} detail ${formatNumber(row.problems)} problem pada ${escapeHtml(dateLabel)}"
          >
            <span>${escapeHtml(dateLabel)}</span>
            <span class="aho-sla-date-toggle__chevron" aria-hidden="true">${icon("chevron-down", { size: 15 })}</span>
          </button>
        ` : escapeHtml(dateLabel)}
      </td>
      <td data-label="Total waktu">${formatAhoSlaDuration(row.totalMinutes)}</td>
      <td data-label="Total problem"><span class="aho-sla-problem-count">${formatNumber(row.problems)}</span></td>
      <td data-label="Rata-rata waktu">${formatAhoSlaDuration(row.averageMinutes)}</td>
      <td class="aho-sla-trend-cell" data-label="Perbandingan waktu">
        <span class="aho-sla-trend" role="img" aria-label="Total ${formatAhoSlaDuration(row.totalMinutes)} dibandingkan dengan tanggal yang memiliki total waktu tertinggi">
          <span class="aho-sla-trend__fill" style="width:${trend.toFixed(1)}%"></span>
        </span>
      </td>
    </tr>
    ${expandable ? renderDetailsRow(row, expanded) : ""}
  `;
}

function renderDetailsRow(row, expanded) {
  const missingFields = row.missingDetailFields || [];
  const details = row.detailItems || [];
  const headers = [
    ["storeCode", "Kode Toko"],
    ["storeName", "Nama Toko"],
    ["responsible", "Nama Penanggung"],
    ["durationMinutes", "Waktu Penyelesaian"],
    ["achievement", "Ach SLA"]
  ];

  return `
    <tr
      class="aho-sla-details-row${expanded ? " is-open" : ""}"
      data-aho-details-row="${row.key}"
      aria-hidden="${!expanded}"
      ${expanded ? "" : "hidden inert"}
    >
      <td colspan="5">
        <div class="aho-sla-details__motion">
          <section
            class="aho-sla-details"
            id="ahoSlaDetails-${row.key}"
            aria-label="Detail tiket ${escapeHtml(formatAhoSlaDate(row.date))}"
          >
            <header class="aho-sla-details__header">
              <span class="aho-sla-details__icon" aria-hidden="true">${icon("store", { size: 18 })}</span>
              <div>
                <h3>Detail tiket · ${escapeHtml(formatAhoSlaDate(row.date))}</h3>
                <p>${formatNumber(row.problems)} problem pada tanggal ini</p>
              </div>
            </header>
            ${missingFields.length ? `
              <p class="aho-sla-details__warning" role="alert">
                Kolom tidak ditemukan pada respons data: ${escapeHtml(missingFields.join(", "))}.
              </p>
            ` : ""}
            <div class="aho-sla-details__table-wrap">
              <table class="aho-sla-details__table">
                <thead>
                  <tr>${headers.map(([, label]) => `<th scope="col">${label}</th>`).join("")}</tr>
                </thead>
                <tbody>
                  ${details.map((item) => `
                    <tr>
                      ${headers.map(([key, label]) => {
                        const value = key === "durationMinutes"
                          ? formatAhoSlaDuration(item[key])
                          : key === "achievement"
                            ? formatAhoSlaAchievement(item[key])
                            : item[key] || "—";
                        return `<td data-label="${label}">${escapeHtml(value)}</td>`;
                      }).join("")}
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </section>
        </div>
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
