# PROJECT OVERVIEW
# IT TEAM MANAGEMENT & OPERATIONS PLATFORM

## 1. Gambaran Umum

Project ini adalah aplikasi internal untuk Team IT yang dirancang sebagai satu platform terpusat untuk membantu pekerjaan operasional, monitoring, project management, KPI, dan berbagai kebutuhan IT lainnya.

Aplikasi akan dikembangkan secara bertahap dan modular.

Tujuan utamanya adalah menyediakan satu portal yang dapat digunakan oleh Team IT untuk:

- melihat dashboard pekerjaan
- memantau KPI
- memantau SLA
- memantau pekerjaan dan project
- melihat pekerjaan yang belum selesai
- melakukan update data
- melakukan monitoring
- mengelola informasi operasional
- melihat laporan
- mengakses berbagai tools IT

Aplikasi ini bukan hanya aplikasi CCTV.

CCTV adalah modul pertama yang akan benar-benar dikembangkan dan digunakan.

Ke depannya aplikasi akan terus bertambah sesuai kebutuhan Team IT.


---

# 2. Visi Project

Visi utama project adalah membangun sebuah:

**IT Team Management & Operations Platform**

yang menjadi satu pintu untuk berbagai aktivitas Team IT.

Aplikasi diharapkan dapat berkembang dari sekadar aplikasi monitoring menjadi sebuah platform yang mampu membantu:

- monitoring
- pekerjaan harian
- project
- task
- KPI
- SLA
- asset management
- security monitoring
- network monitoring
- CCTV management
- checklist
- reporting


---

# 3. Target Pengguna

Target utama aplikasi adalah:

### 3.1 Team IT Store

Digunakan untuk:

- pekerjaan IT Store
- update data
- monitoring
- CCTV
- checklist
- pekerjaan operasional
- project

### 3.2 Admin / Koordinator

Digunakan untuk:

- monitoring Team IT
- melihat dashboard
- melihat progress
- melihat KPI
- melihat project
- melihat pekerjaan yang belum selesai
- melihat laporan

Role dan hak akses dapat dikembangkan lebih lanjut sesuai kebutuhan.


---

# 4. Platform

Aplikasi harus dapat digunakan pada:

- Desktop
- Laptop
- Tablet
- Smartphone

Aplikasi menggunakan pendekatan:

**Responsive Web Application + Progressive Web App (PWA)**

Satu aplikasi dan satu codebase digunakan untuk desktop maupun mobile.

Tidak membuat aplikasi desktop dan mobile secara terpisah.


---

# 5. Konsep Desktop dan Mobile

## Desktop

Pada desktop aplikasi dapat menggunakan:

- sidebar
- top navigation
- dashboard cards
- tabel
- grafik
- panel informasi
- filter
- detail data

Desktop digunakan untuk pekerjaan yang membutuhkan tampilan informasi lebih lengkap.


## Mobile

Pada mobile aplikasi harus lebih compact dan touch-friendly.

Dapat menggunakan:

- hamburger menu
- drawer
- bottom navigation jika diperlukan
- card
- list
- responsive table
- tombol yang mudah disentuh

Tampilan mobile bukan sekadar mengecilkan tampilan desktop.

UX mobile harus dirancang agar nyaman digunakan pada layar kecil.


---

# 6. Modul Aplikasi

Menu utama minimal yang direncanakan:

## Dashboard

Dashboard utama aplikasi.

Menampilkan ringkasan dari berbagai modul.

Contoh informasi yang nantinya dapat ditampilkan:

- KPI
- progress project
- task
- SLA
- alert
- pekerjaan overdue
- status CCTV
- status Kaspersky
- status NMS
- status ITAM
- status checklist

Dashboard akan berkembang seiring bertambahnya modul.


---

## KPI

Modul KPI digunakan untuk:

- KPI individu
- KPI Team IT
- target
- pencapaian
- achievement
- progress
- trend
- evaluasi

Pada tahap awal modul KPI belum perlu memiliki data.


---

## AHO

Modul AHO memiliki submenu:

### SLA AHO STORE

Digunakan untuk monitoring SLA AHO Store.

Contoh informasi:

- total ticket
- open
- closed
- overdue
- SLA achievement
- resolution time
- store
- PIC
- status


### SLA FORM HARDWARE

Digunakan untuk monitoring SLA Form Hardware.

Contoh informasi:

- total request
- open
- closed
- overdue
- SLA achievement
- hardware
- store/office
- PIC
- status


