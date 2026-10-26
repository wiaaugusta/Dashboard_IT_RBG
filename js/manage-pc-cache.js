/**
 * MANAGE-PC-CACHE.JS - cache client-side untuk halaman Manage PC.
 *
 * Tujuan: sama seperti CCTV, dataset Manage PC cukup diambil sekali lalu
 * dipakai ulang saat user pindah menu dan kembali. Dataset (175 perangkat)
 * diambil bertahap: halaman pertama langsung dirender, sisanya di-hydrate
 * di background. Cache dibuang otomatis saat user (role|NIK) berganti.
 */

import { loadManagePcList, loadManagePcSummary } from "./api.js";
import { getSession } from "./auth.js";

/* Backend membatasi limit list maksimal 50 (MANAGE_PC_MAX_PAGE_SIZE). */
const MANAGE_PC_FETCH_LIMIT = 50;

const SUMMARY_CACHE = new Map();
const SUMMARY_REQUESTS = new Map();
const DATASET_CACHE = new Map();

function ownerKey(session) {
  return `${session?.role || ""}|${session?.nik || ""}`;
}

function summaryKey(scope, session) {
  return `${ownerKey(session)}|summary|${scope}`;
}

function datasetKey(scope, session) {
  return `${ownerKey(session)}|list|${scope}`;
}

function notify(dataset) {
  dataset.listeners.forEach((listener) => {
    try {
      listener(dataset);
    } catch (error) {
      console.error("[manage-pc-cache] listener gagal:", error);
    }
  });
}

/**
 * Ringkasan Manage PC yang sudah di-cache (sinkron), atau null.
 * Dipakai agar kartu langsung tampil tanpa skeleton saat kembali ke menu.
 */
export function getManagePcSummaryCache(scope, session) {
  return SUMMARY_CACHE.get(summaryKey(scope, session)) || null;
}

/**
 * Ambil ringkasan dengan cache-first. Request yang sedang berjalan
 * dideduplikasi supaya pindah menu cepat tidak memicu request ganda.
 */
export async function loadManagePcSummaryCached(scope, session, options = {}) {
  const key = summaryKey(scope, session);

  if (!options.forceRefresh && SUMMARY_CACHE.has(key)) {
    return { success: true, data: SUMMARY_CACHE.get(key) };
  }

  if (!options.forceRefresh && SUMMARY_REQUESTS.has(key)) {
    return SUMMARY_REQUESTS.get(key);
  }

  const request = loadManagePcSummary(scope, { sessionToken: session.sessionToken })
    .then((result) => {
      SUMMARY_REQUESTS.delete(key);
      if (result && result.success && result.data) {
        SUMMARY_CACHE.set(key, result.data);
      }
      return result;
    })
    .catch((error) => {
      SUMMARY_REQUESTS.delete(key);
      throw error;
    });

  SUMMARY_REQUESTS.set(key, request);
  return request;
}

/** Dataset list yang sudah ada di memori (bisa masih partial), atau null. */
export function getManagePcDataset(scope, session) {
  return DATASET_CACHE.get(datasetKey(scope, session)) || null;
}

/**
 * Pastikan dataset list sedang dimuat. Promise selesai setelah chunk pertama
 * masuk; chunk berikutnya berjalan di background dan memanggil onUpdate.
 */
export function ensureManagePcDataset(scope, session, options = {}) {
  const key = datasetKey(scope, session);
  let dataset = DATASET_CACHE.get(key);

  if (!dataset) {
    dataset = {
      key,
      scope,
      owner: ownerKey(session),
      items: [],
      total: null,
      hydrated: false,
      started: false,
      loadingFirst: false,
      hydrating: false,
      error: "",
      listeners: new Set(),
      firstPromise: null
    };
    DATASET_CACHE.set(key, dataset);
  }

  if (typeof options.onUpdate === "function") {
    dataset.listeners.clear();
    dataset.listeners.add(options.onUpdate);
  }

  if (dataset.hydrated) return Promise.resolve(dataset);

  if (!dataset.firstPromise) {
    dataset.started = true;
    dataset.loadingFirst = true;
    dataset.firstPromise = loadFirstChunk(scope, session, dataset);
    return dataset.firstPromise;
  }

  if (dataset.items.length && !dataset.hydrating) {
    startHydration(scope, session, dataset);
  }

  return dataset.firstPromise;
}

async function loadFirstChunk(scope, session, dataset) {
  try {
    const result = await loadManagePcList("kaspersky", scope, {
      page: 1,
      limit: MANAGE_PC_FETCH_LIMIT,
      view: "inventory",
      sessionToken: session.sessionToken
    });

    if (DATASET_CACHE.get(dataset.key) !== dataset) return dataset;
    if (!result.success) {
      throw new Error(result.message || "Data perangkat gagal dimuat.");
    }

    const data = result.data || {};
    dataset.items = Array.isArray(data.items) ? data.items.slice() : [];
    dataset.total = Number(data.total);
    if (!Number.isFinite(dataset.total) || dataset.total < dataset.items.length) {
      dataset.total = dataset.items.length;
    }
    dataset.hydrated = dataset.items.length >= dataset.total;
    dataset.error = "";
    dataset.loadingFirst = false;
    notify(dataset);

    if (!dataset.hydrated) startHydration(scope, session, dataset);
    return dataset;
  } catch (error) {
    dataset.loadingFirst = false;
    dataset.error = error.message || "Data perangkat gagal dimuat.";
    dataset.firstPromise = null;
    DATASET_CACHE.delete(dataset.key);
    notify(dataset);
    throw error;
  }
}

function startHydration(scope, session, dataset) {
  if (dataset.hydrating || dataset.hydrated) return;
  dataset.hydrating = true;
  hydrateRemaining(scope, session, dataset)
    .catch((error) => console.warn("[manage-pc-cache] hydration gagal:", error))
    .finally(() => {
      dataset.hydrating = false;
    });
}

async function hydrateRemaining(scope, session, dataset) {
  while (!dataset.hydrated && DATASET_CACHE.get(dataset.key) === dataset) {
    if ((getSession()?.sessionToken || "") !== (session.sessionToken || "")) {
      return;
    }

    const page = Math.floor(dataset.items.length / MANAGE_PC_FETCH_LIMIT) + 1;
    const result = await loadManagePcList("kaspersky", scope, {
      page,
      limit: MANAGE_PC_FETCH_LIMIT,
      view: "inventory",
      sessionToken: session.sessionToken
    });

    if (DATASET_CACHE.get(dataset.key) !== dataset) return;
    if ((getSession()?.sessionToken || "") !== (session.sessionToken || "")) {
      return;
    }
    if (!result.success) {
      console.warn("[manage-pc-cache] hydration berhenti:", result.message);
      return;
    }

    const data = result.data || {};
    const items = Array.isArray(data.items) ? data.items : [];
    if (Number.isFinite(Number(data.total))) dataset.total = Number(data.total);

    if (!items.length) {
      dataset.hydrated = dataset.total != null && dataset.items.length >= dataset.total;
      notify(dataset);
      return;
    }

    dataset.items = dataset.items.concat(items);
    dataset.hydrated = dataset.total != null && dataset.items.length >= dataset.total;
    if (dataset.total == null) dataset.hydrated = true;
    notify(dataset);
  }
}
