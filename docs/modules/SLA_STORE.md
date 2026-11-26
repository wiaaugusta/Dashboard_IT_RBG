# SLA AHO STORE MODULE SPECIFICATION
# IT TEAM MANAGEMENT & OPERATIONS PLATFORM

Versi: 0.1

Status:
BACKEND

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

Tab `MASTER SLA STORE` berisi dua blok tabel berdampingan:

| Tabel | Range | Kolom |
| --- | --- | --- |
| SLA AHO STORE | `B2:N500` | 13 |
| SLA AHO ALL | `R2:AG10000` | 16 |

Header berada di dalam range dan dideteksi otomatis (baris dengan sel terisi
terbanyak pada 10 baris pertama), sehingga header di baris 1 maupun 2 sama-sama
dikenali. Baris kosong setelah header dilewati.

---

# 3. KONFIGURASI

Script Properties:

| Key | Wajib | Default |
| --- | --- | --- |
| `SPREADSHEET_SLA_STORE_ID` | tidak | `SPREADSHEET_MANAGE_PC_ID` |
| `SLA_STORE_SHEET_NAME` | tidak | `MASTER SLA STORE` |

---

# 4. API

| Action | Tabel |
| --- | --- |
| `getSlaStoreAhoStore` | SLA AHO STORE (`B2:N500`) |
| `getSlaStoreAhoAll` | SLA AHO ALL (`R2:AG10000`) |

- Auth: session valid, role `ADMIN` atau `IT_STORE`.
- Request: `{ action, sessionToken, refresh? }`.
- Response: `api: "sla-store-v1"`, `module: "sla-store"`, `table` berisi
  `range`, `readRange`, `headerRow`, `headers`, `headerKeys`, `items`, `total`.
- Item memakai key camelCase dari header; `__row` = nomor baris spreadsheet.
- Cache server 10 menit per tabel (chunked `CacheService`); `refresh: true`
  memaksa baca ulang.

Detail kontrak lengkap ada di `docs/DATA_AND_API.md` bagian SLA AHO STORE.

---

# 5. STATUS

- [x] Backend pembacaan dua range + cache + auth
- [ ] Frontend menu & halaman
- [ ] Ringkasan/agregasi SLA
- [ ] Search, sort, pagination
- [ ] Detail tiket
