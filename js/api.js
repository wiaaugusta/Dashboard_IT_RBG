/**
 * API.JS - SHARED API CLIENT
 * -----------------------------
 * Satu-satunya tempat frontend melakukan komunikasi dengan backend
 * (Google Apps Script). Modul lain (auth.js, modules/cctv.js, dst)
 * WAJIB memakai fungsi di file ini, bukan membuat fetch sendiri.
 * Sumber prinsip: docs/DATA_AND_API.md #31, docs/ARCHITECTURE.md #27.
 *
 * PHASE 1 STATUS:
 * URL Apps Script belum di-deploy -> APPS_SCRIPT_URL masih placeholder.
 * Fungsi request() sudah siap dipakai saat Authentication / CCTV API
 * dikerjakan pada phase berikutnya. Tidak ada action nyata yang
 * dipanggil pada phase ini.
 */

// TODO (Phase Authentication/CCTV): ganti dengan URL deployment Apps Script.
// JANGAN pernah menaruh credential/API key di sini - hanya URL endpoint publik.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyld_jhumhTe3FY2Yta9csQDIsAYe5l_el0BO917FF7USX1Ssj_QQHFSG1gGejHuoRt/exec";

/**
 * Browser modern bisa decompress gzip natively (tanpa library/CDN).
 * Client lama yang tidak punya API ini tidak akan mengirim flag gz:true,
 * sehingga backend tetap mengirim JSON polos (backward compatible).
 */
const GZIP_SUPPORTED = typeof window !== "undefined" && typeof window.DecompressionStream === "function";

/** Decode data { gz:true, b64 } dari backend -> object asli. */
async function decodeGzipBase64(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const text = await new Response(stream).text();
  return JSON.parse(text);
}

/* =========================================================
   RESILIENSI JARINGAN (cold start Apps Script + mobile)
   ========================================================= */
/* Request PERTAMA setelah lama idle menunggu "cold start" Apps Script
   (3-15 detik) dan di jaringan mobile koneksi bisa putus sesaat ->
   timeout per percobaan + 2x percobaan ulang otomatis dengan jeda. */
const REQUEST_TIMEOUT_MS = 30000;
const RETRY_DELAYS_MS = [800, 2000];

async function fetchOnce(bodyJson) {
  if (typeof AbortController === "function") {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8" // Apps Script web app menghindari CORS preflight
        },
        body: bodyJson,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }
  }

  // Browser tanpa AbortController: tanpa timeout, tanpa retry tambahan.
  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: bodyJson
  });
}

async function fetchWithRetry(body) {
  const bodyJson = JSON.stringify(body);
  let lastError = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAYS_MS[attempt - 1];
      console.warn(`[api.js] request gagal, coba ulang dalam ${delay}ms (percobaan ${attempt + 1})...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    try {
      return await fetchOnce(bodyJson);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

/**
 * Kirim request ke backend Apps Script.
 * Mengikuti kontrak request/response di docs/DATA_AND_API.md #25-#27:
 *   request : { action, ...payload }
 *   response: { success, message, data }
 *
 * OPTIMASI: request menyertakan gz:true (opt-in). Untuk payload besar
 * (mis. admin memuat 648 toko CCTV) backend mengirim data sebagai
 * base64+gzip (~85% lebih kecil) dan didecode di sini secara transparan.
 *
 * @param {string} action - nama action backend, contoh: "login", "getCCTV"
 * @param {object} payload - data tambahan yang dikirim bersama action
 * @param {object} [options]
 * @param {string} [options.sessionToken] - token session jika user sudah login
 * @returns {Promise<{success: boolean, message: string, data: any}>}
 */
export async function apiRequest(action, payload = {}, options = {}) {
  if (!action) {
    throw new Error("apiRequest: 'action' wajib diisi.");
  }

  const body = {
    action,
    ...payload
  };

  if (GZIP_SUPPORTED && !options.disableGzip) {
    body.gz = true;
  }

  if (options.sessionToken) {
    body.sessionToken = options.sessionToken;
  }

  try {
    const response = await fetchWithRetry(body);

    if (!response.ok) {
      return {
        success: false,
        message: "Gagal menghubungi server. Silakan coba kembali.",
        data: null
      };
    }

    const json = await response.json();

    // Payload terkompresi dari backend: { gz: true, b64: "<base64 gzip>" }.
    let data = json.data ?? null;
    if (data && data.gz === true && typeof data.b64 === "string") {
      try {
        data = await decodeGzipBase64(data.b64);
      } catch (decodeError) {
        // SELF-HEALING: kalau decode gzip gagal (mis. mismatch versi deploy),
        // ulangi request SEKALI tanpa gzip supaya data tetap ter-load.
        if (!options.disableGzip) {
          console.warn("[api.js] Decode gzip gagal, mencoba ulang tanpa gzip...", decodeError);
          return apiRequest(action, payload, { ...options, disableGzip: true });
        }
        console.error("[api.js] Gagal decode data gzip:", decodeError);
        return {
          success: false,
          message: "Gagal memproses data dari server. Silakan coba kembali.",
          data: null
        };
      }
    }

    // Jaga-jaga apabila backend tidak mengikuti kontrak response.
    return {
      success: Boolean(json.success),
      message: json.message || "",
      data: data ?? null
    };
  } catch (error) {
    // Jangan bocorkan detail teknis ke UI (docs/PROJECT_CONSTITUTION.md #21).
    console.error("[api.js] Request gagal:", error);
    return {
      success: false,
      message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      data: null
    };
  }
}
