# SLA AHO STORE MODULE SPECIFICATION
# IT TEAM MANAGEMENT & OPERATIONS PLATFORM

Versi: 0.2

Status:
BACKEND + DASHBOARD PARENT AHO

Priority:
P1

Module:
SLA AHO Store (Store)

---

# 1. TUJUAN MODUL

Modul SLA AHO Store memonitor pencapaian SLA tiket AHO di lingkup Store.
Menu ini baru untuk role Store (ADMIN dan IT_STORE).

Fungsi yang direncanakan:

- overview SLA AHO Store
- total ticket, open, closed, overdue
- SLA percentage
- filter, search, detail
- dashboard summary

---

# 2. SUMBER DATA

Tab `MASTER SLA STORE` berisi tiga blok tabel:

| Tabel | Range | Kolom |
| --- | --- | --- |
| SLA AHO STORE | `B2:N500` | 13 |
| SLA AHO ALL | `R2:AG10000` | 16 |
| PENDING AHO | `AK2:AT100` | 10 |

Header berada di dalam range dan dideteksi otomatis (baris dengan sel terisi
terbanyak pada 10 baris pertama), sehingga header di baris 1 maupun 2 sama-sama
dikenali. Baris kosong setelah header dilewati.

---

# 3. KONFIGURASI

Script Properties:

| Key | Wajib | Default |
| --- | --- | --- |
| `SPREADSHEET_MANAGE_PC_ID` | ya | — |
| `SLA_STORE_SHEET_NAME` | tidak | `MASTER SLA STORE` |

---

# 4. API

| Action | Tabel |
| --- | --- |
| `getSlaAhoStore` | SLA AHO STORE (`B2:N500`) |
| `getSlaAhoAll` | SLA AHO ALL (`R2:AG10000`) |
| `getSlaPendingAho` | PENDING AHO (`AK2:AT100`) |

- Auth: session valid, role `ADMIN` atau `IT_STORE`.
- Request: `{ action, sessionToken, refresh? }`.
- Response: `api: "sla-v1"`, `module: "sla"`, `table` berisi
  `range`, `readRange`, `headerRow`, `headers`, `headerKeys`, `items`, `total`.
- Item memakai key camelCase dari header; `__row` = nomor baris spreadsheet.
- Cache server 10 menit per tabel (chunked `CacheService`); `refresh: true`
  memaksa baca ulang.

Detail kontrak lengkap ada di `docs/DATA_AND_API.md` bagian SLA AHO STORE.

---

# 5. DASHBOARD PARENT AHO

Parent `/aho` menampilkan SLA AHO Store dari action `getSlaAhoStore`.
Dashboard menyediakan filter tahun dan bulan multi-select; KPI mengikuti
bulan terpilih, sedangkan tabel merinci setiap tanggal berdasarkan
`tglTerima`. `waktuPenyelesaian` adalah durasi pecahan hari (`0.0125` hari =
18 menit); total dan rata-rata dihitung dari nilai durasi valid. Hari tanpa
tiket tetap ditampilkan dengan total problem `0`.

Frontend cache dimiliki per `role|NIK` selama sesi dan request simultan
dideduplikasi. Akses tetap dibatasi backend ke `ADMIN` dan `IT_STORE`.
Submenu AHO lain dan action `getSlaAhoAll`/`getSlaPendingAho` tidak berubah.

---

# 6. STATUS

- [x] Backend pembacaan AHO Store, AHO All, dan Pending AHO + cache + auth
- [x] Dashboard parent AHO: filter tahun/bulan multi-select, KPI, dan rincian harian
- [ ] Detail tiket/search/sort pada submenu (di luar cakupan dashboard parent)
