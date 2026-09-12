/**
 * NAV-CONFIG.JS
 * -------------------------------------------------------
 * Sumber tunggal struktur navigasi.
 *
 * ADMIN:
 * - Melihat seluruh menu
 * - Kaspersky Office/Store
 * - ITAM Office/Store
 * - Checklist Office/Store (submenu)
 *
 * IT_STORE / IT_OFFICE:
 * - Checklist TANPA submenu - login sudah menentukan halamannya
 *   (pathByRole), klik menu langsung membuka checklist yang sesuai.
 *
 * IT_STORE:
 * - Tidak melihat menu Office/Store Kaspersky & ITAM
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
    key: "kaspersky",
    label: "Kaspersky",
    icon: "kaspersky",
    roles: null,
    children: [
      {
        key: "kaspersky-office",
        label: "Office",
        path: "/kaspersky/office",
        roles: ["ADMIN"]
      },
      {
        key: "kaspersky-store",
        label: "Store",
        path: "/kaspersky/store",
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
    key: "itam",
    label: "ITAM",
    icon: "itam",
    roles: null,
    children: [
      {
        key: "itam-office",
        label: "Office",
        path: "/itam/office",
        roles: ["ADMIN"]
      },
      {
        key: "itam-store",
        label: "Store",
        path: "/itam/store",
        roles: ["ADMIN"]
      }
    ]
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
        parentLabel: null
      });
    }

    if (item.children) {

      item.children.forEach((child) => {

        flat.push({
          key: child.key,
          label: child.label,
          path: child.path,
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