# AGENTS.md — Gateway Utama Agent Dashboard IT RBG

> **Dokumen ini adalah pintu masuk dan aturan kerja utama untuk semua agent AI yang bekerja pada proyek ini.**
> Baca dokumen ini sebelum melakukan perubahan. Jika file Markdown lain belum diperbarui, saling bertentangan, atau berisi aturan lama yang terlalu membatasi, gunakan prinsip dan hierarki pada dokumen ini sebagai acuan untuk mengevaluasinya.

## 1. Peran AGENTS.md dan hierarki dokumentasi

AGENTS.md adalah gateway utama, ringkasan konteks proyek, dan pengarah cara kerja agent. Dokumen ini tidak harus menyalin seluruh detail teknis dari file lain; ia menentukan cara agent membaca, memeriksa, dan menyelesaikan konflik antar-dokumen.

Urutan prioritas ketika menemukan instruksi yang bertentangan:

1. Keamanan, privasi, integritas data, dan batasan platform yang nyata.
2. Instruksi eksplisit terbaru dari pemilik proyek.
3. AGENTS.md versi terbaru.
4. Keputusan dan kebutuhan proyek yang telah dikonfirmasi.
5. Dokumentasi khusus seperti `PROJECT_CONSTITUTION.md`, `UI_AND_DESIGN.md`, `ARCHITECTURE.md`, `DATA_AND_API.md`, serta catatan modul.
6. Implementasi lama dan keputusan historis yang belum diverifikasi.

Jangan mengikuti aturan di file lain secara membuta. Periksa apakah aturan tersebut masih berlaku, apakah sesuai dengan instruksi terbaru, dan apakah membatasi tujuan proyek tanpa alasan yang kuat.

Jika menemukan konflik:
- Jangan diam-diam memilih aturan lama.
- Jelaskan konflik dan dampaknya.
- Ikuti instruksi terbaru yang jelas.
- Jika keputusan menyentuh kebutuhan bisnis, keamanan, data, deployment, atau perubahan besar, minta konfirmasi sebelum bertindak.
- Setelah keputusan dikonfirmasi, selaraskan dokumen terkait agar konflik tidak berulang.

## 2. Arah dan prinsip pengembangan proyek

Dashboard IT RBG adalah produk yang terus berkembang. Desain, struktur, fitur, teknologi, dan pengalaman pengguna tidak dianggap final hanya karena sudah pernah dibuat atau didokumentasikan.

Agent diharapkan:
- Bersikap proaktif, kritis, dan solutif; bukan hanya menunggu instruksi teknis yang sangat rinci.
- Memahami tujuan pengguna dan masalah yang ingin diselesaikan sebelum mengubah kode.
- Mengevaluasi apakah implementasi sekarang masih merupakan solusi terbaik.
- Menawarkan ide, fitur, penyederhanaan, perbaikan UX, peningkatan performa, atau pendekatan teknis yang lebih baik bila memang bermanfaat.
- Menjelaskan alasan, manfaat, risiko, dan trade-off dengan bahasa yang mudah dipahami.
- Tidak mempertahankan keputusan lama hanya karena tercantum di file `.md`.
- Tidak mengubah kebutuhan pengguna berdasarkan asumsi pribadi.

**Desain yang ada adalah baseline, bukan batas kreativitas.** Jika desain dashboard masih terlihat generik, kurang matang, atau terasa seperti AI-generated template, agent harus berani mengidentifikasi masalah dan merekomendasikan arah yang lebih profesional. Tidak ada larangan mutlak terhadap warna, layout, komponen, icon, chart, animasi, maupun gaya visual. Pilih solusi terbaik berdasarkan konteks pengguna, data, usability, aksesibilitas, dan karakter produk.

## 3. Aturan persetujuan: mandiri untuk detail, konfirmasi untuk perubahan besar

Agent boleh langsung melakukan pekerjaan yang jelas berada dalam ruang lingkup permintaan, termasuk:
- Perbaikan bug dan perbaikan visual yang terlokalisasi.
- Penyempurnaan spacing, typography, hierarchy, alignment, responsive behavior, dan accessibility.
- Refactor kecil yang risikonya rendah.
- Perbaikan loading, empty, error, dan success state.
- Penyesuaian komponen agar lebih konsisten atau lebih mudah digunakan.

