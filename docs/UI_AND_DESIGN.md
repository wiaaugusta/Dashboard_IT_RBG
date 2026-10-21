# UI AND DESIGN SYSTEM
## Dashboard_IT_RBG

Dokumen ini adalah pedoman resmi UI/UX untuk Dashboard_IT_RBG.

Tujuan utama:
Membuat aplikasi terlihat seperti software/dashboard SaaS profesional yang modern, premium, polished, responsive, dan nyaman digunakan, tanpa mengorbankan functionality, architecture, security, dan maintainability.

Dokumen ini berlaku untuk seluruh frontend dan seluruh module yang akan dibuat di masa depan.

---

# 1. CORE PRINCIPLE

Dashboard_IT_RBG bukan sekadar aplikasi yang "berfungsi".

Target UI adalah:

FUNCTIONAL
+
CONSISTENT
+
MODERN
+
PROFESSIONAL
+
POLISHED
+
RESPONSIVE
+
EASY TO USE

UI harus terasa seperti aplikasi internal enterprise/SaaS yang matang, bukan prototype atau template HTML sederhana.

Prioritas:

1. Functionality existing tidak boleh rusak.
2. UX harus jelas.
3. Visual hierarchy harus kuat.
4. Design harus konsisten.
5. Responsive harus dipikirkan sejak awal.
6. UI harus tetap ringan dan performant.

UI improvement tidak boleh menjadi alasan untuk mengubah backend, API contract, authentication, routing, atau business logic yang sudah berjalan.

---

# 2. DESIGN DIRECTION

Visual direction:

- Modern
- Premium
- Professional
- Corporate
- Clean
- Elegant
- Polished
- Slightly dimensional
- Tidak terlalu datar
- Tidak terlalu ramai
- Tidak berlebihan menggunakan gradient

Gunakan:

- white / off-white
- light gray
- dark navy / charcoal
- controlled accent color
- subtle border
- subtle shadow
- modern radius
- consistent icons
- clear status badges

Hindari:

- terlalu banyak warna
- gradient berlebihan
- shadow terlalu berat
- border terlalu tebal
- icon yang tidak konsisten
- emoji sebagai icon UI utama
- layout yang terasa seperti template gratis

Target visual:

"Premium enterprise dashboard"

---

# 3. DESIGN SYSTEM

Gunakan CSS variables/design tokens untuk seluruh UI.

Minimal:

- background
- surface
- surface elevated
- text primary
- text secondary
- text muted
- border
- primary
- primary hover
- success
- warning
- danger
- info
- shadow
- radius
- spacing

Jangan menyebarkan hard-coded color ke banyak file jika dapat menggunakan design token.

Tujuannya agar perubahan visual dapat dilakukan secara global dan konsisten.

---

# 4. TYPOGRAPHY

Typography harus memiliki hierarchy yang jelas.

Gunakan level yang konsisten untuk:

- page title
- section title
- card title
- body
- label
- caption
- table text
- button

Jangan menggunakan terlalu banyak ukuran font.

Prioritaskan readability dan visual hierarchy.

---

# 5. LOGIN PAGE

Login harus terlihat modern dan profesional.

Jangan menggunakan layout yang terlalu polos atau memenuhi seluruh desktop dengan warna solid tanpa depth.

Gunakan konsep:

- subtle background
- soft pattern/decorative element
- subtle blur jika sesuai
- elevated login card
- shadow halus
- typography hierarchy
- branding yang proporsional

Login card menjadi focal point.

Desktop:
- layout seimbang
- tidak terasa kosong
- tidak terlalu banyak decorative element

Mobile:
- fokus pada form
- tidak ada elemen yang mengganggu
- nyaman disentuh
- responsive

---

# 6. APPLICATION HEADER

Setelah login, tampilkan nama user sebenarnya dari session.

Jangan menggunakan label generik seperti:

"IT STORE"
"OFFICE"

jika nama user tersedia.

Contoh:

"Welcome back, Jalil"

atau:

"Good morning, Jalil"

Nama harus berasal dari data/session yang valid, bukan dummy data.

Header dapat memiliki:

- page title
- breadcrumb jika diperlukan
- notification
- user avatar
- user name
- role indicator jika relevan

---

# 7. NAVIGATION

## Desktop

Gunakan sidebar modern.

Sidebar memiliki:

- icon
- label
- active state
- hover state
- section grouping jika diperlukan
- user profile area
- logout

Sidebar tidak boleh terlalu lebar.

## Mobile

Gunakan bottom navigation seperti aplikasi mobile modern.

Contoh:

Home | CCTV | Project | More

Menu harus disesuaikan dengan module yang benar-benar tersedia.

Bottom navigation:

