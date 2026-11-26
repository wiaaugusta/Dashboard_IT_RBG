/**
 * Client cache for SLA AHO Store, scoped to the logged-in role and NIK.
 */

import { loadSlaAhoStore } from "./api.js";

const TABLE_CACHE = new Map();
const TABLE_REQUESTS = new Map();

function ownerKey(session) {
  return `${session?.role || ""}|${session?.nik || ""}`;
}

export function getAhoSlaStoreCache(session) {
  return TABLE_CACHE.get(ownerKey(session)) || null;
}

export async function loadAhoSlaStoreCached(session, options = {}) {
  const key = ownerKey(session);

  if (!options.forceRefresh && TABLE_CACHE.has(key)) {
    return { success: true, data: TABLE_CACHE.get(key) };
  }

  if (!options.forceRefresh && TABLE_REQUESTS.has(key)) {
    return TABLE_REQUESTS.get(key);
  }

  const request = loadSlaAhoStore({
    sessionToken: session.sessionToken,
    refresh: options.forceRefresh ? true : undefined
  })
    .then((result) => {
      if (TABLE_REQUESTS.get(key) === request) TABLE_REQUESTS.delete(key);
      if (result?.success && result.data) TABLE_CACHE.set(key, result.data);
      return result;
    })
    .catch((error) => {
      if (TABLE_REQUESTS.get(key) === request) TABLE_REQUESTS.delete(key);
      throw error;
    });

  TABLE_REQUESTS.set(key, request);
  return request;
}
