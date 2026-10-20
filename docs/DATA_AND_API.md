# DATA AND API
# ARSITEKTUR DATA DAN API IT TEAM MANAGEMENT & OPERATIONS PLATFORM

Dokumen ini menjelaskan prinsip pengelolaan data, sumber data, struktur data, proses pengolahan, database, API, serta hubungan data dengan frontend.

Dokumen ini menjadi acuan ketika membuat modul baru atau menghubungkan aplikasi dengan sumber data.


---

# 1. TUJUAN

Tujuan arsitektur data adalah memastikan data:

- terstruktur
- mudah dipahami
- mudah diolah
- mudah diaudit
- mudah dikembangkan
- tidak bergantung langsung pada tampilan frontend
- dapat digunakan oleh lebih dari satu modul jika diperlukan

Frontend tidak boleh menjadi tempat utama untuk melakukan pengolahan data kompleks.

Pengolahan data utama dilakukan pada backend atau data processing layer.


---

# 2. PRINSIP UTAMA DATA

Gunakan prinsip:

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

Tidak semua modul wajib menggunakan seluruh layer.

Gunakan hanya layer yang memang dibutuhkan.


---

# 3. SOURCE DATA

SOURCE adalah sumber data asli sebelum diproses.

Sumber data dapat berasal dari:

- Google Spreadsheet
- sistem internal
- dashboard
- API
- Oracle
- database
- file
- hasil automation
- input user

SOURCE tidak selalu berarti database aplikasi.

SOURCE merupakan tempat data pertama kali diperoleh.


---

# 4. RAW DATA

RAW digunakan untuk menyimpan data mentah yang berasal dari SOURCE jika diperlukan.

Tujuan RAW:

- mempertahankan data asli
- mempermudah audit
- mempermudah troubleshooting
- memungkinkan proses ulang
- membandingkan hasil pengolahan

RAW sebaiknya tidak dimodifikasi secara sembarangan.


---

# 5. PROCESSING

PROCESSING adalah proses untuk mengubah data mentah menjadi data yang lebih terstruktur.

Contoh proses:

- filtering
- mapping
- cleaning
- normalisasi
- deduplikasi
- validasi
- transformasi
- perhitungan
- penggabungan data
- pemisahan data
- kalkulasi SLA
- kalkulasi KPI

Processing dapat dilakukan menggunakan:

- Google Apps Script
- Python
- SQL
- formula Google Spreadsheet
- backend service
- automation lainnya

Pemilihan teknologi berdasarkan kebutuhan.


---

# 6. MASTER DATA

MASTER adalah data yang telah siap digunakan oleh aplikasi.

MASTER dapat berasal dari:

RAW
↓
PROCESSING
↓
MASTER

atau:

SOURCE
↓
MASTER

untuk data yang sederhana.


MASTER harus memiliki struktur yang relatif stabil.

Frontend tidak sebaiknya bergantung langsung pada struktur SOURCE apabila SOURCE dapat berubah.


---

# 7. SUMMARY DATA

SUMMARY digunakan untuk kebutuhan agregasi dan dashboard.

Contoh:

- total
- jumlah selesai
- jumlah belum selesai
- overdue
- progress
- SLA
- achievement
- percentage
- trend

Contoh:

Data detail:

1000 ticket

SUMMARY:

Total = 1000
Open = 120
Closed = 850
Overdue = 30
SLA = 96.5%


Dashboard sebaiknya menggunakan SUMMARY apabila tidak membutuhkan data detail.


---

# 8. DATABASE

Database utama pada tahap awal adalah:

Google Spreadsheet.

Namun Google Spreadsheet dapat digunakan dalam beberapa bentuk:

### Spreadsheet sebagai SOURCE

Berisi data dari sistem lain.

### Spreadsheet sebagai RAW

Berisi salinan data mentah.

### Spreadsheet sebagai MASTER

Berisi data yang telah diolah.

### Spreadsheet sebagai SUMMARY

Berisi data agregasi.

### Spreadsheet sebagai APPLICATION DATABASE

Berisi data yang diubah langsung oleh aplikasi.


Satu spreadsheet dapat memiliki beberapa fungsi jika sederhana.

Untuk modul kompleks, fungsi tersebut dapat dipisahkan.


---

# 9. PEMISAHAN DATABASE

Tidak semua modul harus menggunakan satu Google Spreadsheet.

Contoh:

CCTV
→ GSheet CCTV

AHO
→ GSheet AHO

KPI
→ GSheet KPI

Project
→ GSheet Project


