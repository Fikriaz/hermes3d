export type BugCategory = "visual" | "functional" | "content" | "crash";
export type Severity = "low" | "medium" | "high" | "critical";
export type Priority = "low" | "medium" | "high" | "urgent";

export type BugReport = {
  category: BugCategory | "";
  severity: Severity | "";
  priority: Priority | "";
  expected: string;
  actual: string;
  reproduction: string;
};

export type BugCase = {
  id: string;
  title: string;
  category: BugCategory;
  /** Interaction in the mock store that exposes the defect. */
  trigger: "cart-price" | "image-stretch" | "wrong-description" | "empty-address";
  /** Where the defect lives, revealed only after validation. */
  location: string;
  expectedBehaviour: string;
  actualBehaviour: string;
};

export const BUG_CASES: readonly BugCase[] = [
  {
    id: "BUG-001",
    title: "Subtotal cart tidak sama dengan harga katalog",
    category: "functional",
    trigger: "cart-price",
    location: "Pocket Camera → Add to cart → panel Cart",
    expectedBehaviour: "Subtotal sama dengan harga yang tampil di katalog ($249.00).",
    actualBehaviour: "Subtotal menjadi $269.00, selisih $20 tanpa penjelasan.",
  },
  {
    id: "BUG-002",
    title: "Gambar produk terdistorsi (stretched)",
    category: "visual",
    trigger: "image-stretch",
    location: "Katalog → kartu Mechanical Keyboard",
    expectedBehaviour: "Gambar mengikuti aspect ratio aslinya.",
    actualBehaviour: "Gambar melebar horizontal sehingga bentuknya gepeng.",
  },
  {
    id: "BUG-003",
    title: "Deskripsi produk tidak sesuai produknya",
    category: "content",
    trigger: "wrong-description",
    location: "Katalog → Headphone Pro → detail produk",
    expectedBehaviour: "Deskripsi menjelaskan Headphone Pro.",
    actualBehaviour: "Deskripsi menyebut Smartwatch X beserta fitur yang tidak dimiliki.",
  },
  {
    id: "BUG-004",
    title: "Checkout gagal saat alamat kosong",
    category: "crash",
    trigger: "empty-address",
    location: "Checkout → Place order dengan alamat kosong",
    expectedBehaviour: "Form menampilkan pesan validasi pada field alamat.",
    actualBehaviour: "Halaman masuk keadaan error, bukan validasi form.",
  },
];

export const getBugById = (id: string): BugCase | undefined =>
  BUG_CASES.find((bug) => bug.id === id);

const normalize = (value: string) => value.trim().toLowerCase();

const symptomTerms: Record<string, string[]> = {
  "BUG-001": ["harga", "price", "mahal", "subtotal", "cart", "total"],
  "BUG-002": ["gambar", "image", "foto", "gepeng", "melebar", "distorsi", "aspect", "proporsi"],
  "BUG-003": ["deskripsi", "description", "konten", "produk lain", "smartwatch", "salah teks"],
  "BUG-004": ["checkout", "alamat", "address", "crash", "error", "validasi", "kosong"],
};

export const reportMatchesBug = (bug: BugCase, report: BugReport): boolean => {
  const text = `${normalize(report.actual)} ${normalize(report.expected)}`;
  return (symptomTerms[bug.id] ?? []).some((term) => text.includes(term));
};

export type BugReportScore = {
  accepted: boolean;
  completeness: number;
  missing: string[];
};

export const REPORT_FIELDS = [
  "category",
  "severity",
  "priority",
  "expected",
  "actual",
  "reproduction",
] as const;

export const scoreBugReport = (
  bug: BugCase,
  report: BugReport,
): BugReportScore => {
  const missing = REPORT_FIELDS.filter((field) => !report[field].trim());
  const completeness = Math.round(
    ((REPORT_FIELDS.length - missing.length) / REPORT_FIELDS.length) * 100,
  );
  return {
    accepted: report.category === bug.category && missing.length === 0,
    completeness,
    missing: [...missing],
  };
};

export type ReportStatus = "validated" | "incomplete" | "wrong-category" | "unclear";

export type ReportEvaluation = {
  status: ReportStatus;
  message: string;
  bug?: BugCase;
};

/** One submitted report kept for the session results view. */
export type SessionReport = {
  caseId: string;
  foundAt: string;
  report: BugReport;
  evaluation: ReportEvaluation;
  score: BugReportScore;
};

/**
 * Picks the seeded case a report is about. Evidence (the defects the user has
 * actually observed in the mock store) decides first; otherwise the wording in
 * expected/actual has to name the symptom.
 */
export const findMatchingBug = (
  report: BugReport,
  evidence: readonly string[] = [],
): BugCase | undefined => {
  if (!report.category) return undefined;
  const candidates = BUG_CASES.filter((bug) => bug.category === report.category);
  return (
    candidates.find((bug) => evidence.includes(bug.id)) ??
    candidates.find((bug) => reportMatchesBug(bug, report))
  );
};

export const evaluateReport = (
  report: BugReport,
  evidence: readonly string[] = [],
): ReportEvaluation => {
  const missing = REPORT_FIELDS.filter((field) => !report[field].trim());
  if (missing.length > 0) {
    return {
      status: "incomplete",
      message: `Lengkapi dulu: ${missing.join(", ")}.`,
    };
  }

  const bug = findMatchingBug(report, evidence);
  if (!bug) {
    return {
      status: "wrong-category",
      message:
        "Belum ada case dengan kategori itu yang cocok dengan temuanmu. Periksa lagi jenis bug-nya.",
    };
  }

  if (!reportMatchesBug(bug, report) && !evidence.includes(bug.id)) {
    return {
      status: "unclear",
      message:
        "Kategori sudah tepat, tapi uraian expected/actual belum menjelaskan gejalanya. Sebutkan apa yang berubah dan di mana.",
    };
  }

  return {
    status: "validated",
    message: "Bug tervalidasi. Laporanmu cocok dengan case yang ditanam.",
    bug,
  };
};
