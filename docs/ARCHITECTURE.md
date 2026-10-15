# ARCHITECTURE
# ARSITEKTUR IT TEAM MANAGEMENT & OPERATIONS PLATFORM

Dokumen ini menjelaskan struktur teknis utama aplikasi, hubungan antara frontend, backend, database, authentication, API, dan modul.

Arsitektur harus menjadi dasar sebelum implementasi fitur dilakukan.


---

# 1. TUJUAN ARSITEKTUR

Aplikasi harus memiliki fondasi yang:

- modular
- ringan
- aman
- mudah dikembangkan
- mudah dirawat
- responsive
- mendukung PWA
- tidak bergantung pada satu modul tertentu

CCTV adalah modul pertama yang dibuat, tetapi architecture harus dirancang untuk seluruh aplikasi.


---

# 2. ARSITEKTUR UMUM

Arsitektur utama:

USER
↓
FRONTEND
↓
API
↓
BACKEND
↓
DATABASE


Implementasi tahap awal:

USER
↓
FRONTEND
(GitHub)
↓
GOOGLE APPS SCRIPT API
↓
GOOGLE SHEETS


Frontend tidak boleh mengakses Google Spreadsheet secara langsung.


---

# 3. FRONTEND

Frontend merupakan aplikasi yang dilihat dan digunakan oleh user.

Frontend akan berada pada repository GitHub.

Teknologi awal:

- HTML
- CSS
- JavaScript

Framework belum diwajibkan.

Jika pada tahap berikutnya diperlukan framework, keputusan harus mempertimbangkan:

- kebutuhan project
- performance
- kemudahan maintenance
- kemampuan deployment
- kompatibilitas PWA
- kompleksitas tambahan

Jangan menggunakan framework hanya karena mengikuti tren.


---

# 4. STRUKTUR FRONTEND

Frontend harus dipisahkan berdasarkan tanggung jawab.

Struktur awal yang direkomendasikan:

frontend/
│
├── index.html
├── manifest.json
├── service-worker.js
│
├── css/
│   ├── style.css
│   ├── layout.css
│   └── components.css
│
├── js/
│   ├── app.js
│   ├── router.js
│   ├── auth.js
│   ├── api.js
│   ├── ui.js
│   └── modules/
│       └── cctv.js
│
└── assets/


Struktur dapat berubah jika kebutuhan project berkembang.

Prinsip utama:

HTML, CSS, JavaScript, API, authentication, UI helper, dan module logic tidak dibuat menjadi satu file besar.


---

# 5. APPLICATION SHELL

Frontend memiliki Application Shell yang menjadi kerangka utama aplikasi.

Application Shell terdiri dari:

- login
- sidebar
- header
- navigation
- content area
- notification
- loading
- modal
- user information
- responsive navigation

Setelah login berhasil, user masuk ke Application Shell.

Modul ditampilkan di dalam content area.


---

# 6. NAVIGATION

Menu utama aplikasi:

- Dashboard
- KPI
- AHO
- Manage PC (admin-only)
- NMS
- CCTV
- Checklist

Beberapa menu memiliki grup / submenu.

Contoh:

AHO
├── SLA AHO Store
└── SLA Form Hardware

Manage PC (admin-only)
├── Kaspersky → /manage-pc/kaspersky
├── ITAM → /manage-pc/itam
└── KACE → /manage-pc/kace

