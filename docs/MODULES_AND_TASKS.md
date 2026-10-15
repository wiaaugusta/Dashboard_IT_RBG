# MODULES AND TASKS
# MODUL DAN ROADMAP IMPLEMENTASI
# IT TEAM MANAGEMENT & OPERATIONS PLATFORM

Versi: 1.0

Dokumen ini merupakan daftar modul, sub-modul, status pengembangan, prioritas, dan task implementasi platform.

Dokumen ini digunakan sebagai project tracker dan acuan AI ketika mengembangkan fitur baru.

PRINSIP UTAMA:

Jangan mengerjakan semua modul sekaligus.

Kerjakan satu modul sampai fondasinya stabil, kemudian lanjut ke modul berikutnya.


---

# 1. STATUS

Gunakan status berikut:

PLANNED
= sudah direncanakan tetapi belum dikerjakan.

DESIGNING
= sedang menentukan struktur dan desain.

DEVELOPING
= sedang dalam proses development.

TESTING
= sudah dibuat dan sedang diuji.

READY
= sudah siap digunakan.

MAINTENANCE
= sudah digunakan dan hanya membutuhkan maintenance.

BLOCKED
= tertahan karena dependency atau masalah tertentu.


---

# 2. PRIORITAS

Gunakan:

P0
= sangat penting / foundation.

P1
= prioritas utama.

P2
= prioritas berikutnya.

P3
= pengembangan lanjutan.


---

# 3. MODUL UTAMA

Platform memiliki menu utama:

1. Dashboard
2. KPI
3. AHO
4. Manage PC
5. NMS
6. CCTV
7. Checklist

Catatan menu Manage PC:

- Menggabungkan tiga modul PC dalam satu menu admin-only: Kaspersky, ITAM, dan KACE.
- Path: `/manage-pc/kaspersky`, `/manage-pc/itam`, `/manage-pc/kace`.
- Submenu Office/Store diganti tab dalam halaman dengan deep link `?scope=office|store`.
- Akses scope: Admin (office + store), IT Office, IT Store sesuai role.


---

# 4. ROADMAP GLOBAL

Urutan pengembangan utama:

PHASE 1
Foundation
+
Authentication
+
Application Shell
+
CCTV

PHASE 2
Dashboard
+
KPI
+
AHO

PHASE 3
Kaspersky
+
NMS
+
ITAM

PHASE 4
Checklist
+
Project Management
+
Task Management

PHASE 5
Advanced Dashboard
+
Reporting
+
Analytics


---

# 5. FOUNDATION

Priority:
P0

Status:
DEVELOPING


## 5.1 Authentication

Task:

- [ ] Login page
- [ ] NIK input
- [ ] Password input
- [ ] Show / hide password
- [ ] Login validation
- [ ] Loading state
- [ ] Login error state
- [ ] Session handling
- [ ] Logout
- [ ] Role handling
- [ ] Admin authorization
- [ ] IT Store authorization


Credential tahap awal:

Google Apps Script Script Properties.


Role awal:

IT Store
Admin


Catatan:

Password tidak boleh disimpan di frontend.


---

# 6. APPLICATION SHELL

Priority:
P0

Status:
DEVELOPING


Task:

- [ ] Main application layout
- [ ] Sidebar
- [ ] Header
- [ ] Mobile header
- [ ] Navigation drawer
- [ ] User information
- [ ] Logout
- [ ] Responsive layout
- [ ] PWA support
- [ ] Route / page navigation
- [ ] Global loading
- [ ] Global error handling
- [ ] Toast notification


Menu yang belum aktif tetap dapat ditampilkan sebagai placeholder jika diperlukan.


---

# 7. DASHBOARD

Priority:
P1

Status:
PLANNED


Dashboard merupakan halaman utama setelah login.


Task awal:

- [ ] Dashboard layout
- [ ] Welcome section
- [ ] Summary cards
- [ ] KPI summary
- [ ] AHO summary
- [ ] Kaspersky summary
- [ ] NMS summary
- [ ] ITAM summary
- [ ] CCTV summary
- [ ] Checklist summary
- [ ] Alert / issue section
- [ ] Recent activity
- [ ] Responsive dashboard


Dashboard awal boleh menggunakan data placeholder.

Data sebenarnya dihubungkan secara bertahap.


---

# 8. KPI

Priority:
P1

Status:
PLANNED


Fungsi:

Monitoring KPI Team IT.


Task:

