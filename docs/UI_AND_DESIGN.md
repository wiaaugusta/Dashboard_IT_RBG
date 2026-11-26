# UI AND DESIGN GUIDELINES
## Dashboard_IT_RBG

> **Status dokumen:** Pedoman aktif yang dapat berkembang.
>
> Dokumen ini membantu agent mengambil keputusan UI/UX yang berkualitas. Dokumen ini bukan batas kreativitas, katalog komponen wajib, atau larangan terhadap pendekatan desain tertentu.

---

# 1. TUJUAN DAN RUANG LINGKUP

Tujuan utama adalah membangun Dashboard_IT_RBG sebagai produk internal yang profesional, mudah digunakan, konsisten, accessible, responsive, aman, dan dapat dikembangkan.

Pedoman ini berlaku untuk seluruh frontend dan modul yang sudah ada maupun yang akan dikembangkan.

Prinsip utama:

- Kualitas pengalaman pengguna lebih penting daripada mengikuti tampilan lama secara membuta.
- Desain yang sekarang ada bukan berarti desain final atau desain terbaik.
- Agent boleh mengevaluasi, mengusulkan, dan menerapkan pendekatan visual/UX yang lebih baik sesuai aturan persetujuan pada dokumen ini.
- Tidak ada warna, layout, komponen, icon, library, animasi, chart, pola navigasi, atau gaya visual yang dilarang secara mutlak oleh dokumen ini.
- Pilihan desain harus memiliki alasan yang relevan dengan pengguna, konteks modul, data, dan tujuan produk.
- Perubahan UI/UX tidak boleh merusak fungsi, data, keamanan, integrasi, atau stabilitas sistem.

# 2. HIERARKI KEPUTUSAN

Jika beberapa pedoman atau referensi bertentangan, gunakan urutan prioritas berikut:

1. Keamanan, privasi, integritas data, dan kebutuhan bisnis yang telah dikonfirmasi.
2. Kebutuhan pengguna dan keputusan eksplisit pemilik proyek.
3. Arsitektur, kontrak API, dan batasan teknis proyek yang benar-benar berlaku.
4. Pedoman proyek terbaru yang telah disepakati.
5. Rekomendasi skill UI/UX, MCP, dokumentasi teknis, dan referensi desain.
6. Implementasi atau tampilan lama.

Jangan menganggap implementasi lama otomatis benar hanya karena sudah ada. Namun, jangan pula mengganti sesuatu yang masih berfungsi tanpa memahami dampak dan manfaatnya.

Jika menemukan konflik atau informasi yang belum jelas:
- Jelaskan konflik dan dampaknya.
- Cari bukti dari kode, data, dokumentasi, atau perilaku aplikasi.
- Ajukan solusi yang paling masuk akal.
- Minta persetujuan jika keputusan berisiko tinggi, mengubah kebutuhan bisnis, atau berdampak besar pada fungsi/arsitektur.

# 3. KEBEBASAN DAN EVALUASI DESAIN

Agent memiliki keleluasaan untuk mengevaluasi seluruh aspek desain, termasuk namun tidak terbatas pada:

- Warna, tema, kontras, dan penggunaan gradient.
- Layout, grid, whitespace, density, dan komposisi.
- Sidebar, topbar, navigation, tabs, breadcrumbs, dan menu.
- Typography, icon, ilustrasi, visualisasi data, dan chart.
- Cards, tables, forms, dialogs, drawers, popovers, dan komponen interaktif.
- Animasi, transisi, hover, feedback, dan micro-interaction.
- Responsive behavior untuk desktop, tablet, dan mobile.
- Design tokens, component system, dan struktur styling.

Tidak ada keharusan untuk mempertahankan desain yang sekarang jika ada alternatif yang lebih baik.

Agent diharapkan:
1. Menilai kondisi desain saat ini secara objektif.
2. Menemukan masalah usability, visual hierarchy, accessibility, konsistensi, dan responsiveness.
3. Mencari pendekatan alternatif yang relevan.
4. Membandingkan manfaat, trade-off, kompleksitas, dan risiko.
5. Merekomendasikan desain terbaik, bukan sekadar desain yang paling mudah dibuat.
6. Menjelaskan perubahan penting dengan bahasa yang mudah dipahami.

