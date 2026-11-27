const MONTHS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Agu" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Okt" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Des" }
];

const MONTH_LOOKUP = new Map([
  ["jan", 1], ["january", 1],
  ["feb", 2], ["february", 2],
  ["mar", 3], ["march", 3],
  ["apr", 4], ["april", 4],
  ["may", 5], ["mei", 5],
  ["jun", 6], ["june", 6],
  ["jul", 7], ["july", 7],
  ["aug", 8], ["agu", 8], ["agustus", 8], ["august", 8],
  ["sep", 9], ["september", 9],
  ["oct", 10], ["okt", 10], ["oktober", 10], ["october", 10],
  ["nov", 11], ["november", 11],
  ["dec", 12], ["des", 12], ["desember", 12], ["december", 12]
]);

const DATE_FIELD_NAMES = new Set(["tglterima", "tanggalterima"]);
const DURATION_FIELD_NAMES = new Set(["waktupenyelesaian"]);
const DETAIL_FIELDS = [
  {
    key: "storeCode",
    label: "Kode Toko",
    names: new Set(["kodetoko", "kodestore", "kodeoutlet", "storecode", "outletcode"])
  },
  {
    key: "storeName",
    label: "Nama Toko",
    names: new Set(["namatoko", "namastore", "namaoutlet", "storename", "outletname"])
  },
  {
    key: "responsible",
    label: "Nama Penanggung",
    names: new Set(["namapenanggung", "namapenanggungjawab", "penanggungjawab", "namapic", "picname", "personincharge"])
  },
    {
      key: "issue",
      label: "Masalah",
      names: new Set(["masalah", "issue", "keterangan", "deskripsi", "problem"])
    },
    {
      key: "durationMinutes",
      label: "Waktu Penyelesaian",
      names: new Set(["waktupenyelesaian", "waktupenyelesaianit", "durasi", "duration"])
    },
    {
      key: "targetDays",
      label: "Target Hari",
      names: new Set(["targethari", "target", "targetsla", "targethari"])
    },
    {
      key: "achievement",
      label: "Ach SLA",
      names: new Set(["achsla", "achslaachievement", "achievementsla", "slaachievement", "slaachievementpercentage", "pencapaiansla"])
    }
  ];

export function getAhoSlaMonths() {
  return MONTHS.map((month) => ({ ...month }));
}

