/**
 * NAV-CONFIG.JS
 * -------------------------------------------------------
 * Sumber tunggal struktur navigasi.
 *
 * MENU UTAMA BERSUBMENU (AHO / Manage PC / Checklist):
 * - Menu utama juga punya HALAMAN SENDIRI (item.path) berisi RANGKUMAN
 *   data submenu-nya (lihat js/pages/group-summary.js). Di sidebar,
 *   label/icon parent menjadi link ke halaman itu, sedangkan chevron
 *   tetap berfungsi membuka/menutup submenu (parent link / clickable
 *   dropdown).
 *
 * ADMIN:
 * - Melihat seluruh menu.
 * - Manage PC: submenu Kaspersky / ITAM / KACE. Scope Office/Store TIDAK
 *   lagi menjadi submenu sidebar - perbedaannya menjadi TAB di dalam
 *   halaman (pola dashboard modern, lihat js/pages/manage-pc.js)
 *   supaya sidebar tetap ringkas.
 * - Checklist Office/Store masih memakai submenu.
 *
 * IT_STORE / IT_OFFICE:
 * - Checklist TANPA submenu - login sudah menentukan halamannya
 *   (pathByRole), klik menu langsung membuka checklist yang sesuai.
 * - Menu Manage PC TIDAK dihilangkan, tetapi TANPA pembagian
 *   Office/Store karena login sudah sesuai jabatan: halaman langsung
 *   memakai lingkup miliknya (IT Store -> Store, IT Office -> Office,
 *   tanpa pemilihan scope).
 *
 * IT_STORE:
 * - Tetap melihat CCTV
 *
 * IT_OFFICE:
 * - Tidak melihat CCTV
 */

export const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: "dashboard",
    roles: null
  },

  {
    key: "kpi",
    label: "KPI",
    path: "/kpi",
    icon: "kpi",
    roles: null
  },

  {
    /* Menu utama punya halaman sendiri (/aho) - rangkuman dari submenu
       SLA AHO Store & SLA Form Hardware (js/pages/group-summary.js). */
    key: "aho",
    label: "AHO",
    path: "/aho",
    icon: "aho",
    roles: null,
    children: [
      {
        key: "aho-sla-store",
        label: "SLA AHO Store",
        path: "/aho/sla-aho-store",
        roles: null
      },
      {
        key: "aho-sla-hardware",
        label: "SLA Form Hardware",
        path: "/aho/sla-form-hardware",
        roles: null
      }
    ]
  },

  {
    /* Manage PC menggantikan menu Kaspersky + ITAM yang sebelumnya
       berdiri sendiri; KACE juga bergabung ke sini. Scope Office/Store
       yang dulu menjadi submenu kini menjadi TAB di dalam halaman
       (lihat js/pages/manage-pc.js) supaya sidebar tetap ringkas.
       Menu TIDAK dihilangkan untuk login Office/Store - mereka juga
       bisa membukanya TANPA pembagian Office/Store karena login sudah
       sesuai jabatan (halaman langsung memakai lingkup miliknya,
       tanpa pemilihan scope). */
    key: "manage-pc",
    label: "Manage PC",
    path: "/manage-pc",
    icon: "pc",
    roles: ["ADMIN", "IT_OFFICE", "IT_STORE"],
    children: [
      {
        key: "manage-pc-kaspersky",
        label: "Kaspersky",
        path: "/manage-pc/kaspersky",
        icon: "kaspersky",
        roles: ["ADMIN", "IT_OFFICE", "IT_STORE"]
      },
      {
        key: "manage-pc-itam",
        label: "ITAM",
        path: "/manage-pc/itam",
        icon: "itam",
        roles: ["ADMIN", "IT_OFFICE", "IT_STORE"]
      },
      {
        key: "manage-pc-kace",
        label: "KACE",
        path: "/manage-pc/kace",
        icon: "kace",
        roles: ["ADMIN", "IT_OFFICE", "IT_STORE"]
      }
    ]
  },

  {
    key: "nms",
    label: "NMS",
    path: "/nms",
    icon: "nms",
    roles: null
  },

  {
    key: "cctv",
    label: "CCTV",
    path: "/cctv",
    icon: "cctv",
    roles: ["ADMIN", "IT_STORE"]
  },

  {
    /* Menu utama punya halaman sendiri (/checklist) - rangkuman submenu
       Office & Store (js/pages/group-summary.js); halaman parent ini
       khusus ADMIN karena submenu Office/Store hanya untuk admin. */
    key: "checklist",
    label: "Checklist",
    path: "/checklist",
    icon: "checklist",
    roles: null,
    /* Submenu Office/Store HANYA untuk ADMIN (login admin bisa melihat
       semuanya). Role IT_STORE / IT_OFFICE tidak perlu memilih - login
       sudah menentukan halaman checklist masing-masing, jadi menu
       Checklist langsung navigasi (tanpa submenu) lewat pathByRole. */
    pathByRole: {
      IT_STORE: "/checklist/store",
      IT_OFFICE: "/checklist/office"
    },
    children: [
      {
        key: "checklist-office",
        label: "Office",
        path: "/checklist/office",
        roles: ["ADMIN"]
      },
      {
        key: "checklist-store",
        label: "Store",
        path: "/checklist/store",
        roles: ["ADMIN"]
      }
    ]
  }
];