---

## Manage PC

Menu utama **Manage PC** menggabungkan tiga modul pengelolaan PC:
**Kaspersky**, **ITAM**, dan **KACE**. Semuanya hanya untuk login ADMIN.

Perbedaan lingkup **Office** dan **Store** tidak lagi menjadi submenu
sidebar - keduanya menjadi **tab di dalam halaman** masing-masing modul
(pola dashboard modern) supaya sidebar tetap ringkas.

### Kaspersky

Tab Office / Store di dalam halaman Kaspersky.

Monitoring perangkat Kaspersky di Office / Store.

Informasi yang nantinya dapat ditampilkan:

- total device
- protected
- unprotected
- outdated
- offline
- threat
- last update
- compliance

### ITAM

Tab Office / Store di dalam halaman ITAM.

Asset IT Office / Asset IT Store.
- Memastikan data termanage semua dan privilege sesuai. 
- Database dari Gsheet 

Informasi yang nantinya dapat dikelola:

- asset
- laptop
- PC
- printer
- network device
- hardware
- asset owner
- location
- status
- lifecycle
- warranty
- assignment

### KACE

Tab Office / Store di dalam halaman KACE.

Deployment & otomasi perangkat PC.

Informasi yang nantinya dapat dikelola:

- deployment OS & aplikasi
- inventory agent & scripting
- konfigurasi & antrian service perangkat


---

## NMS

Modul NMS digunakan untuk monitoring network.

Informasi yang nantinya dapat ditampilkan:

- device
- online
- offline
- alert
- uptime
- downtime
- store
- network device
- critical issue


---

## CCTV

CCTV merupakan:

**MODUL PERTAMA YANG AKAN DIIMPLEMENTASIKAN SECARA PENUH.**

Fitur awal:

- login IT
- daftar CCTV
- pencarian store
- detail CCTV
- membuka CCTV
- update URL
- update username
- update password
- menyimpan perubahan
- timestamp
- user yang melakukan update
- validasi
- notifikasi success/error
- audit/log update jika diperlukan

CCTV menggunakan Google Spreadsheet khusus CCTV sebagai sumber database pada tahap awal.

Backend menggunakan Google Apps Script.


---

## Checklist

Modul Checklist memiliki submenu:

### Office

Checklist pekerjaan IT Office.

### Store

Checklist pekerjaan IT Store.

Nantinya dapat digunakan untuk:

- checklist rutin
- status pekerjaan
- PIC
- timestamp
- progress
- history
- compliance


---

# 7. Daftar Modul dan Status Awal

| Modul | Status Awal |
|---|---|
| Dashboard | Foundation |
| KPI | Placeholder |
| AHO | Placeholder |
| Manage PC (Kaspersky, ITAM, KACE) | Placeholder |
| NMS | Placeholder |
| CCTV | Implementasi Pertama |
| Checklist | Placeholder |

Placeholder berarti menu dan halaman sudah tersedia tetapi belum memiliki fungsi/data utama.


---

# 8. Konsep Pengembangan Modular

Setiap modul harus dibuat secara modular.

Contoh:

Dashboard tidak boleh bergantung secara langsung pada struktur internal CCTV.

Modul CCTV dapat berkembang sendiri tanpa merusak:

- KPI
- AHO
- Kaspersky
- NMS
- ITAM
- Checklist

Begitu juga modul lainnya.


---

# 9. Konsep Backend

Backend utama pada tahap awal menggunakan:

**Google Apps Script**

Google Apps Script digunakan sebagai API/backend layer.

Frontend tidak mengakses Google Spreadsheet secara langsung.

Arsitektur dasar:

Frontend
↓
Google Apps Script API
↓
Google Spreadsheet


---

# 10. Konsep Database

Google Spreadsheet digunakan sebagai database pada tahap awal.

Tidak semua modul harus menggunakan satu spreadsheet.

Jika modul memiliki kompleksitas tinggi, modul tersebut dapat memiliki spreadsheet sendiri.

Contoh:

CCTV
→ Google Spreadsheet CCTV

AHO
→ dapat menggunakan spreadsheet operasional

KPI
→ dapat menggunakan spreadsheet KPI

Project
→ dapat menggunakan spreadsheet Project

Modul yang sederhana dan memiliki sumber data yang sama dapat menggunakan spreadsheet yang sama.

Prinsipnya adalah:

**Pisahkan database berdasarkan kebutuhan dan kompleksitas, bukan berdasarkan aturan bahwa setiap menu harus memiliki spreadsheet sendiri.**