- [ ] KPI overview
- [ ] KPI summary
- [ ] Achievement
- [ ] Target
- [ ] Percentage
- [ ] Trend
- [ ] Detail KPI
- [ ] Period filter
- [ ] Dashboard integration


Data source akan ditentukan saat modul mulai dikembangkan.


---

# 9. AHO

Priority:
P1

Status:
PLANNED


AHO memiliki dua sub-modul utama:

1. SLA AHO Store
2. SLA Form Hardware


---

## 9.1 SLA AHO STORE

Task:

- [ ] Overview
- [ ] Total ticket
- [ ] Open
- [ ] Closed
- [ ] Overdue
- [ ] SLA percentage
- [ ] Filter
- [ ] Search
- [ ] Detail
- [ ] Dashboard summary


---

## 9.2 SLA FORM HARDWARE

Task:

- [ ] Overview
- [ ] Form status
- [ ] Processing status
- [ ] SLA
- [ ] Overdue
- [ ] Filter
- [ ] Search
- [ ] Detail
- [ ] Dashboard summary


---

# 10. KASPERSKY

Priority:
P2

Status:
PLANNED


Sub-modul:

- Office
- Store


Task:

- [ ] Overview
- [ ] Device status
- [ ] Protection status
- [ ] Online / offline
- [ ] Issue / alert
- [ ] Search
- [ ] Filter
- [ ] Detail
- [ ] Dashboard summary


---

# 11. NMS

Priority:
P2

Status:
PLANNED


Fungsi:

Network Monitoring System.


Task:

- [ ] Overview
- [ ] Device status
- [ ] Online
- [ ] Offline
- [ ] Alert
- [ ] Availability
- [ ] Search
- [ ] Filter
- [ ] Device detail
- [ ] Dashboard summary


---

# 12. ITAM

Priority:
P2

Status:
PLANNED


Sub-modul:

- Office
- Store


Fungsi:

IT Asset Management.


Task:

- [ ] Asset overview
- [ ] Asset list
- [ ] Asset detail
- [ ] Asset status
- [ ] Store / Office
- [ ] Asset category
- [ ] Search
- [ ] Filter
- [ ] Asset history
- [ ] Dashboard summary


Tahap berikutnya dapat ditambahkan:

- [ ] Asset assignment
- [ ] Asset movement
- [ ] Asset maintenance
- [ ] Asset lifecycle


---

# 13. CCTV

Priority:
P0

Status:
DEVELOPING


CCTV adalah modul pertama yang benar-benar diimplementasikan.


## 13.1 CCTV OBJECTIVE

Menyediakan satu tempat untuk Team IT melakukan:

- melihat data CCTV
- mencari store
- melihat URL
- melakukan update URL
- melakukan update password jika diperlukan
- monitoring status
- mencatat perubahan


---

## 13.2 CCTV FRONTEND

Task:

- [ ] CCTV page
- [ ] CCTV summary
- [ ] Search store
- [ ] Filter
- [ ] CCTV table
- [ ] Store detail
- [ ] Edit CCTV
- [ ] Update URL
- [ ] Update password
- [ ] Save
- [ ] Cancel
- [ ] Loading state
- [ ] Success notification
- [ ] Error notification
- [ ] Empty state
- [ ] Responsive mobile layout


---

## 13.3 CCTV BACKEND

Task:

- [ ] CCTV API
- [ ] Get CCTV data
- [ ] Get CCTV detail
- [ ] Update CCTV
- [ ] Validate request
- [ ] Authentication check
- [ ] Authorization check
- [ ] Error handling
- [ ] Audit logging


---

## 13.4 CCTV DATABASE

Database:

Google Spreadsheet khusus CCTV.


Data yang digunakan mengikuti struktur existing spreadsheet.

Jangan mengubah struktur kolom existing secara sembarangan karena spreadsheet dapat digunakan oleh sistem lain.


NIK dapat ditempatkan pada kolom yang sudah disiapkan / ditentukan tanpa mengganggu struktur existing.


---

## 13.5 CCTV SECURITY

Credential aplikasi:

Google Apps Script Script Properties.


Credential user awal:

IT Store
→ NIK + password masing-masing

Admin
→ credential admin


Password tidak boleh:

- ditulis di frontend
- ditulis di GitHub
- ditulis di HTML
- ditulis di JavaScript frontend
- ditampilkan pada console
- dikirim ke log


---

## 13.6 CCTV AUDIT

Jika user melakukan perubahan, sistem dapat mencatat:

- NIK
- action
- store
- field
- timestamp
- result


Contoh:

15033901
UPDATE_CCTV
2AZ1
URL
2026-08-25 15:00
SUCCESS


Untuk password, jangan menyimpan password asli pada audit log.


---

# 14. CHECKLIST

Priority:
P2

Status:
PLANNED


Sub-modul:

- Office
- Store


Task:

- [ ] Checklist dashboard
- [ ] Checklist list
- [ ] Checklist detail
- [ ] Checklist completion
- [ ] Checklist status
- [ ] Search
- [ ] Filter
- [ ] History
- [ ] Dashboard summary


Tahap berikutnya:

- [ ] Checklist template
- [ ] Recurring checklist
- [ ] Due date
- [ ] PIC
- [ ] Reminder


---

# 15. PROJECT MANAGEMENT

Priority:
P3

Status:
PLANNED


Fitur masa depan:

- [ ] Project list
- [ ] Project detail
- [ ] Project status
- [ ] Project owner
- [ ] PIC
- [ ] Start date
- [ ] Due date
- [ ] Progress
- [ ] Task
- [ ] Priority
- [ ] Attachment
- [ ] Activity history


---

# 16. TASK MANAGEMENT

Priority:
P3

Status:
PLANNED


Task:

- [ ] Task list
- [ ] Create task
- [ ] Assign PIC
- [ ] Due date
- [ ] Priority
- [ ] Status
- [ ] Progress
- [ ] Comment
- [ ] History


Status contoh:

TODO
IN PROGRESS
BLOCKED
DONE


---

# 17. REPORTING

Priority:
P3

Status:
PLANNED


Fitur:

- [ ] Report dashboard
- [ ] Daily report
- [ ] Weekly report
- [ ] Monthly report
- [ ] Export
- [ ] Filter periode
- [ ] Summary
- [ ] Detail


Format dapat berkembang menjadi:

- PDF
- Excel
- CSV
- PNG


---

# 18. NOTIFICATION

Priority:
P3

Status:
PLANNED


Fitur masa depan:

- [ ] Notification center
- [ ] Alert
- [ ] Reminder
- [ ] SLA warning
- [ ] Project deadline
- [ ] Checklist reminder


Channel dapat berkembang menjadi:

- in-app
- email
- WhatsApp
- notification lainnya


Jangan mengimplementasikan channel tambahan sebelum memang diperlukan.


---

# 19. USER MANAGEMENT

Priority:
P2

Status:
PLANNED


Tahap awal hanya:

Admin
IT Store


Tahap berikutnya dapat mendukung:

- [ ] User list
- [ ] User status
- [ ] Role
- [ ] Permission
- [ ] Reset credential
- [ ] User activity


User management tidak perlu dibuat kompleks pada tahap awal.


---

# 20. ROLE DAN PERMISSION

Role awal:

ADMIN

dan

IT_STORE


ADMIN:

- melihat dashboard
- melihat seluruh modul
- melakukan management sesuai permission
- monitoring
- konfigurasi


IT_STORE:

- melihat modul yang diperlukan
- melakukan update yang diizinkan
- monitoring
- menjalankan operational task


Permission harus diverifikasi oleh backend.


---

# 21. GLOBAL SEARCH

Priority:
P3

Status:
PLANNED


Masa depan aplikasi dapat memiliki search global.

Contoh:

Cari:

2AZ1


Hasil:

Store
CCTV
Asset
AHO
Checklist
Project


Fitur ini hanya dibuat setelah struktur data lintas modul stabil.


---

# 22. ACTIVITY / AUDIT CENTER

Priority:
P3

Status:
PLANNED


Menampilkan aktivitas penting:

- login
- update data
- perubahan konfigurasi
- project update
- checklist completion
- asset movement


Fitur ini dapat menjadi pusat audit platform.


---

# 23. MODULE DEPENDENCY

Dependency utama:

Foundation
↓
Authentication
↓
Application Shell
↓
CCTV


Setelah foundation stabil:

Dashboard
↓
KPI
↓
AHO


Kemudian:

Kaspersky
↓
NMS
↓
ITAM


Kemudian:

Checklist
↓
Project
↓
Task


---

# 24. DEVELOPMENT ORDER

Urutan pengerjaan yang direkomendasikan:

STEP 1
Project documentation

STEP 2
Authentication

STEP 3
Application Shell

STEP 4
Responsive / PWA foundation

STEP 5
CCTV Backend

STEP 6
CCTV Frontend