**Standar penilaian:** desain harus terasa disengaja, matang, profesional, mudah dipahami, dan sesuai kebutuhan. Jangan mempertahankan pola hanya karena pola tersebut umum dipakai template dashboard.

# 4. PENGGUNAAN UI UX PRO MAX DAN FIGCRAFT MCP

Untuk pekerjaan UI/UX yang relevan, agent wajib memanfaatkan skill dan MCP yang telah disediakan apabila tersedia pada lingkungan kerja.

## 4.1 UI UX Pro Max

Gunakan skill `ui-ux-pro-max` sebagai referensi utama untuk membantu:

- Menentukan arah visual dan design system.
- Mengevaluasi layout, hierarchy, spacing, typography, dan color.
- Memilih pola UX yang sesuai konteks.
- Menilai responsive design dan accessibility.
- Memilih komponen, chart, dan pola interaksi.
- Mengidentifikasi praktik desain yang kurang baik.
- Menghasilkan alternatif desain yang lebih profesional.

Gunakan sub-skill yang relevan dengan pekerjaan, misalnya design, design-system, ui-styling, brand, banner-design, atau slides. Tidak semua sub-skill harus dipanggil untuk setiap tugas.

Jangan hanya menyebut bahwa skill telah digunakan. Gunakan rekomendasi atau data yang relevan dalam proses analisis dan keputusan desain.

## 4.2 FigCraft MCP

Gunakan FigCraft MCP untuk pekerjaan visual yang memang mendapat manfaat dari prototype atau pemeriksaan desain, misalnya:

- Membuat atau mengeksplorasi prototype.
- Menguji alternatif layout dan komposisi.
- Membuat atau meninjau komponen visual.
- Memeriksa konsistensi dan hierarchy.
- Menggunakan frame, component, variable, atau fitur lain yang tersedia.
- Membandingkan rancangan sebelum implementasi.
- Memvalidasi hasil visual jika kemampuan MCP mendukungnya.

Gunakan tool FigCraft yang benar-benar tersedia pada koneksi saat itu. Jangan mengarang nama tool atau mengklaim tindakan yang tidak dilakukan.

FigCraft bukan pengganti implementasi dan pengujian aplikasi. Hasil prototype harus diterjemahkan secara tepat ke teknologi proyek, lalu diverifikasi pada aplikasi yang berjalan.

## 4.3 Jika skill atau MCP tidak tersedia

- Jangan mengklaim telah menggunakannya.
- Lanjutkan dengan kemampuan dan referensi yang tersedia jika pekerjaan masih dapat dilakukan.
- Beri tahu pengguna jika keterbatasan tersebut berdampak pada hasil.
- Jangan mengubah konfigurasi global, instalasi skill, atau koneksi MCP tanpa kebutuhan dan izin yang sesuai.

# 5. DESIGN SYSTEM

Design system digunakan untuk menjaga konsistensi, bukan untuk membatasi eksplorasi.

Gunakan design tokens atau mekanisme sejenis jika sesuai dengan stack proyek. Token dapat mencakup:

- Color dan semantic color.
- Typography.
- Spacing dan sizing.
- Radius dan border.
- Elevation, shadow, dan layering.
- Breakpoints dan responsive behavior.
- Motion dan transition.
- Component state.

Daftar tersebut adalah panduan, bukan daftar wajib yang harus selalu dibuat seluruhnya.

Ketentuan:
- Hindari nilai visual yang tersebar dan sulit dikelola jika dapat disatukan dengan cara yang lebih baik.
- Jangan memaksakan tokenisasi berlebihan pada elemen yang memang lebih tepat memiliki nilai lokal.
- Perubahan design system harus mempertimbangkan dampaknya pada seluruh modul.
- Jangan mengubah identitas visual global hanya untuk menyelesaikan satu masalah lokal jika solusi lokal lebih tepat.
- Jika identitas visual baru lebih baik untuk produk, agent boleh mengusulkannya beserta dampaknya.

# 6. TYPOGRAPHY DAN HIERARCHY

Typography harus mendukung keterbacaan, pemindaian informasi, dan karakter produk.

Agent bebas mengevaluasi font, ukuran, weight, line-height, letter spacing, dan kombinasi typography yang sesuai.

