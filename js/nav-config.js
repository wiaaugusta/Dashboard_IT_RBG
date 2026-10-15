/**
 * NAV-CONFIG.JS
 * -------------------------------------------------------
 * Sumber tunggal struktur navigasi.
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
 *
 * IT_STORE:
 * - Tidak melihat menu Manage PC (Kaspersky/ITAM/KACE)
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
    key: "aho",
    label: "AHO",
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
       (lihat js/pages/manage-pc.js) supaya sidebar tetap ringkas. */
    key: "manage-pc",
    label: "Manage PC",
    icon: "pc",
    roles: ["ADMIN"],
    children: [
      {
        key: "manage-pc-kaspersky",
        label: "Kaspersky",
        path: "/manage-pc/kaspersky",
        icon: "kaspersky",
        roles: ["ADMIN"]
      },
      {
        key: "manage-pc-itam",
        label: "ITAM",
        path: "/manage-pc/itam",
        icon: "itam",
        roles: ["ADMIN"]
      },
      {
        key: "manage-pc-kace",
        label: "KACE",
        path: "/manage-pc/kace",
        icon: "kace",
        roles: ["ADMIN"]
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
    key: "checklist",
    label: "Checklist",
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
    path: "/checklist/store",
    icon: "checklist",
    roles: null,
    /* Bottom nav mobile: role menentukan halaman checklist-nya
       (IT_OFFICE -> office, lainnya -> store) tanpa submenu. */
    pathByRole: {
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