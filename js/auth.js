/**
 * AUTH.JS - SESSION & LOGIN
 */

import { apiRequest } from "./api.js";

const SESSION_KEY = "it_platform_session";

/* Batas idle sesi di sisi client: 5 jam 30 menit - sengaja DI BAWAH TTL
   backend (6 jam, CacheService) supaya client selalu keburu tahu sesinya
   mati SEBELUM server menolak. Setiap request ber-token yang sukses
   memperbarui lastActiveAt (touchSession) -> user yang aktif tidak pernah
   ditendang; hanya idle > 5,5 jam yang diminta login ulang. */
const CLIENT_SESSION_MAX_IDLE_MS = 19800000;


export function getSession() {

  try {

    const raw =
      sessionStorage.getItem(SESSION_KEY);

    if (!raw) return null;

    const session =
      JSON.parse(raw);

    const lastActiveAt =
      session.lastActiveAt || session.loginAt || 0;

    /* Sesi client sudah melewati batas idle -> anggap mati (backend pasti
       juga sudah menghapusnya, CacheService bisa evict lebih cepat dari
       TTL). Dihapus di sini supaya reload langsung mendarat di halaman
       login, bukan terjebak di dashboard dengan token yang sudah ditolak
       server (penyebab "login gagal, reload pun tetap gagal"). */
    if (Date.now() - lastActiveAt > CLIENT_SESSION_MAX_IDLE_MS) {

      sessionStorage.removeItem(SESSION_KEY);

      return null;

    }

    return session;

  } catch (error) {

    console.error(
      "[auth.js] Gagal membaca session:",
      error
    );

    return null;

  }

}


/**
 * Perbarui penanda aktivitas sesi (dipanggil lewat event
 * "itplatform:session-activity" dari api.js pada setiap request
 * ber-token yang sukses). User aktif tidak pernah di-logout.
 */
export function touchSession() {

  const session =
    getSession();

  if (!session) return;

  session.lastActiveAt =
    Date.now();

  try {

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify(session)
    );

  } catch (error) {

    console.warn(
      "[auth.js] Gagal memperbarui penanda aktivitas sesi:",
      error
    );

  }

}


export function setSession(sessionData) {

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(sessionData)
  );

}


export function clearSession() {

  sessionStorage.removeItem(
    SESSION_KEY
  );

}


export function isAuthenticated() {

  return getSession() !== null;

}


export function getRole() {

  const session =
    getSession();

  return session
    ? session.role
    : null;

}


/* =========================================================
   LOGIN
   ========================================================= */

export async function login(
  nik,
  password
) {

  const result =
    await apiRequest(
      "login",
      {
        nik,
        password
      }
    );


  // LOGIN GAGAL
  if (
    !result ||
    !result.success
  ) {

    return {

      success: false,

      message:
        result?.message ||
        "Login gagal. Periksa NIK dan password."

    };

  }


  // Backend menyatakan berhasil,
  // tetapi tidak mengirim data.
  if (!result.data) {

    console.error(
      "[auth.js] Login berhasil tetapi data session kosong.",
      result
    );

    return {

      success: false,

      message:
        "Data session dari server tidak lengkap."

    };

  }


  const sessionData = {

    nik:
      result.data.nik ||
      nik,

    name:
      result.data.name ||
      result.data.nama ||
      "",

    role:
      result.data.role ||
      "",

    sessionToken:
      result.data.sessionToken ||
      "",

    loginAt:
      Date.now(),

    lastActiveAt:
      Date.now()

  };


  // Validasi minimum session
  if (
    !sessionData.role ||
    !sessionData.sessionToken
  ) {

    console.error(
      "[auth.js] Session dari backend tidak lengkap:",
      sessionData
    );

    return {

      success: false,

      message:
        "Session login tidak lengkap. Hubungi administrator."

    };

  }


  setSession(
    sessionData
  );


  return {

    success: true,

    message:
      result.message ||
      "Login berhasil."

  };

}


/* =========================================================
   LOGOUT
   ========================================================= */

export async function logout() {

  const session =
    getSession();

  clearSession();


  if (session) {

    try {

      await apiRequest(
        "logout",
        {
          sessionToken:
            session.sessionToken
        }
      );

    } catch (error) {

      console.error(
        "[auth.js] Logout backend gagal:",
        error
      );

    }

  }


}