/* =========================================================
   MOBILE BOTTOM NAV
   ========================================================= */

export const BOTTOM_NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Home",
    path: "/dashboard",
    icon: "home",
    roles: null
  },

  {
    key: "cctv",
    label: "CCTV",
    path: "/cctv",
    icon: "cctv",
    roles: ["ADMIN", "IT_STORE"]
  },

  {
    key: "checklist",
    label: "Checklist",
    path: "/checklist",
    icon: "checklist",
    roles: null,
    /* Bottom nav mobile: ADMIN -> halaman parent (/checklist, rangkuman
       submenu). Role menentukan halaman checklist-nya (IT_STORE ->
       store, IT_OFFICE -> office) tanpa pembagian Office/Store. */
    pathByRole: {
      IT_STORE: "/checklist/store",
      IT_OFFICE: "/checklist/office"
    }
  },

  {
    key: "more",
    label: "Logout",
    action: "logout",
    icon: "logout",
    roles: null
  }
];


/* =========================================================
   ROLE HELPER
   ========================================================= */

export function isVisibleForRole(item, role) {
  if (!item.roles) return true;

  return item.roles.includes(role);
}


/**
 * Path fallback untuk item GRUP (punya children) ketika role yang login
 * TIDAK boleh melihat child manapun (mis. Checklist Office/Store hanya
 * untuk ADMIN). Item dengan mapping pathByRole akan langsung membuka
 * halaman sesuai role - tanpa submenu.
 * @returns {string|null} path, atau null kalau tidak ada fallback.
 */
export function resolveGroupFallbackPath(item, role) {
  if (item.pathByRole && item.pathByRole[role]) {
    return item.pathByRole[role];
  }
  return null;
}


/* =========================================================
   ROUTES
   ========================================================= */

export function getFlatRoutes() {
  const flat = [];

  NAV_ITEMS.forEach((item) => {

    if (item.path) {
      flat.push({
        key: item.key,
        label: item.label,
        path: item.path,
        parentKey: null,
        parentLabel: null
      });
    }

    if (item.children) {

      item.children.forEach((child) => {

        flat.push({
          key: child.key,
          label: child.label,
          path: child.path,
          parentKey: item.key,
          parentLabel: item.label
        });

      });

    }

  });

  return flat;
}


/* =========================================================
   FIND PARENT
   ========================================================= */

export function findParentKey(leafKey) {

  for (const item of NAV_ITEMS) {

    if (
      item.children &&
      item.children.some(
        (child) => child.key === leafKey
      )
    ) {
      return item.key;
    }

  }

  return null;
}