STEP 7
CCTV Testing

STEP 8
Dashboard foundation

STEP 9
KPI

STEP 10
AHO

STEP 11
Kaspersky

STEP 12
NMS

STEP 13
ITAM

STEP 14
Checklist

STEP 15
Project Management

STEP 16
Reporting / Analytics


Urutan dapat berubah berdasarkan kebutuhan bisnis.


---

# 25. DEFINITION OF DONE

Sebuah modul tidak dianggap selesai hanya karena halaman sudah tampil.

Modul dianggap DONE jika:

- [ ] UI selesai
- [ ] responsive
- [ ] API selesai
- [ ] database terhubung
- [ ] authentication selesai
- [ ] authorization selesai
- [ ] loading state tersedia
- [ ] error state tersedia
- [ ] empty state tersedia
- [ ] validation tersedia
- [ ] testing selesai
- [ ] tidak ada credential di frontend
- [ ] dokumentasi modul tersedia


---

# 26. TESTING CHECKLIST

Setiap modul minimal diuji pada:

Desktop:

- Chrome
- Edge

Mobile:

- Android Chrome
- PWA mode


Test:

- [ ] Login
- [ ] Logout
- [ ] Permission
- [ ] Data loading
- [ ] Search
- [ ] Filter
- [ ] Create
- [ ] Update
- [ ] Delete jika tersedia
- [ ] Error
- [ ] Empty state
- [ ] Network failure
- [ ] Responsive


---

# 27. MODULE DOCUMENTATION

Setiap modul kompleks dapat memiliki dokumentasi sendiri.

Contoh:

docs/
└── modules/
    ├── CCTV.md
    ├── AHO.md
    ├── KPI.md
    ├── ITAM.md
    └── CHECKLIST.md


Namun dokumentasi module hanya dibuat ketika module mulai dikerjakan.

Tidak perlu membuat seluruh dokumentasi modul dari awal.


---

# 28. GITHUB STRUCTURE

Struktur frontend yang direncanakan:

/
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
│   ├── api.js
│   ├── auth.js
│   ├── ui.js
│   │
│   └── modules/
│       ├── dashboard.js
│       ├── cctv.js
│       ├── kpi.js
│       ├── aho.js
│       ├── kaspersky.js
│       ├── nms.js
│       ├── itam.js
│       └── checklist.js
│
├── assets/
│   ├── icons/
│   └── images/
│
└── docs/
    ├── PROJECT_OVERVIEW.md
    ├── PROJECT_CONSTITUTION.md
    ├── ARCHITECTURE.md
    ├── DATA_AND_API.md
    ├── UI_AND_DESIGN.md
    └── MODULES_AND_TASKS.md


Struktur dapat berubah jika project berkembang.


---

# 29. BACKEND STRUCTURE

Google Apps Script dapat menggunakan struktur:

/
├── Code.gs
├── Config.gs
├── Auth.gs
├── Api.gs
├── Utils.gs
│
└── Modules/
    ├── CCTV.gs
    ├── KPI.gs
    ├── AHO.gs
    ├── Kaspersky.gs
    ├── NMS.gs
    ├── ITAM.gs
    └── Checklist.gs


Tidak semua file harus dibuat sejak awal.

Buat file ketika memang dibutuhkan.


---

# 30. CURRENT SPRINT

Modul yang sedang dikerjakan:

CCTV


Task aktif:

- [ ] Finalize project documentation
- [ ] Setup GitHub repository
- [ ] Setup frontend structure
- [ ] Setup Apps Script backend
- [ ] Setup Script Properties
- [ ] Setup authentication
- [ ] Setup session
- [ ] Setup role
- [ ] Setup application shell
- [ ] Setup responsive layout
- [ ] Setup PWA foundation
- [ ] Connect CCTV Google Spreadsheet
- [ ] Create CCTV API
- [ ] Create CCTV page
- [ ] Create CCTV table
- [ ] Create CCTV update form
- [ ] Create audit log
- [ ] Test desktop
- [ ] Test mobile
- [ ] Test PWA


---

# 31. CURRENT MODULE STATUS