Modul sederhana dapat menggunakan spreadsheet yang sama apabila memang lebih efisien.

Keputusan pemisahan berdasarkan:

- kompleksitas
- volume
- keamanan
- hubungan data
- kebutuhan user
- maintenance
- performa


---

# 10. CCTV DATABASE

CCTV menggunakan spreadsheet khusus.

Struktur data CCTV dapat memiliki informasi seperti:

- store
- store_id
- nama_store
- url
- username
- password
- status
- timestamp update
- updated_by

Struktur aktual harus mengikuti spreadsheet CCTV yang digunakan.

Jangan mengubah struktur existing tanpa memeriksa dampaknya terhadap sistem yang sudah berjalan.


---

# 11. DATA MASTER DAN DATA TRANSAKSI

Jika diperlukan, bedakan:

### Master Data

Data yang relatif stabil.

Contoh:

- store
- user
- lokasi
- asset
- device
- kategori

### Transaction Data

Data yang terus berubah.

Contoh:

- ticket
- update CCTV
- checklist
- project task
- aktivitas
- history


Pemisahan dilakukan jika memang membantu struktur dan maintenance.


---

# 12. DATA ID

Data penting sebaiknya memiliki identifier yang jelas.

Contoh:

- store_id
- ticket_id
- asset_id
- project_id
- user_id
- record_id

Jangan menggunakan nama sebagai identifier utama jika terdapat kemungkinan nama berubah atau tidak unik.


---

# 13. TIMESTAMP

Data yang memiliki perubahan atau transaksi sebaiknya memiliki timestamp.

Gunakan informasi seperti:

- created_at
- updated_at

Untuk audit dapat digunakan:

- action_at


Format timestamp harus konsisten.


---

# 14. USER INFORMATION

Data aktivitas user dapat menggunakan:

- user_id
- NIK
- role
- name jika diperlukan

Jangan menyimpan password pada data transaksi atau audit.


---

# 15. DATA NORMALIZATION

Data yang digunakan lintas modul harus memiliki standar.

Contoh:

Store ID harus memiliki format yang konsisten.

Jangan sampai satu sumber menggunakan:

2AZ1

dan sumber lain:

2az1

atau:

STORE-2AZ1

tanpa proses mapping.


---

# 16. MASTER MAPPING

Jika terdapat perbedaan format antar sumber, gunakan mapping.

Contoh:

SOURCE A:
store = 2AZ1

SOURCE B:
branch = 2AZ1

MASTER:
store_id = 2AZ1


Mapping dilakukan pada processing layer.


---

# 17. DATA VALIDATION

Data yang masuk harus divalidasi jika diperlukan.

Contoh:

- field wajib
- format tanggal
- format ID
- nilai numerik
- status
- duplicate
- referensi master

Validasi dilakukan sebelum data digunakan oleh proses berikutnya.


---

# 18. DUPLICATE DATA

Data duplicate harus ditangani dengan jelas.

Jika data memang boleh duplicate, jangan menghapusnya secara otomatis.

Jika data seharusnya unik, gunakan identifier atau aturan deduplikasi.

Jangan melakukan deduplikasi tanpa mengetahui aturan bisnisnya.


---

# 19. DATA HISTORY

Untuk data penting yang sering berubah, pertimbangkan penyimpanan history.

Contoh perubahan CCTV:

User:
15033901

Timestamp:
2026-08-25 10:30

Store:
2AZ1

Field:
password

Old Value:
*****

New Value:
*****

Action:
UPDATE


Password asli tidak boleh ditampilkan atau disimpan pada history jika tidak diperlukan.


---

# 20. DATA SECURITY

Data harus dikategorikan berdasarkan sensitivitas.

Contoh data sensitif:

- password
- credential
- token
- API key
- secret

Data tersebut tidak boleh dikirim ke frontend jika frontend tidak membutuhkannya.

Prinsip:

**Frontend hanya menerima data yang diperlukan untuk menampilkan atau menjalankan fungsi.**


---

# 21. PASSWORD DAN CREDENTIAL

Password yang digunakan untuk authentication aplikasi atau credential sistem tidak boleh disimpan pada frontend.

Untuk credential backend tahap awal dapat menggunakan:

Google Apps Script Script Properties.


Untuk data seperti password CCTV yang memang harus dikelola oleh aplikasi, aksesnya harus dibatasi berdasarkan authorization.

Password tidak boleh muncul pada:

- console log
- error message
- GitHub
- source code frontend
- URL
- query parameter


---

# 22. API LAYER