function normalizeFieldName(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function resolveAhoSlaFields(table) {
  const headers = Array.isArray(table?.headers) ? table.headers : [];
  const headerKeys = Array.isArray(table?.headerKeys) ? table.headerKeys : [];
  const candidates = headerKeys.map((key, index) => ({
    key,
    label: headers[index] || key
  }));

  if (!candidates.length && Array.isArray(table?.items) && table.items[0]) {
    Object.keys(table.items[0])
      .filter((key) => key !== "__row")
      .forEach((key) => candidates.push({ key, label: key }));
  }

  const findKey = (names) => {
    const match = candidates.find(({ key, label }) =>
      names.has(normalizeFieldName(key)) ||
      names.has(normalizeFieldName(label))
    );
    return match?.key || null;
  };
  const fields = {
    date: findKey(DATE_FIELD_NAMES),
    duration: findKey(DURATION_FIELD_NAMES),
    ...Object.fromEntries(DETAIL_FIELDS.map(({ key, names }) => [key, findKey(names)]))
  };

  if (!fields.date) {
    throw new Error("Kolom tanggal 'Tgl Terima' tidak ditemukan pada data SLA AHO Store.");
  }
  if (!fields.duration) {
    throw new Error("Kolom durasi 'Waktu Penyelesaian' tidak ditemukan pada data SLA AHO Store.");
  }

  return fields;
}

function validDateParts(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function parseAhoSlaDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return validDateParts(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  const text = String(value == null ? "" : value).trim();
  if (!text) return null;

  let match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:$|[T\s])/);
  if (match) {
    return validDateParts(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (match) {
    return validDateParts(Number(match[3]), Number(match[2]), Number(match[1]));
  }

  match = text.match(/\b([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\b/);
  if (match && MONTH_LOOKUP.has(match[1].toLowerCase())) {
    return validDateParts(
      Number(match[3]),
      MONTH_LOOKUP.get(match[1].toLowerCase()),
      Number(match[2])
    );
  }

  match = text.match(/\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/);
  if (match && MONTH_LOOKUP.has(match[2].toLowerCase())) {
    return validDateParts(
      Number(match[3]),
      MONTH_LOOKUP.get(match[2].toLowerCase()),
      Number(match[1])
    );
  }

  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) return null;
  return validDateParts(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
}

export function parseAhoSlaDurationDays(value) {
  if (value == null || String(value).trim() === "") return null;
  const normalized = String(value).trim().replace(",", ".");
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const days = Number(normalized);
  return Number.isFinite(days) && days >= 0 ? days : null;
}

function dateKey({ year, month, day }) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatAhoSlaDuration(minutes) {
  if (minutes == null || !Number.isFinite(Number(minutes))) return "—";

  let remaining = Math.max(0, Math.round(Number(minutes)));
  const days = Math.floor(remaining / 1440);
  remaining %= 1440;
  const hours = Math.floor(remaining / 60);
  const mins = remaining % 60;
  const parts = [];

  if (days) parts.push(`${days} Hari`);
  if (hours) parts.push(`${hours} Jam`);
  if (mins) parts.push(`${mins} Menit`);
  return parts.length ? parts.join(" ") : "0 Menit";
}

export function formatAhoSlaDate(parts) {
  if (!parts) return "—";
  const month = MONTHS[parts.month - 1];
  if (!month) return "—";
  return `${String(parts.day).padStart(2, "0")} ${month.label} ${parts.year}`;
}

export function formatAhoSlaAchievement(value) {
  const text = String(value == null ? "" : value).trim();
  if (!text) return "—";
  if (text.endsWith("%")) return text;

  const numeric = Number(text.replace(",", "."));
  if (!Number.isFinite(numeric)) return text;
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(numeric)}%`;
}

export function getAhoSlaAvailableYears(table, currentYear = new Date().getFullYear()) {
  const fields = resolveAhoSlaFields(table);
  const years = new Set([currentYear]);

  (Array.isArray(table?.items) ? table.items : []).forEach((item) => {
    const parsed = parseAhoSlaDate(item?.[fields.date]);
    if (parsed) years.add(parsed.year);
  });

  return Array.from(years).sort((a, b) => b - a);
}

export function aggregateAhoSlaByDate(table, year, selectedMonths) {
  const fields = resolveAhoSlaFields(table);
  const months = new Set(
    Array.from(selectedMonths || [])
      .map(Number)
      .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12)
  );
  const daily = new Map();

  months.forEach((month) => {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let day = 1; day <= daysInMonth; day++) {
      daily.set(dateKey({ year, month, day }), {
        date: { year, month, day },
        exactMinutes: 0,
        problems: 0,
        durationCount: 0,
        tickets: []
      });
    }
  });

  let totalExactMinutes = 0;
  let totalProblems = 0;
  let validDurationCount = 0;
  (Array.isArray(table?.items) ? table.items : []).forEach((item) => {
    const date = parseAhoSlaDate(item?.[fields.date]);
    if (!date || date.year !== Number(year) || !months.has(date.month)) return;

    const day = daily.get(dateKey(date));
    if (!day) return;
    day.problems++;
    totalProblems++;

    const durationDays = parseAhoSlaDurationDays(item?.[fields.duration]);
    day.tickets.push({
      item,
      durationMinutes: durationDays == null ? null : durationDays * 1440
    });
    if (durationDays == null) return;
    const exactMinutes = durationDays * 1440;
    day.exactMinutes += exactMinutes;
    day.durationCount++;
    totalExactMinutes += exactMinutes;
    validDurationCount++;
  });

  const rows = Array.from(daily.values())
    .filter((day) => day.problems > 0)
    .sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)))
    .map((day) => {
      const detailItems = day.tickets.map(({ item, durationMinutes }) => ({
        storeCode: fields.storeCode ? item?.[fields.storeCode] : "",
        storeName: fields.storeName ? item?.[fields.storeName] : "",
        responsible: fields.responsible ? item?.[fields.responsible] : "",
        issue: fields.issue ? item?.[fields.issue] : "",
        durationMinutes,
        targetDays: fields.targetDays ? item?.[fields.targetDays] : "",
        achievement: fields.achievement ? item?.[fields.achievement] : ""
      }));
      const missingDetailFields = DETAIL_FIELDS.filter(({ key }) => !fields[key]).map(({ label }) => label);

      return {
        date: day.date,
        key: dateKey(day.date),
        totalMinutes: Math.round(day.exactMinutes),
        problems: day.problems,
        averageMinutes: day.durationCount
          ? Math.round(day.exactMinutes / day.durationCount)
          : null,
        detailItems,
        missingDetailFields
      };
    });

  return {
    totalMinutes: Math.round(totalExactMinutes),
    totalProblems,
    averageMinutes: validDurationCount
      ? Math.round(totalExactMinutes / validDurationCount)
      : null,
    validDurationCount,
    rows,
    maxDailyMinutes: rows.reduce((max, row) => Math.max(max, row.totalMinutes), 0)
  };
}
