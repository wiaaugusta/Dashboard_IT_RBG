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
   retry otomatis dengan timeout BERTINGKAT: percobaan awal cepat
   (socket mati/stale biasanya hang < 12 detik), percobaan terakhir
   paling panjang untuk menunggu cold start server. Total worst case
   +-65 detik (sebelumnya 3x30 detik = 92 detik). */
const REQUEST_TIMEOUT_SCHEDULE_MS = [12000, 20000, 30000];
const RETRY_DELAYS_MS = [800, 2000];

function buildRequestUrl() {
  /* Cache-buster: pastikan URL /exec (dan rantai redirect-nya) tidak
     tersangkut di cache perantara saat page sudah lama terbuka. */
  return APPS_SCRIPT_URL + (APPS_SCRIPT_URL.indexOf("?") === -1 ? "?" : "&") + "cb=" + Date.now();
}

async function fetchOnce(bodyJson, timeoutMs) {
  if (typeof AbortController === "function") {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(buildRequestUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8" // Apps Script web app menghindari CORS preflight
        },
        body: bodyJson,
        signal: controller.signal
      });

      /* Google kadang membalas halaman HTML (error/throttle) dengan status
         200. Kalau dibiarkan, response.json() meledak dan dilaporkan
         "tidak terhubung ke server" padahal jaringan baik - deteksi di
         sini supaya kasus ini masuk loop retry, bukan langsung gagal. */
      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      if (!response.ok || contentType.indexOf("application/json") === -1) {
        throw new Error(`RESPONSE_INVALID status=${response.status} type=${contentType || "unknown"}`);
      }

      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  // Browser tanpa AbortController: tanpa timeout, tanpa retry tambahan.
  return fetch(buildRequestUrl(), {
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

  for (let attempt = 0; attempt < REQUEST_TIMEOUT_SCHEDULE_MS.length; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)];
      console.warn(`[api.js] request gagal, coba ulang dalam ${delay}ms (percobaan ${attempt + 1})...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    try {
      return await fetchOnce(bodyJson, REQUEST_TIMEOUT_SCHEDULE_MS[attempt]);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

/* =========================================================
   SIKLUS HIDUP SESI (client-side)
   ========================================================= */
/* Sesi backend tersimpan di CacheService dengan TTL maks 6 jam (dan bisa
   ter-evict lebih cepat). Tanpa sinkronisasi, session di sessionStorage
   client "hidup selamanya" -> user TERJEBAK: reload tetap membawa token
   mati (sessionStorage bertahan antar reload), halaman login me-redirect
   balik ke dashboard, semua API gagal, dan hanya close tab yang
   menyelamatkan. Dua event di bawah dipakai app.js:
   - itplatform:session-activity : request ber-token sukses -> perpanjang
     umur sesi client (backend melakukan hal yang sama via sliding renewal).
   - itplatform:session-invalid  : backend menjawab "Sesi tidak valid" ->
     auto logout dan kembali ke halaman login tanpa harus close tab. */
const SESSION_INVALID_PATTERN = /sesi tidak valid/i;

function emitSessionEvents(options, result) {
  if (typeof window === "undefined" || !options.sessionToken) return;

  if (result.success) {
    window.dispatchEvent(new CustomEvent("itplatform:session-activity"));
    return;
  }

  if (SESSION_INVALID_PATTERN.test(result.message)) {
    window.dispatchEvent(new CustomEvent("itplatform:session-invalid"));
  }
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
    const result = {
      success: Boolean(json.success),
      message: json.message || "",
      data: data ?? null
    };

    emitSessionEvents(options, result);
    return result;
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