Frontend berkomunikasi dengan backend melalui API.

Pola:

FRONTEND
↓
API
↓
BACKEND
↓
DATABASE


API menjadi abstraction layer antara frontend dan database.


---

# 23. API RESPONSIBILITY

API bertanggung jawab untuk:

- menerima request
- validasi request
- authentication
- authorization
- mengambil data
- mengolah data jika diperlukan
- menyimpan data
- mengembalikan response


Frontend tidak boleh menentukan aturan bisnis utama.


---

# 24. API ACTION

API dapat memiliki action berdasarkan kebutuhan.

Contoh:

LOGIN

GET_CCTV

GET_CCTV_DETAIL

UPDATE_CCTV

GET_DASHBOARD

GET_KPI

GET_AHO

GET_KASPERSKY

GET_NMS

GET_ITAM

GET_CHECKLIST


Nama action dapat berubah sesuai implementasi.

Yang penting struktur dan penamaannya konsisten.


---

# 25. API REQUEST

Request harus memiliki struktur yang jelas.

Contoh:

{
  "action": "getCCTV",
  "store_id": "2AZ1"
}


Untuk update:

{
  "action": "updateCCTV",
  "store_id": "2AZ1",
  "data": {
    "url": "https://example.com"
  }
}


Struktur aktual dapat disesuaikan dengan kebutuhan backend.


---

# 26. API RESPONSE

Response berhasil:

{
  "success": true,
  "message": "Data berhasil diambil",
  "data": {}
}


Response gagal:

{
  "success": false,
  "message": "Data gagal diambil",
  "data": null
}


Response dapat ditambahkan:

- error_code
- pagination
- metadata
- timestamp

jika dibutuhkan.


---

# 27. API ERROR

Error API harus memiliki pesan yang aman dan mudah dipahami.

Contoh:

{
  "success": false,
  "message": "Anda tidak memiliki akses",
  "data": null
}


Jangan mengirim detail internal seperti:

- password
- stack trace
- database credential
- spreadsheet ID jika tidak diperlukan
- struktur internal server


---

# 28. AUTHENTICATION API

Login menggunakan:

NIK
+
Password


Alur:

Frontend
↓
LOGIN API
↓
Backend
↓
Validasi credential
↓
Session
↓
Frontend


Password dikirim melalui koneksi HTTPS.


---

# 29. AUTHORIZATION API

Setiap API yang membutuhkan akses khusus harus memeriksa authorization.

Contoh:

UPDATE_CCTV

Backend memeriksa:

- apakah user sudah login?
- siapa user?
- role user?
- apakah user memiliki hak update?
- apakah request valid?


Jangan hanya mengandalkan frontend.


---

# 30. API MODULAR

API harus mengikuti modul.

Contoh:

CCTV API

- getCCTV
- getCCTVDetail
- updateCCTV


AHO API

- getAHO
- getAHODetail


KPI API

- getKPI
- getKPIDetail


Hal ini membuat backend lebih mudah dikembangkan.


---

# 31. SHARED API SERVICE

Frontend sebaiknya memiliki satu API client atau service yang menangani komunikasi dengan backend.

Contoh:

api.js

Tanggung jawab:

- request
- HTTP method
- headers
- session
- error handling
- parsing response


Modul tidak perlu membuat mekanisme request sendiri-sendiri jika menggunakan backend yang sama.


---

# 32. CACHE

Caching dapat digunakan jika membantu performance.

Contoh data yang cocok:

- master store
- konfigurasi
- menu
- data yang jarang berubah


Data yang sensitif atau sering berubah tidak boleh di-cache sembarangan.


---

# 33. PAGINATION

Jika data cukup besar, gunakan pagination.

Contoh:

CCTV:
1000 store

Jangan selalu mengirim 1000 record sekaligus jika user hanya membutuhkan sebagian.

Gunakan:

page
limit
offset

atau mekanisme pagination lain yang sesuai.


---

# 34. FILTERING

Filtering sebaiknya dilakukan pada backend jika dataset besar.

Contoh:

Store
Region
Status
Date
PIC


Frontend mengirim filter:

{
  "action": "getData",
  "filter": {
    "store": "2AZ1",
    "status": "OPEN"
  }
}


Backend melakukan filtering sebelum mengembalikan data.


---

# 35. SORTING

Sorting dapat dilakukan pada backend jika data besar.

Contoh:

sort_by = updated_at

sort_order = desc


Jangan memindahkan seluruh dataset ke frontend hanya untuk melakukan sorting jika sebenarnya dapat dilakukan pada backend.