Agent harus terlebih dahulu menyampaikan usulan dan meminta persetujuan sebelum melakukan perubahan besar, terutama:
- Redesign menyeluruh atau perubahan identitas visual utama.
- Penambahan, penghapusan, atau perubahan besar pada fitur dan alur kerja pengguna.
- Perubahan business logic, role, permission, authentication, authorization, atau security boundary.
- Perubahan database, struktur data, API contract, integrasi, atau arsitektur utama.
- Migrasi framework/teknologi atau penambahan dependency/layanan eksternal yang berdampak besar.
- Perubahan proses deployment, URL production, atau tindakan yang dapat memengaruhi pengguna/data production.
- Penghapusan data, perubahan massal, atau tindakan yang sulit dibatalkan.

Ketika meminta persetujuan, berikan rekomendasi yang konkret: masalah saat ini, opsi yang disarankan, manfaat, risiko, ruang lingkup, dan apa yang tidak akan diubah. Jangan hanya bertanya secara umum.

Jika pengguna sudah menyetujui arah atau ruang lingkup perubahan, agent boleh mengambil keputusan implementasi detail di dalam ruang lingkup tersebut tanpa meminta persetujuan berulang-ulang.

## 4. UI/UX: skill dan MCP wajib dimanfaatkan bila relevan

Untuk pekerjaan UI/UX, evaluasi desain, redesign, pembuatan komponen visual, dashboard, atau responsive improvement:

### UI UX Pro Max
- Temukan dan muat skill `ui-ux-pro-max` sebelum merancang atau mengimplementasikan perubahan UI/UX yang substansial.
- Gunakan sub-skill yang relevan, misalnya `design`, `design-system`, `ui-styling`, `brand`, `banner-design`, atau `slides`.
- Manfaatkan rekomendasi, data, pattern, dan guideline skill dalam keputusan desain; jangan sekadar menyebut nama skill.
- Jangan memaksakan seluruh sub-skill pada tugas yang tidak membutuhkannya.

### FigCraft MCP
- Gunakan FigCraft MCP untuk eksplorasi visual, prototype, alternatif layout, komponen, atau pemeriksaan desain jika hal tersebut memberi nilai tambah dan MCP tersedia.
- Periksa tool yang benar-benar tersedia. Jangan mengarang nama tool atau mengklaim penggunaan yang tidak terjadi.
- Prototype FigCraft bukan pengganti implementasi aplikasi; terjemahkan desain ke stack proyek dan validasi hasil aktual.

### Jika skill/MCP tidak tersedia
Jangan mengklaim sudah menggunakannya. Lanjutkan dengan sumber yang tersedia bila memungkinkan dan beri tahu pengguna jika keterbatasan tersebut berpengaruh pada hasil. Jangan mengubah instalasi global atau konfigurasi MCP tanpa kebutuhan dan izin.

Untuk aturan desain terperinci, baca `UI_AND_DESIGN.md`. Jika aturan visual lama di file tersebut bertentangan dengan kebebasan desain dan arahan terbaru pada AGENTS.md, jangan perlakukan aturan visual lama sebagai larangan mutlak; evaluasi dan usulkan pembaruannya.

## 5. Dokumentasi adalah sumber pengetahuan hidup

File `.md` bukan aturan yang tidak boleh berubah. Agent boleh dan diharapkan menjaga dokumentasi tetap sesuai dengan kebutuhan dan implementasi terbaru.

Ketika pengguna mengubah atau mengonfirmasi:
- Preferensi atau arah desain.
- Kebutuhan fitur atau alur kerja.
- Aturan bisnis, role, atau perilaku sistem.
- Struktur teknis atau arsitektur.
- Standar komponen, pola UX, atau keputusan implementasi.

...agent harus mengidentifikasi file dokumentasi yang terdampak dan memperbaruinya sebagai bagian dari pekerjaan, selama perubahan tersebut berada dalam ruang lingkup yang disetujui.