- fixed
- touch friendly
- active state jelas
- icon konsisten
- label pendek
- tidak terlalu tinggi
- memperhatikan safe-area
- tidak menutupi content

Desktop dan mobile boleh memiliki navigation pattern berbeda.

---

# 8. ROLE BASED UI

Role yang saat ini digunakan:

- IT Store
- Office/Admin

Untuk user Office/Admin:

- menu CCTV tidak ditampilkan sementara waktu

Untuk user IT Store:

- menu CCTV tersedia

Untuk login Office/Store (IT_OFFICE / IT_STORE):

- menu Manage PC tetap tersedia, TANPA pembagian Office/Store - login
  sudah menentukan lingkup datanya (IT Store → Store, IT Office →
  Office); ADMIN tetap mendapat pemilihan tab Office/Store di dalam
  halaman
- menu Checklist langsung membuka checklist sesuai jabatan (tanpa
  submenu Office/Store); halaman parent `/checklist` khusus ADMIN

Menu utama yang memiliki submenu (AHO, Manage PC, Checklist) adalah
parent link / clickable dropdown: label parent membuka halaman parent
berisi rangkuman data submenu, chevron membuka/menutup submenu.

Jangan hanya menyembunyikan menu secara visual jika authorization/security membutuhkan validasi backend.

UI restriction bukan pengganti backend authorization.

---

# 9. DASHBOARD

Dashboard harus memiliki visual hierarchy yang jelas.

Gunakan:

- summary cards
- section
- icon
- status indicator
- quick action jika relevan
- activity/information section jika memang tersedia

Jangan menambahkan dummy data hanya untuk membuat dashboard terlihat ramai.

Gunakan data nyata dari sistem.

Card harus memiliki:

- proper spacing
- subtle border/shadow
- clear title
- value emphasis
- optional icon
- optional status/trend

---

# 10. CCTV MODULE

CCTV adalah salah satu module utama.

Functionality CCTV existing harus dipertahankan.

Namun UI/UX harus diperbaiki.

Karena jumlah CCTV dapat besar:

WAJIB menggunakan pagination.

Jangan load seluruh dataset CCTV sekaligus ke browser jika tidak diperlukan.

Prioritas:

- load page pertama terlebih dahulu
- pagination
- search/filter
- server-side filtering jika memungkinkan
- server-side pagination jika memungkinkan
- lazy loading untuk data tambahan

Tujuan:

Admin dengan data CCTV banyak tetap mendapatkan halaman yang cepat.

---

# 11. CCTV TABLE

Table harus memiliki:

- nomor urut
- kode toko
- nama toko jika tersedia
- URL
- username
- password/status yang relevan
- status
- last update
- action

Nomor urut harus mengikuti posisi pagination.

Contoh:

Page 1:
1 - 10

Page 2:
11 - 20

Page 3:
21 - 30

Jangan reset nomor menjadi 1 setiap page. dan menampilkan total record secara keseluruhan, agar user tetap tau walaupun pagination, namun total record secara keseluruhan jelas.

Ringkasan jumlah data (mis. "Menampilkan 1-15 dari 175 perangkat") diletakkan di KIRI bawah tabel, sementara kontrol navigasi halaman di kanan bawah.

Table harus memiliki:

- clear header
- proper row spacing
- subtle divider
- hover state
- status badge
- action button
- responsive behavior

---

# 12. CCTV PERFORMANCE

Masalah khusus yang harus diperhatikan:

Login sebagai Admin dapat memiliki dataset CCTV jauh lebih besar dibanding login user IT Store.

Karena itu:

JANGAN:

- mengambil seluruh CCTV dataset jika tidak diperlukan
- melakukan rendering ratusan/ribuan row sekaligus
- melakukan request berulang untuk data yang sama
- membuat browser menunggu seluruh dataset sebelum menampilkan UI

PREFER:

1. tampilkan UI terlebih dahulu
2. tampilkan loading state
3. ambil data yang diperlukan untuk page pertama
4. render page pertama
5. pagination untuk data berikutnya
6. search/filter dilakukan seefisien mungkin
7. gunakan server-side pagination/filtering jika backend mendukung

Jika membutuhkan total data:

gunakan count/metadata terpisah jika memungkinkan. karena saat ini, ketika login menggunakan admin, load data sangat lama, dan tidak menampilkan data, bisa jadi karena data pasti lebih banyak, dibandingkan login menggunakan user.

---

# 13. LOADING EXPERIENCE

Setiap proses asynchronous harus memiliki loading state yang jelas.

JANGAN hanya menggunakan:

"Memproses data..."
"Loading..."
"Please wait..."

secara polos.

Gunakan visual feedback seperti:

- spinner
- skeleton loading
- progress indicator
- animated placeholder
- button loading state
- overlay ringan untuk proses tertentu