---

# 36. DATA AGGREGATION

Perhitungan dashboard sebaiknya dilakukan di backend atau summary layer.

Contoh:

Daripada frontend menghitung:

1000 record
→ filter
→ grouping
→ count
→ percentage


Lebih baik:

Backend
→ menghasilkan summary


Frontend hanya menampilkan.


---

# 37. DASHBOARD DATA

Dashboard harus menerima data yang sudah siap ditampilkan.

Contoh:

{
  "total": 1000,
  "completed": 850,
  "pending": 120,
  "overdue": 30,
  "percentage": 96.5
}


Frontend tidak perlu mengetahui bagaimana angka tersebut dihitung.


---

# 38. DATA REFRESH

Setiap modul harus memiliki strategi refresh.

Pilihan:

- manual refresh
- refresh saat membuka halaman
- periodic refresh
- realtime jika benar-benar diperlukan

Jangan menggunakan periodic refresh jika tidak diperlukan karena dapat membebani backend.


---

# 39. GOOGLE APPS SCRIPT

Google Apps Script berfungsi sebagai backend/API layer.

Apps Script bertanggung jawab terhadap:

- menerima request
- authentication
- authorization
- business logic
- membaca spreadsheet
- menulis spreadsheet
- logging
- response API


Apps Script tidak boleh mencampurkan seluruh logic semua modul tanpa struktur.


---

# 40. STRUKTUR BACKEND

Struktur backend harus dipisahkan berdasarkan tanggung jawab.

Contoh:

backend/
└── apps-script/

    auth.gs
    api.gs
    config.gs
    utils.gs

    modules/
        cctv.gs
        aho.gs
        kpi.gs


Struktur aktual dapat disesuaikan dengan kebutuhan deployment.


---

# 41. GOOGLE SHEETS ACCESS

Akses spreadsheet harus dilakukan melalui backend.

Contoh:

Frontend
↓
CCTV API
↓
Apps Script
↓
Spreadsheet CCTV


Spreadsheet ID tidak perlu diketahui frontend jika tidak diperlukan.


---

# 42. SPREADSHEET CONFIGURATION

ID Spreadsheet dan konfigurasi backend dapat disimpan menggunakan:

Google Apps Script Script Properties


Contoh konfigurasi:

SPREADSHEET_CCTV_ID

SPREADSHEET_AHO_ID

SPREADSHEET_KPI_ID


Dengan demikian ID tidak perlu ditanam langsung di banyak file.


---

# 43. KONFIGURASI

Configuration harus dipisahkan dari business logic jika memungkinkan.

Contoh:

- Spreadsheet ID
- Sheet name
- API configuration
- environment
- feature flag

Jangan menyebarkan konfigurasi yang sama di banyak tempat.


---

# 44. FEATURE FLAG

Jika diperlukan, fitur dapat dikontrol menggunakan feature flag.

Contoh:

CCTV_ENABLED = true

KPI_ENABLED = false

AHO_ENABLED = false


Hal ini memungkinkan menu tersedia tetapi fungsi belum diaktifkan.


---

# 45. AUDIT API

API yang melakukan perubahan data harus dapat dicatat.

Contoh:

UPDATE_CCTV

→ user
→ timestamp
→ store
→ field
→ result


API GET tidak selalu membutuhkan audit detail.


---

# 46. IDEMPOTENCY

Operasi yang dapat menyebabkan duplicate update harus dipertimbangkan.

Contoh:

User menekan tombol Save dua kali.

Backend harus mencegah terjadinya data duplicate jika operasi tersebut seharusnya hanya dilakukan satu kali.


---

# 47. TRANSACTIONAL THINKING

Google Spreadsheet bukan database transactional penuh.

Karena itu, proses yang melakukan beberapa perubahan sekaligus harus dirancang hati-hati.

Contoh:

Update data
+
Update audit log

Jika salah satu gagal, backend harus memberikan status yang jelas.


---

# 48. CONTOH ALUR CCTV

User membuka CCTV:

Frontend
↓
GET_CCTV
↓
CCTV Apps Script
↓
Google Sheet
↓
MASTER CCTV
↓
API Response
↓
Frontend
↓
CCTV List


Ketika user melakukan update:

User
↓
Form Update
↓
Frontend Validation
↓
UPDATE_CCTV
↓
Authentication
↓
Authorization
↓
Backend Validation
↓
Google Sheet Update
↓
Audit Log
↓
API Response
↓
Notification


---