Aturan pembaruan:
1. Pertahankan catatan dan data proyek yang masih berguna; jangan menghapus informasi historis secara sembarangan.
2. Bedakan fakta implementasi, keputusan yang sudah disetujui, rekomendasi, dan ide yang belum disetujui.
3. Jangan mencatat fitur sebagai sudah selesai jika belum diimplementasikan dan diverifikasi.
4. Jika aturan lama sudah tidak berlaku, revisi atau tandai sebagai deprecated; jangan biarkan aturan usang terus membatasi agent.
5. Hindari duplikasi, kontradiksi, dan penambahan aturan yang tidak diperlukan.
6. Jika perubahan menyentuh beberapa dokumen, perbarui dokumen yang relevan dan pastikan AGENTS.md tetap menjadi gateway yang benar.
7. Jika perubahan dokumentasi mengubah perilaku agent di masa depan, rangkum apa yang diubah kepada pengguna.
8. Jika preferensi/requirement masih ambigu atau berdampak besar, tanyakan sebelum menjadikannya aturan permanen.

**Catatan update data/proyek tetap dipertahankan.** Catatan teknis yang rinci di bagian bawah dokumen ini merupakan memori kerja dan snapshot kondisi yang pernah tercatat. Gunakan sebagai petunjuk, bukan jaminan bahwa kondisi saat ini belum berubah. Verifikasi ke kode/config terbaru sebelum mengambil tindakan yang berisiko.

## 6. Struktur dan teknologi proyek yang tercatat

- Frontend statis: `github-files/` (repo Git terpisah, branch `main`, remote `https://github.com/wiaaugusta/Dashboard_IT_RBG.git`).
- Backend Google Apps Script: `APPSCRIPT/` (gitignored, deploy via clasp).
- Frontend saat catatan ini dibuat memakai HTML/CSS/ES modules vanilla + PWA offline. Runtime tidak menggunakan framework/build system.
- Kondisi teknologi tersebut adalah kondisi tercatat, bukan larangan migrasi selamanya. Jangan melakukan migrasi atau menambah dependency besar tanpa analisis dan persetujuan, tetapi agent boleh mengusulkan perubahan teknologi jika manfaatnya jelas.
- Dokumen khusus yang tercatat: `github-files/docs/PROJECT_CONSTITUTION.md`, `UI_AND_DESIGN.md`, `ARCHITECTURE.md`, `DATA_AND_API.md`. Periksa keberadaan dan versi aktualnya; jangan menganggap semua isinya otomatis lebih baru daripada AGENTS.md.

## 7. Aturan teknis umum dan batasan yang harus diverifikasi

- Frontend boleh memakai aset online/CDN, web font, icon library, atau dependency baru di seluruh modul jika manfaat UX/desain/teknisnya jelas. Evaluasi lisensi, keamanan, performa, ketersediaan jaringan, maintenance, ukuran bundle, dan fallback sebelum memilih; pertahankan offline behavior bila masih bermanfaat, bukan sebagai larangan mutlak.
- Icon saat ini tercatat terpusat di `github-files/js/icons.js` dengan SVG Lucide lokal. Ini adalah implementasi yang ada, bukan larangan permanen terhadap icon library, inline SVG, emoji, atau visual asset lain. Jika ingin mengubah sistem icon, evaluasi konsistensi, accessibility, offline support, lisensi, ukuran bundle, dan dampak migrasi; perubahan sistem secara luas perlu persetujuan.
- Pemetaan ikon yang tercatat: `aho` = package, `nms` = network, Agent Kaspersky = `shield`, Server Kaspersky = `server`; fallback ke `dashboard`. Verifikasi pemakaian aktual sebelum mengubah mapping.
- Jika mengubah aset atau shell frontend, periksa kebutuhan bump `CACHE_NAME` di `github-files/service-worker.js` dan strategi cache yang berlaku.
- Untuk tabel/data baru, pelajari pola cache client per sesi seperti `github-files/js/manage-pc-cache.js`. Gunakan kembali jika cocok dengan karakter data dan lifecycle sesi. Jangan menerapkan pola cache secara mekanis jika kebutuhan data, invalidasi, keamanan, atau arsitektur berbeda; jelaskan alternatifnya.
- Rahasia/kredensial tidak boleh masuk repo atau frontend publik. Periksa `.gitignore` dan mekanisme penyimpanan rahasia sebelum menyentuh konfigurasi sensitif.

