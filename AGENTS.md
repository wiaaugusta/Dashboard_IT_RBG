# AGENTS.md - Memori Proyek Dashboard IT RBG

## Struktur
- Frontend statis: `github-files/` (repo Git terpisah, branch `main`, remote `https://github.com/wiaaugusta/Dashboard_IT_RBG.git`).
- Backend Google Apps Script: `APPSCRIPT/` (gitignored, deploy via clasp).
- Frontend memakai HTML/CSS/ES modules vanilla + PWA offline. Tidak ada Node/build system/framework di runtime. Jangan migrasi framework atau menambah dependency tanpa diminta.
- Kontrak desain/arsitektur: `github-files/docs/PROJECT_CONSTITUTION.md`, `UI_AND_DESIGN.md`, `ARCHITECTURE.md`, `DATA_AND_API.md`.

## Aturan Kerja
- Jangan ubah autentikasi, backend, atau business logic tanpa permintaan eksplisit.
- Frontend harus tetap berjalan offline: jangan tambah CDN, icon font, atau request aset eksternal.
- Ikon terpusat di `github-files/js/icons.js` (path SVG Lucide lokal, `viewBox 24x24`, `stroke=currentColor`, default size 20/stroke 1.8). Pemetaan penting: `aho` = package, `nms` = network, Agent Kaspersky = `shield`, Server Kaspersky = `server`; fallback ke `dashboard`. Jangan pakai emoji sebagai ikon UI.
- Setiap perubahan aset/shell frontend: bump `CACHE_NAME` di `github-files/service-worker.js`.
- Setiap membuat tabel/data baru di frontend, WAJIB memakai cache client per sesi seperti tabel CCTV/Manage PC (`github-files/js/manage-pc-cache.js`): load sekali per sesi (owner `role|NIK`), dipakai ulang saat menu dibuka kembali, request ganda dideduplikasi, tanpa TTL terpisah (batas = logout/idle sesi/ganti user).
- Rahasia/kredensial tidak boleh masuk repo. `APPSCRIPT/`, `.clasp.json`, `.harness/` sudah di-gitignore.

## Deploy Backend (WAJIB)
- URL stabil yang dipakai frontend (`github-files/js/api.js`):
  `https://script.google.com/macros/s/AKfycbyld_jhumhTe3FY2Yta9csQDIsAYe5l_el0BO917FF7USX1Ssj_QQHFSG1gGejHuoRt/exec`
- Dari folder `APPSCRIPT/`: `clasp push`, lalu `clasp version "..."`, lalu:
  `clasp update-deployment AKfycbyld_jhumhTe3FY2Yta9csQDIsAYe5l_el0BO917FF7USX1Ssj_QQHFSG1gGejHuoRt -V <versi> -d "..."`
- Jangan membuat deployment baru dan jangan memakai `clasp deploy` (URL berubah). Frontend harus tetap memakai URL stabil di atas.
- Deploy backend terakhir: versi 44 (ITAM table columns O..X).

## Perintah & Lingkungan
- Shell: Windows PowerShell 5.1. Jangan pakai `&&` atau `head`; gunakan `;`, `Get-ChildItem`, `Select-Object`. Gunakan parameter `workdir`, bukan `cd`.
- Root repo tidak punya remote; push hanya dari `github-files/`.
- Test Manage PC (DOM/headless): `node .harness/build-managepc-test.mjs; node .harness/run-managepc-test.mjs`
- Test logika backend: `node .harness/test-managepc-backend.mjs`
- `.harness/` berisi server/CDP/screenshot sementara dan tidak di-commit.