---

# 11. Konsep Data

Untuk modul yang membutuhkan pengolahan data, gunakan konsep:

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
APPLICATION


## SOURCE

Data berasal dari:

- dashboard
- sistem lain
- API
- database
- Oracle
- Google Spreadsheet
- input user


## RAW

Data mentah yang diterima dari sumber.

Data RAW sebaiknya tidak banyak dimodifikasi agar dapat digunakan sebagai sumber pemeriksaan.


## MASTER

Data yang telah:

- dibersihkan
- distandarkan
- dimapping
- divalidasi
- diolah

MASTER adalah data yang siap digunakan oleh aplikasi.


## SUMMARY

Data hasil agregasi untuk kebutuhan dashboard.

Contoh:

- total
- selesai
- belum selesai
- overdue
- progress
- SLA percentage


## APPLICATION

Frontend mengambil data melalui API dan menampilkan informasi kepada pengguna.


---

# 12. Prinsip Frontend

Frontend harus:

- modular
- responsive
- ringan
- mudah dirawat
- mudah dikembangkan
- tidak bergantung langsung pada database
- tidak menyimpan credential rahasia

HTML, CSS, dan JavaScript harus dipisahkan.

Hindari membuat satu file HTML atau JavaScript yang sangat besar.


---

# 13. Prinsip PWA

Aplikasi dipersiapkan untuk menjadi Progressive Web App.

Target awal PWA:

- dapat di-install
- memiliki icon
- memiliki manifest
- memiliki service worker
- dapat dibuka dalam mode standalone
- responsive
- memiliki pengalaman seperti aplikasi mobile

Offline mode penuh bukan prioritas tahap pertama.

Prioritas pertama adalah:

**responsive + installable + app-like experience.**


---

# 14. Prinsip Security

Credential dan secret tidak boleh disimpan di:

- HTML
- CSS
- JavaScript frontend
- GitHub
- file public
- dokumentasi project

Credential yang bersifat rahasia disimpan di backend, misalnya menggunakan:

**Google Apps Script Script Properties**

Authorization harus tetap divalidasi oleh backend.

Frontend tidak boleh menjadi satu-satunya lapisan security.


---

# 15. Prinsip UI/UX

Tampilan aplikasi harus:

- modern
- premium
- clean
- ringan
- profesional
- corporate
- minimal
- mudah dipahami
- nyaman digunakan dalam waktu lama

Gaya visual yang diutamakan:

- putih
- off-white
- light gray
- satu warna utama sebagai accent
- shadow ringan
- border halus
- rounded corner secukupnya

Hindari:

- terlalu banyak warna
- gradient berlebihan
- animasi berlebihan
- card berlebihan
- glassmorphism berat
- layout yang terlalu padat


---

# 16. Prinsip Pengembangan

Project dikembangkan secara bertahap.

Urutan awal:

### Phase 1

Foundation:

- repository
- dokumentasi
- architecture
- UI system
- login
- authentication
- application shell
- navigation
- responsive
- PWA foundation


### Phase 2

CCTV:

- backend
- Google Spreadsheet
- API
- list
- search
- detail
- update
- logging


### Phase 3

Dashboard:

- dashboard shell
- summary cards
- widget system


### Phase berikutnya

Pengembangan:

- AHO
- Kaspersky
- NMS
- ITAM
- Checklist
- KPI
- Project Management
- Task Management
- Report


---

# 17. Prinsip Utama Project

Project harus mengikuti prinsip:

**Modular > Monolithic**

**Maintainable > Fancy**

**Simple > Complex**

**Fast > Heavy**

**Secure > Convenient**

**Responsive > Desktop-only**

**Reusable > Duplicate Code**

Jangan membuat solusi yang hanya cocok untuk CCTV.

CCTV adalah modul pertama.

Aplikasi harus tetap memiliki fondasi yang memungkinkan modul baru ditambahkan tanpa melakukan rewrite besar.


---

# 18. Kondisi Project Saat Ini

Pada saat dokumen ini dibuat:

- aplikasi masih dalam tahap perancangan
- belum ada implementasi frontend final
- belum ada implementasi dashboard final
- CCTV adalah modul pertama yang akan dibuat
- modul lain harus sudah disiapkan secara struktur tetapi boleh kosong
- arsitektur harus dipikirkan untuk jangka panjang

Dokumen ini akan menjadi referensi dasar untuk seluruh pengembangan project.