## Deploy Backend (SANGAT SENSITIF — VERIFIKASI SEBELUM TINDAKAN)
- URL stabil yang dipakai frontend (`github-files/js/api.js`):
  `https://script.google.com/macros/s/AKfycbyld_jhumhTe3FY2Yta9csQDIsAYe5l_el0BO917FF7USX1Ssj_QQHFSG1gGejHuoRt/exec`
- Dari folder `APPSCRIPT/`: `clasp push`, lalu `clasp version "..."`, lalu:
  `clasp update-deployment AKfycbyld_jhumhTe3FY2Yta9csQDIsAYe5l_el0BO917FF7USX1Ssj_QQHFSG1gGejHuoRt -V <versi> -d "..."`
- Catatan historis: jangan membuat deployment baru atau memakai `clasp deploy` jika tujuan masih mempertahankan URL stabil. Verifikasi deployment dan kebutuhan terbaru sebelum tindakan.
- Deployment production adalah tindakan berdampak besar: jangan push/deploy backend atau mengubah URL production tanpa permintaan/konfirmasi eksplisit. Perintah di bawah adalah referensi operasional, bukan izin otomatis untuk deploy.
- Snapshot historis saat dokumen ini terakhir dicatat: backend versi 54 (redeploy backend v53: Action tambah/hapus `.temp` di tabel Kaspersky Bermasalah; referensi Kaspersky SOURCE PC OFFICE R1/S1). Versi production saat ini wajib diverifikasi sebelum deploy.
- Test tabel ITAM (DOM): `node .harness/build-managepc-test.mjs; Copy-Item .harness\test-itam-table.html github-files\__test-itam.html; node .harness/run-itam-test.mjs` (hapus `__test-itam.html` setelahnya).


## Alur Kerja Agent

1. Baca AGENTS.md terlebih dahulu.
2. Identifikasi tujuan permintaan, ruang lingkup, dan risiko.
3. Baca dokumentasi khusus yang relevan; cari konflik, aturan usang, atau informasi yang belum terverifikasi.
4. Periksa kode/config aktual sebelum mengandalkan catatan historis.
5. Untuk pekerjaan UI/UX substansial, gunakan UI UX Pro Max dan FigCraft MCP sesuai bagian 4.
6. Sampaikan rekomendasi dan minta persetujuan jika perubahan termasuk kategori besar pada bagian 3.
7. Implementasikan perubahan dengan menjaga fungsi, data, keamanan, dan kompatibilitas yang relevan.
8. Jalankan pemeriksaan/test yang tersedia dan sesuai dampak perubahan. Jangan mengklaim test atau visual review yang tidak dilakukan.
9. Perbarui dokumentasi/catatan data yang terdampak berdasarkan fakta dan keputusan yang sudah disetujui.
10. Laporkan ringkas: perubahan, alasan, file terdampak, hasil verifikasi, risiko/pekerjaan tersisa, dan dokumentasi yang diperbarui.

Jangan berhenti pada rencana jika pengguna meminta implementasi dan ruang lingkupnya sudah jelas. Sebaliknya, jangan mengeksekusi perubahan besar yang belum disetujui hanya demi menyelesaikan tugas lebih cepat.

## Perintah & Lingkungan
- Shell: Windows PowerShell 5.1. Jangan pakai `&&` atau `head`; gunakan `;`, `Get-ChildItem`, `Select-Object`. Gunakan parameter `workdir`, bukan `cd`.
- Root repo tidak punya remote; push hanya dari `github-files/`.
- Test Manage PC (DOM/headless): `node .harness/build-managepc-test.mjs; node .harness/run-managepc-test.mjs`
- Test logika backend: `node .harness/test-managepc-backend.mjs`
- `.harness/` berisi server/CDP/screenshot sementara dan tidak di-commit.