| Module | Priority | Status |
|---|---|---|
| Foundation | P0 | DEVELOPING |
| Authentication | P0 | DEVELOPING |
| Application Shell | P0 | DEVELOPING |
| Dashboard | P1 | PLANNED |
| KPI | P1 | PLANNED |
| AHO | P1 | PLANNED |
| Kaspersky | P2 | PLANNED |
| NMS | P2 | PLANNED |
| ITAM | P2 | PLANNED |
| CCTV | P0 | DEVELOPING |
| Checklist | P2 | PLANNED |
| Project Management | P3 | PLANNED |
| Task Management | P3 | PLANNED |
| Reporting | P3 | PLANNED |
| Notification | P3 | PLANNED |
| User Management | P2 | PLANNED |
| Global Search | P3 | PLANNED |
| Audit Center | P3 | PLANNED |


---

# 32. CHANGE MANAGEMENT

Jika terdapat perubahan besar pada module:

1. Dokumentasikan perubahan.
2. Periksa dependency.
3. Periksa database.
4. Periksa API.
5. Periksa frontend.
6. Periksa module lain.
7. Test.
8. Update dokumentasi.


Jangan mengubah architecture hanya karena sebuah module membutuhkan sedikit perubahan.


---

# 33. ATURAN UNTUK AI

Ketika diminta mengerjakan fitur baru:

1. Baca PROJECT_OVERVIEW.md.
2. Baca PROJECT_CONSTITUTION.md.
3. Baca ARCHITECTURE.md.
4. Baca DATA_AND_API.md.
5. Baca UI_AND_DESIGN.md.
6. Baca MODULES_AND_TASKS.md.
7. Identifikasi module terkait.
8. Periksa dependency.
9. Jangan mengubah module lain tanpa alasan.
10. Kerjakan task yang diminta.
11. Update status task jika diperlukan.
12. Jangan membuat fitur yang belum diminta.
13. Jangan membuat database baru jika database existing masih sesuai.
14. Jangan membuat library baru tanpa alasan.
15. Jangan memasukkan credential ke frontend atau repository.


---

# 34. ATURAN KHUSUS UNTUK MODUL BARU

Sebelum membuat module baru, tentukan:

- nama module
- tujuan
- user
- source data
- database
- API
- permission
- UI
- dependency
- priority
- task
- definition of done


Setelah jelas, baru implementasi.


---

# 35. ATURAN KHUSUS UNTUK MODUL KOMPLEKS

Jika sebuah module memiliki kompleksitas tinggi, module dapat memiliki:

- Google Spreadsheet sendiri
- Apps Script logic sendiri
- API sendiri
- processing sendiri
- master data sendiri


Namun tetap harus mengikuti:

GLOBAL AUTHENTICATION
+
GLOBAL DESIGN SYSTEM
+
GLOBAL APPLICATION SHELL


Dengan demikian backend/data dapat modular tanpa membuat frontend terasa berbeda.


---

# 36. PRINSIP MODULARITAS

Setiap module harus sebisa mungkin berdiri sendiri.

Contoh:

CCTV

Frontend:
cctv.js

Backend:
CCTV.gs

Database:
CCTV Spreadsheet


AHO:

Frontend:
aho.js

Backend:
AHO.gs

Database:
AHO Spreadsheet


Namun semuanya tetap menggunakan platform yang sama.


---

# 37. PRINCIPLE: BUILD SMALL, INTEGRATE LATER

Jangan membuat seluruh platform sekaligus.

Contoh yang benar:

CCTV
↓
Stabil
↓
Integrasikan ke Dashboard
↓
AHO
↓
Integrasikan ke Dashboard
↓
KPI
↓
dan seterusnya.


Dengan pendekatan ini, setiap module dapat diuji sebelum menjadi bagian platform yang lebih besar.


---

# 38. FINAL ROADMAP

FOUNDATION
│
├── Authentication
├── Application Shell
├── Responsive
└── PWA
        │
        ▼
      CCTV
        │
        ▼
    DASHBOARD
        │
        ├── KPI
        └── AHO
              │
              ▼
       INFRASTRUCTURE
        ├── Kaspersky
        ├── NMS
        └── ITAM
              │
              ▼
        OPERATIONS
        └── Checklist
              │
              ▼
       WORK MANAGEMENT
        ├── Project
        └── Task
              │
              ▼
       ADVANCED PLATFORM
        ├── Reporting
        ├── Analytics
        ├── Notification
        ├── Global Search
        └── Audit Center


---

# 39. CURRENT PRIORITY

Untuk saat ini, jangan mengembangkan module lain.

Fokus:

AUTHENTICATION
↓
APPLICATION SHELL
↓
CCTV
↓
TESTING


Setelah CCTV stabil, baru lanjut ke dashboard dan module berikutnya.


---

# END OF MODULES AND TASKS