Perhatikan perbedaan hierarchy antara:
- Page title dan deskripsi halaman.
- Section heading.
- KPI atau angka penting.
- Label dan helper text.
- Isi tabel dan data padat.
- Form, tombol, status, serta pesan sistem.

Jangan membatasi jumlah ukuran font secara kaku. Hindari variasi yang tidak memiliki tujuan dan membuat tampilan tidak konsisten.

# 7. NAVIGATION DAN APPLICATION SHELL

Pilih pola navigasi berdasarkan jumlah modul, kedalaman informasi, frekuensi penggunaan, perangkat, dan kebutuhan pengguna.

Alternatif yang dapat dipertimbangkan antara lain sidebar, collapsible navigation, top navigation, tabs, bottom navigation, breadcrumbs, command menu, atau pola lain yang lebih sesuai.

Tidak ada pola yang wajib untuk semua halaman atau semua ukuran layar.

Ketentuan:
- Pengguna harus memahami lokasi mereka dan cara berpindah halaman.
- Active state dan hierarchy menu harus jelas.
- Navigasi tidak boleh mengambil ruang berlebihan.
- Pola desktop dan mobile boleh berbeda jika meningkatkan usability.
- Jangan menambahkan menu atau shortcut yang tidak memiliki fungsi nyata.
- Pastikan navigasi keyboard dan screen reader tetap dapat digunakan jika relevan.

# 8. ROLE-BASED UI DAN ATURAN MENU PROYEK

Aturan bisnis berikut merupakan catatan kondisi proyek yang perlu dipertahankan selama masih sesuai dengan implementasi dan keputusan terbaru:

- Role yang tercatat: IT Store dan Office/Admin.
- Menu CCTV tidak ditampilkan untuk Office/Admin sesuai aturan proyek yang tercatat.
- Menu CCTV tersedia untuk IT Store.
- Untuk login Office/Store (IT_OFFICE / IT_STORE), menu Manage PC menggunakan lingkup data sesuai login. ADMIN tetap memperoleh pemilihan tab Office/Store di halaman.
- Menu Checklist langsung membuka checklist sesuai jabatan untuk IT_OFFICE / IT_STORE. Halaman parent `/checklist` khusus ADMIN.
- Menu utama yang memiliki submenu (AHO, Manage PC, Checklist) dapat berfungsi sebagai parent link menuju halaman rangkuman, sedangkan chevron mengatur buka/tutup submenu.

**Penting:** catatan di atas bukan pengganti pemeriksaan kode dan kebutuhan terbaru. Sebelum mengubah role, menu, route, atau akses, periksa implementasi aktual dan dokumentasi terkait. Jika aturan bisnis sudah berubah, minta konfirmasi atau gunakan keputusan terbaru yang telah disetujui.

Menyembunyikan menu hanya merupakan perilaku UI. Authorization harus tetap divalidasi di backend.

# 9. DASHBOARD DAN DATA VISUALIZATION

Dashboard harus membantu pengguna memahami kondisi dan menentukan tindakan, bukan sekadar membuat layar terlihat penuh.

Gunakan visualisasi yang paling tepat untuk jenis data dan pertanyaan pengguna. Pilihannya dapat berupa KPI, chart, table, trend, timeline, activity feed, map, progress, comparison, atau bentuk lain.

Ketentuan:
- Gunakan data nyata dari sistem.
- Jangan membuat dummy metrics atau trend untuk mempercantik tampilan.
- Jangan menambahkan chart jika tabel atau angka ringkas lebih efektif.
- Pilih chart berdasarkan karakter data dan tujuan analisis.
- Beri label, satuan, periode, legenda, dan konteks yang diperlukan.
- Perhatikan readability, skala, perbandingan, dan aksesibilitas.
- Sediakan loading, error, empty, dan partial-data state yang sesuai.
- Jangan menyembunyikan informasi penting demi estetika.

# 10. TABLE DAN DATA-DENSE INTERFACE

Pilih format penyajian berdasarkan kebutuhan pengguna dan volume data. Table tidak selalu harus menjadi pilihan, tetapi tetap tepat untuk banyak data operasional.

