const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const formatRupiah = (number) => {
  if (number === null || number === undefined || isNaN(number)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  }).format(date);
};

export const formatDateShort = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(date);
};

// Format tanggal saja dalam WIB (contoh: "06 Oktober 2026")
export const formatDateOnlyWIB = (input) => {
  if (!input) return '';
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    const [y, m, d] = input.trim().split('-').map(Number);
    const dayStr = String(d).padStart(2, '0');
    const monthStr = INDO_MONTHS[m - 1] || '';
    return `${dayStr} ${monthStr} ${y}`;
  }
  const dateObj = new Date(input);
  if (isNaN(dateObj.getTime())) return '';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(dateObj);
};

// Format rentang tanggal WIB (contoh jika sama: "06 Oktober 2026", jika rentang: "06 Oktober - 10 Oktober 2026")
export const formatDateRangeWIB = (startInput, endInput) => {
  const sStr = formatDateOnlyWIB(startInput);
  const eStr = formatDateOnlyWIB(endInput);
  if (!sStr) return eStr || formatDateOnlyWIB(new Date());
  if (!eStr) return sStr;
  if (sStr === eStr) return sStr;

  const sParts = sStr.split(' ');
  const eParts = eStr.split(' ');

  // Jika tahunnya sama, buat format ringkas elegan "06 Oktober - 10 Oktober 2026"
  if (sParts.length === 3 && eParts.length === 3 && sParts[2] === eParts[2]) {
    return `${sParts[0]} ${sParts[1]} - ${eParts[0]} ${eParts[1]} ${eParts[2]}`;
  }

  return `${sStr} - ${eStr}`;
};

// Format tanggal dan jam WIB (contoh: "06 Oktober 2026, 01:25 WIB")
export const formatDateTimeWIB = (dateInput = new Date()) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const formatted = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
    hour12: false
  }).format(d);
  return `${formatted} WIB`;
};

// Helper mendapatkan label tanggal dinamis untuk Laporan Penjualan Boenda Pie
export const getReportDateRangeLabel = (report, period, startDate, endDate) => {
  if (period === 'today') {
    return formatDateOnlyWIB(report?.startDate || new Date());
  }

  if (period === 'custom') {
    if (startDate && endDate) {
      return formatDateRangeWIB(startDate, endDate);
    }
    if (startDate) return formatDateOnlyWIB(startDate);
    if (endDate) return formatDateOnlyWIB(endDate);
  }

  if (report?.startDate && report?.endDate) {
    return formatDateRangeWIB(report.startDate, report.endDate);
  }

  if (report?.transactions && report.transactions.length > 0) {
    const dates = report.transactions
      .map((t) => new Date(t.date || t.createdAt).getTime())
      .filter((t) => !isNaN(t));
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      return formatDateRangeWIB(minDate, maxDate);
    }
  }

  return formatDateOnlyWIB(new Date());
};