## Catatan Manage PC
- Backend membaca maksimal 200 baris data Manage PC (`MANAGE_PC_LAST_ROW`), cache version 7.
- Info Kaspersky: Versi/Agent dari tab SOURCE kolom S/R (fallback MASTER REPORT OFFICE Z/AA), server default `kscoffice.sat.co.id`. Nama tab SOURCE diatur Script Property `MANAGE_PC_SOURCE_SHEET`.
- Kartu Kaspersky memakai 4 stat (termasuk persen gabungan KAV+Versi) dan blok info Versi/Agent/Server; footer lama sudah dihapus.
- Submenu Kaspersky (Office) memakai tabel utama `B203:K400` (No + 10 kolom B..K; status kolom K: normal hijau, NIK dobel kuning, user dobel/belum update merah, tidak ditemukan abu) lewat action `getManagePcKasperskyTable`; detail `B403:L415` tampil di kartu terpisah "Data Kaspersky Bermasalah" di atas tabel utama dengan 12 kolom: No + B..L (Version KES & Agent version ditampilkan). Status kolom tetap satu baris. Data di-cache client (owner role|NIK) seperti tabel Manage PC/CCTV; kolom No tanpa sort. Kedua tabel tanpa scrollbar horizontal; padding rapat, marquee 1x ke kiri saat hover; Last connected (x day) merah. Tabel utama: Model/OS 100px, Last 115px, STATUS 118px dan label panjang dibungkus. Kartu masalah: judul "Data Kaspersky Bermasalah" (kapital di setiap kata, font 15px), header lebih sempit berisi ikon merah + judul + badge count abu di samping judul (tanpa kurung); seluruh header bisa diklik, chevron hanya di kanan, animasi buka/tutup halus; default collapsed (hanya header). Sudut kartu konsisten membulat (overflow hidden), jarak atas kartu disamakan dengan panel lain (margin-top 0; kartu utama di bawahnya memakai gap 20px). Kartu Kaspersky Office: header/ikon+judul lebih rapat (padding 16px 18px 12px, gap 12px/8px). STATUS satu baris, Source lebar tetap 84px dan sticky di kanan agar tidak terpotong saat halaman menyempit, OS dipotong dulu bila meluber, lalu Last connected, lalu header Model jika masih meluber; JS fit dinamis meminimalkan pemotongan. Summary section memakai 3 kartu: Kaspersky, Versi Kaspersky, dan Summary Data Kaspersky (kartu info rekap status: Total Device tanpa status tidak ditemukan, Device Normal/NIK Dobel/User Dobel/tidak ditemukan dengan status dots ok/warn/danger/empty; counts dihitung client-side via `kasperskyStatusCounts()` dari cached table items; update via `updateKasperskyStatusSummary()` setelah cache load, `setKasperskyStatusSummaryUnavailable()` on error; `renderSummary()` accept session param untuk baca cache). Grid 3 kolom via `.gsp-cards--kaspersky-3` responsive auto-fit. service-worker cache v45..

## Memori Otomatis (opencode-mem)
- Plugin global `opencode-mem` terdaftar di `~/.config/opencode/opencode.json` (dan `tui.json`); konfigurasi di `~/.config/opencode/opencode-mem.jsonc`.
- `storagePath`: `E:/LLM/memory/opencode-mem/data`. Auto-capture: `opencodeProvider: "9router"`, `opencodeModel: "inherit"`.
- Log plugin: `~/.opencode-mem/opencode-mem.log`. Web UI default: `http://127.0.0.1:4747`.
- Auto-capture berjalan saat sesi idle; prompt trivial bisa sengaja di-skip AI (`type=skip`), jadi bukan berarti plugin mati.
- Jika plugin gagal load di Windows: pastikan cache `~/.cache/opencode/packages/opencode-mem@latest/node_modules` berisi binding native (`@tursodatabase/database-win32-x64-msvc`, `onnxruntime-node/bin/napi-v6/win32`). Perbaiki dengan hapus cache, jalankan `opencode plugin opencode-mem -g -f`, lalu restart opencode.
- Perubahan config/plugin tidak hot-reload; sesi berjalan harus di-restart.
- Submenu ITAM (Office) memakai blok O203:X400 (No + 10 kolom O..X: Nama Komputer, Alamat IP, Workgroup, OS Name, Group Administrator, Group User, Itam Version, Status Privilege, Last Inventory, Status; cache backend `managepc-itamtable-v2-office`), detail bermasalah O403:Y420. Tabel ITAM sejajar Kaspersky: `bindEndpointTable()` generik (search/sort/pagination/marquee/fit problem) dengan config per modul (ITAM_FIT_PLAN: osName → lastInventory → groupAdministrator); renderer `renderItamRows`/`renderItamDetailRows`; badge count "Data ITAM Bermasalah" teal (CSS `[data-itam-problem-card]`).

## Status Terakhir
- Ikon Lucide lokal: 83 ikon, opsi `size`/`strokeWidth`/`color`/`label`, fallback `dashboard`; semua 36 nama ikon yang dipakai tersedia dan galeri 83/83 render.
- Frontend commit terakhir: `chore: bump cache v51` (service-worker CACHE_NAME v51), sudah di-push ke `origin/main`.
- opencode-mem 2.34.0: cache native Windows diperbaiki, model embedding `Xenova/nomic-embed-text-v1` sudah ter-warmup, auto-capture aktif memakai `9router/inherit`.