Pertimbangkan:
- Search dan filtering.
- Sorting.
- Pagination atau virtual scrolling.
- Column visibility dan resizing.
- Row selection dan bulk action.
- Detail view atau expandable row.
- Sticky header atau column bila bermanfaat.
- Export jika memang dibutuhkan.
- Responsive table, horizontal scroll, atau transformasi ke card/list.

Jangan memaksakan seluruh fitur tersebut jika tidak diperlukan.

## Catatan CCTV

Untuk modul CCTV, kebutuhan yang tercatat meliputi:
- Nomor urut.
- Kode toko dan nama toko jika tersedia.
- URL.
- Username dan informasi password yang relevan.
- Status.
- Last update.
- Action.

Nomor urut harus mengikuti posisi data secara keseluruhan, bukan kembali ke 1 di setiap halaman. Informasi total record perlu tetap jelas ketika pagination digunakan.

Contoh informasi: "Menampilkan 1–15 dari 175 perangkat". Posisi ringkasan dan kontrol pagination boleh dievaluasi ulang jika tata letak alternatif lebih mudah digunakan.

Untuk dataset besar, evaluasi pagination, filtering, lazy loading, virtual scrolling, atau server-side processing berdasarkan kemampuan backend dan kebutuhan aktual. Jangan menganggap satu teknik wajib jika ada pendekatan yang lebih tepat.

# 11. CCTV PERFORMANCE DAN DATA LOADING

Catatan proyek: dataset CCTV Admin dapat jauh lebih besar dibanding dataset user IT Store dan pernah menimbulkan masalah loading.

Saat mengerjakan modul ini:
- Periksa ukuran data, request, response, cache, dan proses rendering.
- Jangan mengambil atau merender seluruh dataset jika tidak dibutuhkan.
- Hindari request duplikat dan pekerjaan berat di main thread.
- Tampilkan feedback saat data sedang dimuat.
- Usahakan konten yang sudah tersedia dapat digunakan tanpa menunggu proses yang tidak relevan.
- Gunakan pagination, filtering, caching, atau pemrosesan server jika sesuai arsitektur.
- Tampilkan total data secara akurat jika informasi tersebut tersedia.

Jangan mengubah backend atau API hanya untuk mempercantik tampilan. Namun, jika masalah UX bersumber dari desain API atau pola pengambilan data, agent boleh menganalisis dan mengusulkan perbaikan teknis secara terpisah.

# 12. LOADING, FEEDBACK, DAN SYSTEM STATES

Setiap proses asynchronous perlu memberikan feedback yang sesuai konteks.

State yang perlu dipertimbangkan:
- Initial loading.
- Refresh atau background loading.
- Partial loading.
- Success.
- Error.
- Empty.
- No results.
- Disabled atau unavailable.
- Offline atau connection issue jika relevan.

Bentuk feedback bebas dipilih sesuai konteks, misalnya skeleton, spinner, progress, inline message, toast, banner, overlay, atau button state.

Jangan menggunakan satu pola loading untuk semua kondisi. Jangan membuat seluruh halaman blank jika bagian lain tetap dapat ditampilkan.

Pesan error harus mudah dimengerti dan memberi langkah berikutnya jika memungkinkan. Jangan menampilkan stack trace, token, credential, atau detail internal sensitif kepada pengguna.

# 13. BUTTON, FORM, DAN INTERACTION

Gunakan komponen dan pola interaksi yang paling sesuai dengan fungsi dan tingkat risiko tindakan.

Pertimbangkan:
- Primary, secondary, tertiary, ghost, danger, dan icon action.
- Hover, focus, active, disabled, dan loading state.
- Label yang jelas dan tidak ambigu.
- Validasi yang dekat dengan field terkait.
- Helper text jika membantu.
- Konfirmasi untuk tindakan yang berisiko atau sulit dibatalkan.
- Pencegahan double submit.
- Keyboard interaction dan focus management.

Jangan menambahkan konfirmasi berlebihan pada tindakan rutin berisiko rendah. Jangan mengandalkan placeholder sebagai satu-satunya label form.

# 14. CATATAN KHUSUS CCTV: PASSWORD GENERATION

Bagian ini adalah catatan kebutuhan sistem yang tercatat, bukan sekadar preferensi tampilan. Periksa implementasi dan dokumen keamanan sebelum mengubahnya.