## Catatan Manage PC (Snapshot Teknis — Verifikasi Sebelum Mengubah)
- Backend membaca maksimal 200 baris data Manage PC (`MANAGE_PC_LAST_ROW`), cache version 7.
- Info Kaspersky: Versi/Agent dari tab SOURCE kolom S/R (fallback MASTER REPORT OFFICE Z/AA), server default `kscoffice.sat.co.id`. Nama tab SOURCE diatur Script Property `MANAGE_PC_SOURCE_SHEET`.
- Kartu Kaspersky memakai 4 stat (termasuk persen gabungan KAV+Versi) dan blok info Versi/Agent/Server; footer lama sudah dihapus.
- Submenu Kaspersky (Office) memakai tabel utama `B203:K400` (No + 10 kolom B..K; status kolom K: normal hijau, NIK dobel kuning, user dobel/belum update/versi NOK merah, tidak ditemukan abu) lewat action `getManagePcKasperskyTable`; detail `B403:L415` tampil di kartu terpisah "Data Kaspersky Bermasalah" di atas tabel utama dengan 11 kolom: No + B..L tanpa Sistem Operasi (Version KES & Agent version ditampilkan). Status kolom tetap satu baris. Data di-cache client (owner role|NIK) seperti tabel Manage PC/CCTV; kolom No tanpa sort. Kedua tabel tanpa scrollbar horizontal; padding rapat, marquee 1x ke kiri saat hover; Last connected (x day) merah. Tabel utama: Model/OS 100px, Last 115px, STATUS 118px dan label panjang dibungkus. Kartu masalah: judul "Data Kaspersky Bermasalah" (kapital di setiap kata, font 15px), header lebih sempit berisi ikon merah + judul + badge count abu di samping judul (tanpa kurung); seluruh header bisa diklik, chevron hanya di kanan, animasi buka/tutup halus; default collapsed (hanya header). Sudut kartu konsisten membulat (overflow hidden), jarak atas kartu disamakan dengan panel lain (margin-top 0; kartu utama di bawahnya memakai gap 20px). Kartu Kaspersky Office: header/ikon+judul lebih rapat (padding 16px 18px 12px, gap 12px/8px). STATUS satu baris, Source lebar tetap 84px dan sticky di kanan (kanan 80px saat kolom Action tampil, kanan 24px saat Action disembunyikan) agar tidak terpotong saat halaman menyempit; kolom Action 56px sticky paling kanan (kanan 24px) berisi tombol tambah/hapus `.temp` sesuai Source/status dan hanya dirender (header + sel) bila minimal satu baris memiliki Source `.temp` atau status `Tidak ada di .temp`; Sistem Operasi tidak ditampilkan, Model dipotong bila meluber; Source `.temp` memakai badge abu dengan teks merah; status `Tidak ada di .temp` juga memakai badge abu dengan teks merah sedangkan `TIDAK DITEMUKAN` tetap abu; JS fit dinamis meminimalkan pemotongan. Summary section memakai 3 kartu: Kaspersky, Versi Kaspersky, dan Summary Data Kaspersky (kartu info rekap status: Total Device = total lama tanpa tidak ditemukan + Device Versi NOK, baris dibagi 2 kolom: kiri Device Normal/NIK Dobel/User Dobel/Beda User, kanan Device Versi NOK/tidak ditemukan/Last Inv >4 day, dengan status dots ok/warn/danger/empty/late; badge STATUS VERSI NOK merah, TIDAK DITEMUKAN tetap abu; counts dihitung client-side via `kasperskyStatusCounts()` dari cached table items; update via `updateKasperskyStatusSummary()` setelah cache load, `setKasperskyStatusSummaryUnavailable()` on error; `renderSummary()` accept session param untuk baca cache). Grid 3 kolom via `.gsp-cards--kaspersky-3` dengan tinggi kartu disamakan, responsif tetap: 3 kolom `>=1024px`, 2 kolom `769–1023px`, 1 kolom `<=768px` (tidak berubah saat sidebar hover); stats sedikit turun (margin-top 6px), info versi/agent/server lebih rapat dan menempel di bawah kartu seperti ITAM (margin-top auto); Total Device summary sejajar stats kartu lain, kolom poin berjarak 20px, baris 12px dan jarak total→poin 8px. Nama komputer tabel utama Kaspersky dipotong di 150px dengan marquee hover; Version KES/Agent version merah bila di bawah referensi `SOURCE PC OFFICE` R1/S1 (fallback tab SOURCE), dibandingkan numerik per segmen. service-worker cache v81.

