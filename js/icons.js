/**
 * ICONS.JS - SATU SUMBER IKON (line-style, konsisten, tanpa emoji)
 * ---------------------------------------------------------------
 * Sesuai docs/UI_AND_DESIGN.md #23 - "satu style icon konsisten,
 * jangan campur banyak icon library, jangan pakai emoji sebagai icon
 * utama UI". Semua path digambar manual (viewBox 24x24, stroke
 * currentColor) supaya TIDAK butuh CDN/font eksternal - aman untuk
 * PWA offline & tidak menambah dependency (docs/PROJECT_CONSTITUTION.md #33).
 *
 * Dipakai oleh: shell.js (sidebar + bottom nav), modules/cctv.js
 * (tombol edit), pages/login.js (badge).
 */

const PATHS = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  cctv: '<path d="M3 8a2 2 0 0 1 2-2h3l1.5-2h5L16 6h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.2"/>',
  kpi: '<line x1="4" y1="20" x2="4" y2="11"/><line x1="10" y1="20" x2="10" y2="4"/><line x1="16" y1="20" x2="16" y2="14"/>',
  aho: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/>',
  kaspersky: '<path d="M12 2l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V5l7-3z"/>',
  nms: '<path d="M2 12h4l2-7 4 14 2-7h8"/>',
  itam: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.5 8.5L12 13l8.5-4.5"/><line x1="12" y1="13" x2="12" y2="22"/>',
  checklist: '<rect x="3" y="3" width="18" height="18" rx="3"/><polyline points="8 12 11 15 16 9"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
  chevron: '<polyline points="6 9 12 15 18 9"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  user: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3.2 19.5c0-3.1 2.6-5.3 5.8-5.3s5.8 2.2 5.8 5.3"/><circle cx="17.5" cy="9" r="2.3"/><path d="M15.3 19.5c.2-2.1 1.7-3.8 3.7-4.3"/>',
  "arrow-right": '<line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>',
  check: '<polyline points="5 13 10 18 19 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  "eye-off": '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><line x1="4" y1="20" x2="20" y2="4"/>'
};

/**
 * @param {string} name - salah satu key di PATHS
 * @param {{size?: number, className?: string}} [options]
 * @returns {string} markup <svg> siap disisipkan lewat innerHTML
 */
export function icon(name, options = {}) {
  const size = options.size || 20;
  const className = options.className || "";
  const body = PATHS[name] || PATHS.dashboard;

  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