Format yang tercatat:
- DVR BARU: 8 karakter, kombinasi huruf, angka, dan simbol.
- DVR LAMA: 6 digit angka.

Konsep generation yang tercatat menggunakan derivasi cryptographic/deterministic berdasarkan kode toko, tujuan password, dan secret internal. Secret tidak boleh ditampilkan kepada pengguna.

Contoh konsep:
`HMAC(secret, storeCode + purpose)`

Jangan memindahkan secret atau proses sensitif ke frontend. Jangan mengganti algoritma, format, atau perilaku password hanya karena perubahan UI.

Catatan uniqueness:
- Password harus divalidasi terhadap collision sesuai kebutuhan sistem.
- Ruang kemungkinan DVR LAMA terbatas sehingga uniqueness tidak boleh diasumsikan secara matematis.
- Penanganan collision harus menjadi tanggung jawab implementasi sistem yang aman.

Jika kebutuhan atau implementasi aktual berbeda dari catatan ini, jangan menebak. Periksa sumber kebenaran dan konfirmasikan perubahan yang berdampak pada sistem.

# 15. CATATAN KHUSUS CCTV: EDIT PASSWORD UX

Kebutuhan UX yang tercatat:
- Generated password dapat ditampilkan kepada pengguna.
- Password hasil generate bersifat read-only.
- Pengguna dapat memilih/menggunakan password baru melalui action yang jelas.
- Setelah dipilih, tampilkan feedback bahwa password baru telah digunakan/dipilih.
- Jangan membuat pengguna perlu mengetik ulang password hasil generate jika alur sistem tidak memerlukannya.

Agent boleh memperbaiki layout, label, visual feedback, dan interaksi selama perilaku bisnis dan keamanan tetap terjaga.

# 16. CATATAN KHUSUS CCTV: URL INPUT

Kebutuhan yang tercatat adalah membantu pengguna memilih URL CCTV yang sering digunakan tanpa mengetik berulang kali.

Preset URL yang tercatat:
- `http://10.234.234.8/doc/page/login.asp`
- `http://10.234.234.8/`
- `http://10.234.234.8:8899/`
- `http://10.234.234.8:9090/doc/page/login.asp`
- `http://10.234.234.8:9090/`

Pola UI bebas dipilih, misalnya autocomplete, suggestion, combobox, popover, atau pendekatan lain. Pastikan pengguna memahami nilai yang dipilih dan dapat mengoreksinya jika aturan sistem mengizinkan.

Jangan mengubah daftar preset atau perilaku penyimpanan tanpa memeriksa kebutuhan dan implementasi aktual.

# 17. RESPONSIVE DESIGN

Responsive bukan sekadar mengecilkan layout desktop.

Pilih perilaku berdasarkan konteks dan prioritas pengguna pada setiap ukuran layar:
- Perubahan komposisi dan urutan konten.
- Navigation pattern yang berbeda.
- Adaptasi table atau data-dense interface.
- Ukuran target sentuh.
- Form dan dialog.
- Density informasi.
- Overflow dan scroll behavior.
- Safe area pada perangkat mobile.

Tidak ada kewajiban memakai bottom navigation, sidebar, atau pola tertentu pada semua perangkat.

Pastikan tidak ada overflow yang tidak disengaja, kontrol tetap dapat digunakan, dan informasi penting tidak hilang.

# 18. ICON, ILLUSTRATION, DAN VISUAL ASSETS

Tidak ada larangan mutlak terhadap jenis icon atau visual asset.

Agent bebas merekomendasikan icon library, inline SVG, icon font, emoji, ilustrasi, atau kombinasi yang tepat jika hasilnya lebih baik dan sesuai konteks.

Pertimbangkan:
- Konsistensi visual.
- Keterbacaan pada ukuran kecil.
- Makna yang mudah dipahami.
- Accessibility dan label untuk icon-only action.
- Lisensi, ukuran bundle, performa, dan kompatibilitas stack.
- Kesesuaian dengan karakter produk.

Hindari inkonsistensi yang tidak disengaja, bukan variasi yang memang memiliki tujuan desain.

Emoji dapat digunakan jika sesuai konteks dan menghasilkan UX yang lebih baik. Namun, untuk action kritis atau navigasi utama, pastikan maknanya tetap jelas dan tidak bergantung pada interpretasi yang ambigu.