- Action `.temp` tabel Kaspersky Bermasalah memakai action backend `updateManagePcTemp` (`add`/`remove`, range B2:B200, auth `ADMIN`/`IT_OFFICE`, `LockService`, invalidasi cache Kaspersky). Tombol hapus muncul bila Source `.temp`; tombol tambah bila status `Tidak ada di .temp`. Keduanya memakai dialog Yes/No, state loading, centang sukses, auto-close ~1.5 detik, lalu refresh tabel Kaspersky dengan `forceRefresh`.

## Catatan SLA (Snapshot Teknis — Verifikasi Sebelum Mengubah)
- Backend `APPSCRIPT/Modules/Sla.js` adalah satu modul untuk semua menu SLA. Data Store membaca tab `MASTER SLA STORE`: `B2:N500` (ahoStore), `R2:AG10000` (ahoAll), dan `AK2:AT100` (pendingAho).
- Action router: `getSlaAhoStore`, `getSlaAhoAll`, dan `getSlaPendingAho`; handler per action ada di `Modules/Sla.js`.
- Header dideteksi otomatis (baris dengan sel terisi terbanyak pada 10 baris pertama); item memakai key camelCase dari header + `__row`; cache server 10 menit chunked dengan prefix `sla-v1`.
- Config: semua modul SLA memakai `SPREADSHEET_MANAGE_PC_ID` (tanpa property ID terpisah); nama tab per tabel diatur lewat Script Property pada definisi tabel — data Store memakai `SLA_STORE_SHEET_NAME` (default `MASTER SLA STORE`). Auth per tabel lewat field `roles` (Store: `ADMIN`/`IT_STORE`).
- Parent `/aho` memakai action `getSlaAhoStore` untuk dashboard: satu period picker menggabungkan tahun + multi-select bulan, KPI mengikuti pilihan periode, dan tabel harian memakai `tglTerima`. Durasi berasal dari `waktuPenyelesaian` dalam pecahan hari (`0.0125` = 18 menit); perhitungan total dan rata-rata tidak diubah. Tanggal tanpa problem disembunyikan. Tanggal dengan >1 problem dapat dibuka untuk detail Kode Toko, Nama Toko, Nama Penanggung, Waktu Penyelesaian, dan Ach SLA (nilai `100` ditampilkan `100%`).
- Client cache SLA memakai owner `role|NIK`, satu load per sesi dan deduplikasi request, mengikuti pola Manage PC. Backend tetap membatasi data ke `ADMIN`/`IT_STORE`; submenu SLA Store dan Form Hardware tidak diubah.
- Dashboard AHO Store (`js/pages/aho-summary.js`, `css/components.css`): 3 kartu KPI berurutan Total Problem (kiri, bg orange tipis `#fff7ed`, ikon `ticket`), Total Waktu Penyelesaian (tengah, bg netral, ikon `timer`), Rata-rata per Problem (kanan, bg hijau lembut `#f0fdf4`, ikon `gauge`). Kartu compact (min-height 76px desktop, 64px mobile), padding 12px 16px, baris horizontal, ikon di kiri. Sparkline dekoratif lembut di pojok kanan bawah (opacity 0.13, rotate -6deg, stroke-width 1, z-index 0); teks selalu di atas (z-index 1). Badge tren (%) hanya muncul saat memilih tepat 1 bulan (banding vs bulan sebelumnya, nama bulan sebagai label); disembunyikan jika >1 bulan. Header "ASSET & HARDWARE OPERATION" dihapus.