Scope Office/Store tidak lagi menjadi submenu sidebar - menjadi
tab dalam halaman dengan deep link ?scope=office|store
(mis. #/manage-pc/kaspersky?scope=store). Satu route melayani
semua tab.


Menu boleh terlihat walaupun modul belum memiliki data.

Jika modul belum selesai, halaman dapat menampilkan:

- Coming Soon
- Belum tersedia
- Dalam pengembangan

Jangan menghilangkan struktur menu hanya karena backend belum tersedia.


---

# 7. MODULAR FRONTEND

Setiap modul harus memiliki logic sendiri.

Contoh:

js/pages/
├── dashboard.js
└── manage-pc.js (Kaspersky / ITAM / KACE + tab Office/Store)

js/modules/
├── cctv.js
├── kpi.js
├── aho.js
├── nms.js
└── checklist.js


Modul tidak boleh mengambil alih fungsi global yang tidak diperlukan.

Fungsi yang digunakan bersama dapat ditempatkan pada:

- api.js
- ui.js
- utility
- shared component


---

# 8. BACKEND

Backend tahap awal menggunakan:

Google Apps Script.

Backend bertugas sebagai API layer antara frontend dan database.

Backend menangani:

- authentication
- authorization
- data retrieval
- data update
- validation
- business logic
- logging
- audit
- database access


---

# 9. SATU ATAU BEBERAPA BACKEND

Aplikasi tidak diwajibkan menggunakan satu Apps Script untuk seluruh modul.

Terdapat dua pendekatan yang diperbolehkan.


## Pendekatan A — Shared Backend

Satu Apps Script menangani beberapa modul.

Contoh:

Frontend
↓
Apps Script
├── KPI
├── AHO
├── Kaspersky
├── NMS
└── Checklist


Cocok untuk modul yang sederhana atau memiliki kebutuhan backend yang mirip.


## Pendekatan B — Module Backend

Modul kompleks memiliki Apps Script sendiri.

Contoh:

Frontend
│
├── CCTV
│   ↓
│   Apps Script CCTV
│   ↓
│   GSheet CCTV
│
├── AHO
│   ↓
│   Apps Script AHO
│   ↓
│   GSheet AHO
│
└── lainnya


Pendekatan ini diperbolehkan dan bahkan dapat lebih baik untuk modul yang kompleks.


---

# 10. PRINSIP PEMISAHAN BACKEND

Backend dipisahkan jika:

- modul sangat kompleks
- database berbeda
- logic berbeda
- security berbeda
- deployment berbeda
- maintenance lebih mudah jika dipisahkan
- risiko perubahan tinggi

Jangan memisahkan backend hanya karena nama menu berbeda jika sebenarnya tidak diperlukan.


---

# 11. DATABASE

Database tahap awal menggunakan Google Spreadsheet.

Spreadsheet merupakan data storage, bukan bagian dari frontend.

Frontend tidak mengetahui struktur internal spreadsheet secara langsung jika tidak diperlukan.

Frontend cukup mengetahui API contract.


---

# 12. PEMISAHAN GOOGLE SPREADSHEET

Tidak semua modul harus menggunakan spreadsheet yang sama.

Contoh:

CCTV
→ Spreadsheet CCTV

AHO
→ Spreadsheet Operasional

KPI
→ Spreadsheet KPI

Project
→ Spreadsheet Project


Pemilihan database ditentukan berdasarkan:

- kompleksitas
- volume
- kebutuhan akses
- hubungan data
- maintenance
- security


---

# 13. CCTV SEBAGAI CONTOH ARSITEKTUR

CCTV merupakan implementasi pertama.

Arsitektur CCTV:

USER
↓
FRONTEND CCTV
↓
CCTV API
↓
CCTV APPS SCRIPT
↓
CCTV GOOGLE SHEET


Frontend CCTV tidak membaca Google Sheet secara langsung.


---

# 14. AUTHENTICATION

Authentication digunakan untuk memastikan user yang mengakses aplikasi adalah user yang terdaftar.

Tahap awal menggunakan:

- username / NIK
- password

Credential IT Store dan Admin dapat disimpan pada:

Google Apps Script Script Properties


Password tidak boleh disimpan pada:

- frontend
- JavaScript
- GitHub
- Google Spreadsheet public


---

# 15. AUTHENTICATION FLOW

Alur login:

USER
↓
Input NIK
↓
Input Password
↓
Frontend
↓
Authentication API
↓
Apps Script
↓
Validasi credential
↓
Login berhasil
↓
Application Shell


Jika gagal:

Authentication API
↓
Login gagal
↓
Frontend menampilkan pesan error


---

# 16. AUTHORIZATION

Authentication dan authorization harus dibedakan.

Authentication:

"Siapa user ini?"

Authorization:

"Apa yang boleh dilakukan user ini?"


Contoh role awal:

### Admin

Memiliki akses penuh sesuai aturan aplikasi.

### IT Store

Memiliki akses terhadap fitur yang diperlukan Team IT Store.


Authorization harus diperiksa pada backend.

Frontend hanya digunakan untuk UX.


---

# 17. SESSION

Setelah login berhasil, aplikasi harus memiliki mekanisme session.

Session digunakan agar user tidak harus melakukan login pada setiap request.

Session harus memiliki:

- identitas user
- role
- waktu dibuat
- masa berlaku
- mekanisme validasi

Detail mekanisme session dapat ditentukan pada tahap implementasi authentication.


---

# 18. API

Frontend berkomunikasi dengan backend melalui API.

Contoh:

POST /login

GET /cctv

GET /cctv/:id

PUT /cctv/:id

GET /dashboard


Format endpoint dapat disesuaikan dengan kemampuan Google Apps Script.

Yang penting adalah struktur API harus konsisten.


---

# 19. API RESPONSE

Response API harus memiliki struktur konsisten.

Contoh berhasil:

{
  "success": true,
  "message": "Data berhasil diambil",
  "data": {}
}


Contoh gagal:

{
  "success": false,
  "message": "Data gagal diambil",
  "data": null
}


Struktur dapat dikembangkan sesuai kebutuhan.


---

# 20. DATA FLOW

Alur data umum:

SOURCE
↓
RAW
↓
PROCESSING
↓
MASTER
↓
SUMMARY
↓
API
↓
FRONTEND


Tidak semua modul wajib memiliki seluruh layer.

Untuk data sederhana:

SOURCE
↓
MASTER
↓
API
↓
FRONTEND


Untuk data kompleks:

SOURCE
↓
RAW
↓
PROCESSING
↓
MASTER
↓
SUMMARY
↓
API
↓
FRONTEND


---

# 21. SUMBER DATA

Sumber data dapat berasal dari:

- Google Spreadsheet
- dashboard
- API
- database
- Oracle
- sistem internal
- input user
- hasil automation


Sumber data mentah tidak harus langsung digunakan frontend.

Jika diperlukan, data harus diproses terlebih dahulu menjadi struktur yang siap digunakan aplikasi.


---

# 22. MASTER DATA

MASTER merupakan data yang telah:

- dibersihkan
- distandarkan
- dimapping
- divalidasi
- diproses

MASTER harus memiliki struktur yang stabil.

Frontend tidak boleh bergantung pada format data mentah apabila data tersebut masih dapat berubah.


---

# 23. SUMMARY DATA

SUMMARY digunakan untuk informasi dashboard dan agregasi.

Contoh:

- total
- selesai
- belum selesai
- overdue
- progress
- SLA
- achievement


Tujuannya agar dashboard tidak perlu memproses data detail dalam jumlah besar.


---

# 24. PWA

Frontend dipersiapkan sebagai Progressive Web App.

Komponen utama:

- manifest.json
- service worker
- icon
- responsive UI
- installable application
- standalone mode


PWA harus tetap dapat digunakan melalui browser biasa.


---

# 25. RESPONSIVE ARCHITECTURE

Layout menggunakan responsive design.

Desktop:

- sidebar
- topbar
- dashboard
- tabel
- panel


Mobile:

- compact header
- hamburger / drawer
- card
- list
- responsive table
- touch-friendly control


Tidak membuat frontend terpisah untuk mobile.


---

# 26. DESIGN SYSTEM

Aplikasi menggunakan design system bersama.

Komponen bersama dapat meliputi:

- Button
- Input
- Select
- Card
- Table
- Modal
- Toast
- Badge
- Loading
- Empty State
- Error State
- Navigation


Semua modul harus menggunakan komponen bersama jika tersedia.


---

# 27. SHARED SERVICE

Fungsi yang digunakan oleh banyak modul dapat ditempatkan sebagai shared service.

Contoh:

- API client
- authentication
- session
- notification
- formatter
- date helper
- validation
- loading
- modal


Modul tidak boleh membuat ulang fungsi global yang sebenarnya sudah tersedia.


---

# 28. ERROR HANDLING

Error harus ditangani pada setiap layer.

Frontend:

menampilkan pesan yang mudah dipahami.

Backend:

mencatat error teknis.

Database:

mengembalikan status yang jelas.

Jangan menampilkan informasi sensitif atau detail internal backend kepada user.


---

# 29. LOGGING DAN AUDIT

Aktivitas penting dapat dicatat pada backend.

Contoh:

- login
- logout
- update
- delete
- perubahan configuration
- error


Untuk perubahan data penting, audit trail dapat mencatat:

- user
- timestamp
- module
- record
- field
- old value
- new value
- action


---

# 30. DEPLOYMENT

Frontend dapat di-host melalui GitHub atau platform hosting lain yang sesuai.

Backend menggunakan Google Apps Script Deployment.

Database menggunakan Google Spreadsheet.

Struktur deployment:

FRONTEND HOSTING
↓
FRONTEND APPLICATION
↓
APPS SCRIPT API
↓
GOOGLE SHEETS


Jika di masa depan teknologi berubah, architecture dapat dikembangkan tanpa mengubah konsep modular aplikasi.


---

# 31. LINGKUNGAN DEVELOPMENT

Project harus membedakan:

- development
- testing
- production

Pada tahap awal mungkin hanya terdapat satu environment.

Namun struktur project harus memungkinkan pemisahan environment jika project berkembang.


---

# 32. PERUBAHAN TEKNOLOGI

Teknologi dapat berubah jika kebutuhan project berkembang.

Contoh kemungkinan di masa depan:

- framework frontend
- Node.js
- database SQL
- API server
- cloud backend

Namun perubahan teknologi tidak boleh dilakukan hanya karena teknologi tersebut lebih populer.

Perubahan harus memiliki alasan yang jelas.


---

# 33. PRINSIP UTAMA ARSITEKTUR

Architecture project mengikuti prinsip:

ONE APPLICATION
+
MODULAR FRONTEND
+
MODULAR BACKEND
+
FLEXIBLE DATABASE
+
CONSISTENT API


Aplikasi terlihat sebagai satu platform bagi user.

Namun secara internal modul dapat memiliki:

- frontend logic sendiri
- backend sendiri
- spreadsheet sendiri
- data processing sendiri

selama tetap mengikuti standar project.


---

# 34. TARGET ARSITEKTUR JANGKA PANJANG

Architecture harus memungkinkan evolusi:

Tahap awal:

Frontend
↓
Apps Script
↓
Google Sheets


Tahap berkembang:

Frontend
↓
API Layer
↓
Multiple Backend Services
↓
Multiple Data Sources


Tahap lebih lanjut jika diperlukan:

Frontend / PWA
↓
API Gateway
↓
Backend Services
↓
Database / External Systems


Perubahan tersebut tidak perlu dilakukan sekarang.

Fondasi dibuat agar dapat berkembang secara bertahap.


---

# 35. ATURAN IMPLEMENTASI

Sebelum membuat fitur baru, tentukan terlebih dahulu:

1. Modul apa?
2. Frontend berada di mana?
3. Backend berada di mana?
4. Database berada di mana?
5. API apa yang diperlukan?
6. Apakah menggunakan shared service?
7. Apakah membutuhkan authentication?
8. Apakah membutuhkan authorization?
9. Apakah membutuhkan logging?
10. Apakah membutuhkan audit?

Setelah itu baru implementasi.


---

# 36. KEPUTUSAN ARSITEKTUR SAAT INI

Keputusan awal project:

Frontend:
GitHub / hosting frontend yang sesuai

Frontend technology:
HTML + CSS + JavaScript

Application type:
Responsive Web Application + PWA

Backend:
Google Apps Script

Database:
Google Spreadsheet

Authentication:
NIK + Password

Credential storage:
Google Apps Script Script Properties

Primary first module:
CCTV

CCTV database:
Google Spreadsheet khusus CCTV

CCTV backend:
Google Apps Script

Application architecture:
Modular

Frontend architecture:
Separated HTML / CSS / JavaScript

Backend architecture:
Separated by responsibility dan dapat dipisahkan berdasarkan modul jika diperlukan.


---

# 37. ATURAN PERUBAHAN ARSITEKTUR

Jika ingin mengubah architecture utama, perubahan harus mempertimbangkan:

- dampak terhadap modul existing
- migration
- security
- performance
- maintenance
- deployment
- database
- API
- frontend

Perubahan besar tidak boleh dilakukan hanya untuk menyelesaikan masalah kecil.


---

# END OF ARCHITECTURE