# 19. MOTION DAN ANIMATION

Animasi tidak dilarang. Gunakan jika membantu menjelaskan perubahan state, hubungan antar elemen, orientasi pengguna, atau memberikan feedback.

Agent boleh mengevaluasi motion, transition, micro-interaction, loading animation, dan efek visual lain.

Perhatikan:
- Tujuan dan manfaat UX.
- Durasi dan intensitas.
- Performa perangkat.
- Preferensi reduced motion.
- Jangan menghalangi atau memperlambat pekerjaan pengguna.

Tidak perlu membatasi semua animasi menjadi subtle jika pendekatan lain lebih tepat.

# 20. ACCESSIBILITY DAN USABILITY

Pertimbangkan accessibility sejak perancangan, bukan hanya setelah implementasi.

Periksa aspek yang relevan:
- Contrast dan keterbacaan.
- Keyboard navigation.
- Focus visibility dan focus order.
- Semantic HTML dan accessible name.
- Screen reader support.
- Target sentuh.
- Form labels dan error association.
- Status yang tidak hanya dibedakan dengan warna.
- Reduced motion.
- Zoom dan text resizing.

Gunakan standar accessibility yang relevan dengan stack dan target aplikasi. Jangan menganggap checklist visual saja cukup untuk membuktikan accessibility.

# 21. PERFORMANCE DAN MAINTAINABILITY

Kualitas visual tidak boleh mengabaikan performa dan kemudahan pemeliharaan.

Pertimbangkan:
- Ukuran asset dan dependency.
- Render yang tidak perlu.
- DOM/component complexity.
- Duplicate request.
- Bundle size.
- Animation cost.
- Data volume.
- Reuse komponen secara tepat.
- Batas antara shared component dan kebutuhan khusus modul.

Jangan membuat abstraksi hanya demi mengurangi beberapa baris kode. Jangan pula menduplikasi pola yang seharusnya konsisten. Pilih struktur yang paling mudah dipahami dan dirawat.

# 22. SECURITY DAN DATA BOUNDARY

UI bukan security boundary.

- Menyembunyikan menu bukan authorization.
- Validasi frontend bukan pengganti validasi backend.
- Jangan menampilkan credential, secret, token, atau data sensitif yang tidak diperlukan.
- Jangan menyimpan rahasia pada frontend atau asset publik.
- Jangan mengubah authentication, authorization, session, atau API contract sebagai efek samping perubahan visual.
- Perubahan yang menyentuh security harus dianalisis secara terpisah dan mengikuti pedoman keamanan proyek.

# 23. WORKFLOW UI/UX

Gunakan alur yang adaptif. Tidak semua perubahan membutuhkan proses panjang, prototype, atau persetujuan formal.

## Untuk perubahan kecil
1. Pahami komponen dan konteks.
2. Periksa skill/referensi yang relevan.
3. Lakukan perubahan yang terlokalisasi.
4. Verifikasi fungsi dan tampilan yang terdampak.

## Untuk perubahan sedang atau besar
1. Audit halaman, komponen, data, dan alur pengguna yang terdampak.
2. Identifikasi masalah dan peluang peningkatan.
3. Muat UI UX Pro Max dan gunakan sub-skill relevan.
4. Gunakan FigCraft MCP untuk eksplorasi/prototype jika bermanfaat dan tersedia.
5. Susun rekomendasi desain dan jelaskan trade-off penting.
6. Untuk perubahan besar yang mengubah arah produk atau perilaku pengguna, minta persetujuan sebelum implementasi.
7. Implementasikan secara bertahap dan jaga fungsi existing.
8. Uji pada ukuran layar dan state yang relevan.
9. Perbaiki temuan dari hasil pemeriksaan.

Jangan memaksakan pembagian menjadi dua stage atau jumlah tahap tertentu. Tentukan tahapan sesuai ruang lingkup, risiko, dan manfaat.

# 24. PERSETUJUAN DAN OTONOMI AGENT

Agent boleh mengambil keputusan mandiri untuk:
- Perbaikan visual kecil dan terlokalisasi.
- Perbaikan spacing, hierarchy, readability, alignment, dan responsive issue.
- Perbaikan accessibility yang tidak mengubah kebutuhan bisnis.
- Konsistensi komponen yang sudah disepakati.
- Perbaikan bug UI yang jelas.