## Memori Otomatis (opencode-mem)
- Plugin global `opencode-mem` terdaftar di `~/.config/opencode/opencode.json` (dan `tui.json`); konfigurasi di `~/.config/opencode/opencode-mem.jsonc`.
- `storagePath`: `E:/LLM/memory/opencode-mem/data`. Auto-capture: `opencodeProvider: "9router"`, `opencodeModel: "inherit"`.
- Log plugin: `~/.opencode-mem/opencode-mem.log`. Web UI default: `http://127.0.0.1:4747`.
- Auto-capture berjalan saat sesi idle; prompt trivial bisa sengaja di-skip AI (`type=skip`), jadi bukan berarti plugin mati.
- Jika plugin gagal load di Windows: pastikan cache `~/.cache/opencode/packages/opencode-mem@latest/node_modules` berisi binding native (`@tursodatabase/database-win32-x64-msvc`, `onnxruntime-node/bin/napi-v6/win32`). Perbaiki dengan hapus cache, jalankan `opencode plugin opencode-mem -g -f`, lalu restart opencode.
- Perubahan config/plugin tidak hot-reload; sesi berjalan harus di-restart.
- Submenu ITAM (Office) memakai blok O203:X400 (No + 10 kolom O..X: Nama Komputer, Alamat IP, Workgroup, OS Name, Group Administrator, Group User, Itam Version, Status Privilege, Last Inventory, Status; cache backend `managepc-itamtable-v2-office`), detail bermasalah O403:Y420. Tabel ITAM sejajar Kaspersky: `bindEndpointTable()` generik (search/sort/pagination/marquee/fit problem) dengan config per modul (ITAM_FIT_PLAN: osName → lastInventory → groupAdministrator); renderer `renderItamRows`/`renderItamDetailRows`; badge count "Data ITAM Bermasalah" teal (CSS `[data-itam-problem-card]`).
- Submenu KACE (Office) memakai blok AB203:AK400 dan data NOK AB403:AK450. Kolom tabel utama: Nama Komputer, Alamat IP, Workgroup, OS Name, Administrator, Group User, model komputer, total hardisk, last inv, STATUS. Kolom bermasalah: Nama Komputer, Alamat IP, Workgroup, OS Name, Administrator, Group User, model komputer, last inv, STATUS, Source. Tabel memakai 15 baris per halaman, nomor urut tidak sortable, kolom lain sortable, warna Status/Source sama seperti Kaspersky, cache backend `managepc-kacetable-v2-office` dan cache client sesi owner `role|NIK` seperti Kaspersky.
- Aturan tabel Kaspersky/ITAM/KACE: data sel harus satu baris (jangan wrap ke bawah). Teks panjang di kolom OS Name, Administrator, dan Group User boleh terpotong dengan marquee satu arah ke kiri satu kali saat hover; Last connected tidak dipotong. KACE bermasalah membatasi adaptive clipping pada OS Name → Administrator → Group User; Status dan Source memakai badge warna seperti Kaspersky.
- Semua kartu data bermasalah (Kaspersky/ITAM/KACE): viewport header + 10 baris, record berikutnya discroll di dalam kartu tanpa scrollbar terlihat; header tabel sticky; wheel ditahan di dalam kartu sampai kursor keluar (ctrl+wheel tetap zoom).

## Status Terakhir
- Ikon Lucide lokal: 83 ikon, opsi `size`/`strokeWidth`/`color`/`label`, fallback `dashboard`; semua 36 nama ikon yang dipakai tersedia dan galeri 83/83 render.
- Frontend commit terakhir: `e0beffb` (`feat(aho): compact stat cards, Phosphor-semantic icons, soft sparkline, 1-month trend only`), sudah di-push ke `origin/main`; service-worker v94.
- opencode-mem 2.34.0: cache native Windows diperbaiki, model embedding `Xenova/nomic-embed-text-v1` sudah ter-warmup, auto-capture aktif memakai `9router/inherit`.