# 49. DATA FLOW UNTUK MODUL KOMPLEKS

Untuk modul seperti AHO, KPI, NMS, atau ITAM, data dapat berasal dari sistem lain.

Contoh:

Sistem Sumber
↓
RAW
↓
Processing
↓
MASTER
↓
SUMMARY
↓
API
↓
Dashboard


Frontend tidak perlu mengetahui kompleksitas sumber data.


---

# 50. SINGLE SOURCE OF TRUTH

Untuk setiap informasi penting harus ditentukan sumber kebenarannya.

Contoh:

Store Master
→ sumber master store

CCTV
→ sumber data CCTV

KPI
→ sumber KPI

Asset
→ sumber ITAM


Jangan memiliki dua sumber data berbeda yang sama-sama dianggap sebagai sumber utama untuk informasi yang sama tanpa alasan.


---

# 51. DATA OWNERSHIP

Setiap modul harus memiliki sumber data yang jelas.

Contoh:

CCTV
→ CCTV Module

ITAM
→ ITAM Module

KPI
→ KPI Module


Modul lain yang membutuhkan data tersebut harus menggunakan API atau shared master jika diperlukan.

Jangan melakukan copy data secara sembarangan.


---

# 52. DATA CONTRACT

Setiap API penting harus memiliki data contract.

Data contract minimal menjelaskan:

- action / endpoint
- request
- response
- field
- tipe data
- required / optional
- authorization
- error


Dokumentasi detail data contract dapat ditambahkan saat modul mulai diimplementasikan.


---

# 53. VERSIONING

Jika API sudah digunakan banyak modul, perubahan struktur response harus dilakukan dengan hati-hati.

Jika diperlukan perubahan besar, gunakan versioning.

Contoh:

API V1
API V2


Jangan mengubah response secara tiba-tiba jika masih digunakan oleh frontend existing.


---

# 54. DATA MIGRATION

Jika struktur data berubah:

1. Backup data.
2. Dokumentasikan perubahan.
3. Periksa dependency.
4. Buat migration jika diperlukan.
5. Test.
6. Baru gunakan struktur baru.

Jangan langsung mengubah data production tanpa pemeriksaan.


---

# 55. PERFORMANCE

Prioritas:

- minimalkan request
- minimalkan data yang dikirim
- gunakan summary
- gunakan pagination
- gunakan caching jika aman
- hindari membaca spreadsheet berulang kali
- hindari request API yang tidak diperlukan


---

# 56. PRINSIP AKHIR DATA DAN API

Data harus diproses sebelum disajikan jika diperlukan.

Frontend harus menerima:

**data yang siap digunakan**

bukan:

**data mentah yang masih membutuhkan banyak pengolahan.**

Prinsip:

SOURCE
→ PROCESS
→ MASTER
→ SUMMARY
→ API
→ UI


---

# 57. ATURAN UNTUK AI

Sebelum membuat integrasi data baru, AI harus menentukan:

1. Apa sumber datanya?
2. Apakah data RAW diperlukan?
3. Bagaimana processing dilakukan?
4. Apa MASTER datanya?
5. Apakah membutuhkan SUMMARY?
6. Spreadsheet mana yang digunakan?
7. Apa API yang diperlukan?
8. Siapa yang memiliki akses?
9. Apakah data sensitif?
10. Apakah membutuhkan audit?
11. Apakah membutuhkan pagination?
12. Bagaimana data digunakan frontend?

AI tidak boleh langsung membuat query atau API tanpa memahami data flow.


---

# 58. KEPUTUSAN DATA SAAT INI

Database tahap awal:

Google Spreadsheet

Backend:

Google Apps Script

Frontend:

GitHub / frontend hosting

Data communication:

API

First module:

CCTV

CCTV database:

Google Spreadsheet khusus CCTV

Credential backend:

Google Apps Script Script Properties

Data architecture:

SOURCE
→ RAW
→ PROCESSING
→ MASTER
→ SUMMARY
→ API
→ FRONTEND

sesuai kebutuhan masing-masing modul.

Manage PC reads the `MASTER REPORT OFFICE` sheet through
`getManagePcSummary` and `getManagePcList`. The list response's `items`
include `divisi` and device inventory fields mapped from columns M–U:
`macAddress`, `serialNumber`, `merk`, `modelKomputer`, `totalRam`,
`totalHardisk`, `kapasitasDriveC`, `kapasitasDriveD`, and `userLogged`.
Frontend callers can retrieve these fields through `loadManagePcList`.


---

# END OF DATA AND API