Agent harus menjelaskan dan meminta persetujuan sebelum:
- Mengubah arah visual utama atau identitas produk secara menyeluruh.
- Mengubah alur kerja pengguna atau business behavior.
- Menghapus atau mengganti fitur yang sudah ada.
- Mengubah role, permission, route, API contract, database, authentication, atau authorization.
- Menambahkan dependency besar atau layanan eksternal.
- Melakukan refactor besar dengan risiko regresi.
- Mengubah aturan bisnis yang belum dikonfirmasi.

Jika pengguna sudah secara eksplisit menyetujui suatu arah atau jenis perubahan, jangan meminta persetujuan berulang untuk detail implementasi yang masih berada dalam ruang lingkup persetujuan tersebut.

# 25. DOKUMENTASI YANG DAPAT BERKEMBANG

File Markdown proyek adalah dokumentasi hidup. Agent boleh mengusulkan dan memperbarui dokumentasi ketika menemukan keputusan baru, perubahan kebutuhan, atau aturan lama yang tidak lagi relevan.

Contoh:
- Preferensi UI/UX baru yang disetujui.
- Perubahan role atau alur kerja yang telah dikonfirmasi.
- Design system baru yang sudah dipilih.
- Komponen atau pola interaksi yang telah menjadi standar.
- Batasan teknis baru yang sudah diverifikasi.
- Aturan lama yang sudah tidak berlaku.

Aturan pembaruan:
1. Jangan mengubah preferensi pengguna berdasarkan asumsi.
2. Bedakan fakta implementasi, keputusan yang disepakati, rekomendasi, dan ide yang belum disetujui.
3. Jangan mengubah dokumentasi agar seolah-olah fitur sudah tersedia jika belum diimplementasikan.
4. Hindari duplikasi atau konflik dengan file dokumentasi lain.
5. Perbarui bagian yang relevan, bukan menambahkan aturan baru secara acak.
6. Jika perubahan dokumentasi memengaruhi cara kerja agent di masa depan, jelaskan perubahan tersebut kepada pengguna.
7. Untuk keputusan besar atau ambigu, ajukan usulan terlebih dahulu.
8. Pertahankan informasi historis yang masih penting, atau tandai sebagai deprecated jika sudah tidak berlaku.

Jika pengguna menyampaikan preferensi baru secara eksplisit, agent dapat memperbarui dokumen terkait dalam ruang lingkup tugas yang diberikan.

# 26. VALIDASI HASIL

Setelah perubahan UI/UX, lakukan pemeriksaan yang sesuai dengan dampaknya.

Checklist yang relevan:
- Halaman dan komponen tampil benar.
- Alur utama tetap bekerja.
- Tidak ada fungsi atau data yang hilang.
- Responsive pada ukuran layar relevan.
- Loading, error, empty, dan success state ditangani.
- Form, table, navigation, dan action dapat digunakan.
- Tidak ada overflow atau layout rusak.
- Accessibility dasar diperiksa.
- Console/build/test tidak menunjukkan regresi baru yang terkait.
- Hasil implementasi konsisten dengan prototype jika prototype digunakan.

Jika browser preview, screenshot, atau visual inspection tersedia, gunakan untuk menilai hasil nyata. Jangan mengklaim sudah melakukan visual validation jika hanya membaca kode.

# 27. FINAL PRODUCT PRINCIPLE

Dashboard_IT_RBG harus berkembang menjadi satu produk yang koheren, bukan kumpulan halaman yang tidak saling berhubungan.

Konsistensi tidak berarti semua halaman harus memiliki layout yang identik. Modul yang berbeda boleh memiliki pola visual dan interaksi berbeda jika kebutuhan penggunanya memang berbeda, selama tetap terasa sebagai bagian dari produk yang sama.

**Tujuan akhir:**
- Pengguna dapat menyelesaikan pekerjaan dengan lebih mudah dan cepat.
- Informasi penting mudah ditemukan dan dipahami.
- Desain terasa profesional dan matang.
- Sistem tetap stabil, aman, cepat, dan mudah dikembangkan.
- Agent aktif mencari peluang peningkatan, bukan sekadar mematuhi desain lama.