Jenis loading harus sesuai konteks.

## Page Loading

Gunakan skeleton atau loading indicator yang terlihat profesional.

## Table Loading

Tampilkan skeleton row atau loading state di area table.

Jangan membuat seluruh halaman blank.

## Button Loading

Saat submit/update:

- disable button sementara
- tampilkan spinner
- ubah label menjadi "Menyimpan..." / "Memproses..."
- cegah double submit

## Data Fetching

User harus dapat memahami:

"aplikasi sedang melakukan sesuatu"

bukan mengira aplikasi hang.

---

# 14. SUCCESS / ERROR / EMPTY STATE

Semua asynchronous operation harus memiliki state yang jelas:

Loading
Success
Error
Empty

Error message harus:

- mudah dimengerti
- tidak menampilkan technical stack trace
- memberi tindakan jika memungkinkan

Empty state harus menjelaskan bahwa data memang kosong, bukan aplikasi gagal load.

---

# 15. BUTTON SYSTEM

Minimal:

- Primary
- Secondary
- Ghost
- Danger
- Icon button

Setiap button memiliki:

- normal
- hover
- active
- disabled
- loading

Button harus memiliki visual hierarchy.

Action penting harus paling terlihat.

---

# 16. FORM UX

Form harus:

- memiliki label jelas
- spacing konsisten
- error state jelas
- focus state jelas
- disabled state jelas
- loading state jelas

Jangan hanya mengandalkan placeholder sebagai label.

---

# 17. CCTV PASSWORD GENERATION

Untuk penggantian password CCTV, sistem akan menggunakan format password yang konsisten dan deterministic berdasarkan:

- kode toko
- tujuan password
- secret/salt internal sistem

Secret/salt TIDAK boleh ditampilkan kepada user.

Password harus dapat dihasilkan secara konsisten berdasarkan data toko tetapi tetap sulit ditebak oleh orang yang hanya mengetahui kode toko.

## DVR BARU

Format:

- 8 karakter
- kombinasi huruf
- angka
- symbol

Contoh format:

A7#k29!Q

Contoh tersebut hanya ilustrasi.

Password sebenarnya harus dihasilkan oleh algoritma.

## DVR LAMA

Format:

- 6 digit
- angka saja

Contoh:

583214

Contoh tersebut hanya ilustrasi.

Password sebenarnya harus dihasilkan oleh algoritma.

## Prinsip generation

Jangan menggunakan:

- random sederhana di frontend
- timestamp
- increment biasa
- kode toko langsung sebagai password
- pola yang mudah ditebak

Gunakan deterministic cryptographic derivation berdasarkan konsep:

HMAC / cryptographic hash
+
store code
+
password purpose
+
internal secret

Contoh konsep:

HMAC(secret, storeCode + purpose)

Kemudian hasilnya dipetakan ke character set sesuai format password.

Tujuan:

Kode toko yang berbeda menghasilkan password berbeda.

Password DVR BARU dan DVR LAMA juga harus berbeda walaupun kode tokonya sama.

---

# 18. PASSWORD UNIQUENESS

Target sistem:

Tidak boleh ada password yang sama antar kode toko.

Namun uniqueness harus dianggap sebagai constraint sistem, bukan asumsi matematis.

Karena DVR LAMA hanya memiliki 6 digit, ruang kemungkinan hanya 1.000.000 kombinasi.

Karena itu sistem harus melakukan uniqueness validation terhadap password yang sudah tersimpan.

Jika terjadi collision:

- generate variant menggunakan counter/nonce internal
- validasi ulang
- simpan hasil yang unik

Jangan menampilkan proses teknis tersebut kepada user.

DVR BARU dengan 8 karakter memiliki ruang kombinasi jauh lebih besar, tetapi uniqueness validation tetap disarankan.

---

# 19. CCTV EDIT FORM - PASSWORD

Pada form edit CCTV:

Password baru harus dapat ditampilkan sebagai generated password.

Konsep UX:

Password Baru
[A7#k29!Q] [Gunakan]

Ketika user memilih/mengklik password baru:

- password baru otomatis menggantikan password lama
- password baru tidak dapat diedit manual
- user tidak perlu mengetik password
- field harus memiliki visual berbeda dari input biasa
- berikan feedback bahwa password telah dipilih

Contoh:

Password Lama:
********

Password Baru:
A7#k29!Q
[Gunakan Password Baru]

Setelah digunakan:

Password Baru:
A7#k29!Q
✓ Password baru dipilih

Field generated password bersifat read-only.

User tidak dapat mengubah karakter generated password secara manual.

---

# 20. CCTV URL INPUT

Field URL CCTV harus membantu user agar tidak perlu mengetik URL berulang kali.

Jangan menggunakan dropdown yang terlihat seperti pilihan biasa jika UX tidak cocok.

Gunakan hint/preset suggestion.

Ketika field URL diklik/focus:

tampilkan pilihan URL yang tersedia.

Preset:

http://10.234.234.8/doc/page/login.asp
http://10.234.234.8/
http://10.234.234.8:8899/
http://10.234.234.8:9090/doc/page/login.asp
http://10.234.234.8:9090/

User cukup memilih salah satu.

Setelah dipilih:

- URL masuk ke input
- user tetap dapat melihat value
- UX harus cepat
- tidak membuat form terasa rumit

Jika diperlukan, gunakan suggestion/popover yang ringan daripada native select.

---

# 21. RESPONSIVE DESIGN

Desktop:

- sidebar
- topbar
- dashboard content

Tablet:

- sidebar dapat collapse
- content menyesuaikan

Mobile:

- bottom navigation
- full-width content
- cards menjadi vertical
- touch target nyaman
- form full-width
- table responsive
- tidak boleh horizontal overflow yang tidak diperlukan

Jangan memaksakan desktop UI ke mobile.

---

# 22. MOBILE TABLE

Untuk data seperti CCTV yang banyak:

Pilih pendekatan terbaik:

- horizontal scroll jika table masih efektif
atau
- transform menjadi card/list jika lebih nyaman

Prioritas adalah usability.

Nomor urut tetap harus terlihat.

Action tetap mudah disentuh.

---

# 23. ICON SYSTEM

Gunakan satu style icon yang konsisten.

Jangan mencampur banyak icon library/style.

Jangan menggunakan emoji sebagai icon utama UI.

---

# 24. ANIMATION

Gunakan animation secara subtle.

Contoh:

- fade
- slide
- hover
- skeleton shimmer
- button loading

Jangan menggunakan animasi berlebihan.

Animation harus membantu UX, bukan mengganggu.

---

# 25. ACCESSIBILITY

Perhatikan:

- contrast
- keyboard focus
- readable text
- button size
- touch target
- semantic HTML
- aria-label jika diperlukan

---

# 26. PERFORMANCE

UI yang bagus tidak boleh mengorbankan performance.

Hindari:

- rendering data berlebihan
- DOM terlalu besar
- request duplicate
- animation berat
- asset terlalu besar

Untuk dataset besar:

PREFER pagination, filtering, lazy loading, dan server-side processing.

---

# 27. SECURITY BOUNDARY

UI hanya bertanggung jawab terhadap UX.

Authorization sebenarnya tetap dilakukan backend.

Contoh:

Menyembunyikan menu CCTV untuk Office/Admin adalah UI behavior.

Namun backend tetap harus menentukan apakah request CCTV diperbolehkan.

Jangan menganggap hidden menu = security.

---

# 28. IMPLEMENTATION PHASE

Perbaikan UI/UX dilakukan hanya dalam 2 tahap agar perubahan tidak terlalu lama dan mudah dikontrol.

## STAGE 1 - CORE UI/UX

Fokus:

- design tokens
- global layout
- sidebar
- topbar
- user profile/name
- login page
- dashboard visual
- button
- card
- typography
- loading state
- success/error/empty state
- responsive foundation

Pastikan functionality existing tetap berjalan.

## STAGE 2 - CCTV + MOBILE POLISH

Fokus:

- CCTV UI
- pagination
- nomor urut
- performance/loading CCTV
- generated password UX
- URL suggestion
- role-based menu
- mobile bottom navigation
- responsive CCTV
- final polish
- hover/focus/transition

Jangan melakukan tahap tambahan besar di luar dua stage ini tanpa persetujuan.

---

# 29. CHANGE CONTROL

Sebelum mengubah file:

- pahami existing implementation
- jangan rewrite tanpa alasan
- gunakan kembali component/style yang sudah ada jika memungkinkan
- jangan mengubah API contract hanya untuk UI
- jangan mengubah backend logic tanpa alasan
- jangan menghapus functionality existing

Jika terdapat konflik antara UI requirement dan architecture:

1. identifikasi konflik
2. jelaskan
3. pilih solusi paling aman
4. jangan melakukan perubahan architecture besar tanpa persetujuan

---

# 30. FINAL UI STANDARD

Setiap module baru di masa depan harus mengikuti design system ini.

Developer tidak perlu membuat style baru dari nol.

Gunakan:

- existing tokens
- existing components
- existing spacing
- existing typography
- existing button system
- existing card system
- existing responsive pattern

Tujuan akhir:

Dashboard_IT_RBG harus terasa sebagai SATU PRODUK.

Bukan kumpulan halaman yang masing-masing memiliki desain sendiri.
