"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BUG_CASES,
  evaluateReport,
  scoreBugReport,
  type BugCategory,
  type BugReport,
  type ReportEvaluation,
  type SessionReport,
} from "@/lib/qa-lab/cases";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
};

const PRODUCTS: Product[] = [
  {
    id: "headphones",
    name: "Headphone Pro",
    category: "Audio",
    price: 129.99,
    image: "🎧",
    description: "Deskripsi demo: Smartwatch X dengan pemantau kesehatan.",
  },
  {
    id: "keyboard",
    name: "Mechanical Keyboard",
    category: "Accessories",
    price: 89.5,
    image: "⌨️",
    description: "Keyboard mekanikal dengan switch tactile dan lampu RGB.",
  },
  {
    id: "camera",
    name: "Pocket Camera",
    category: "Camera",
    price: 249,
    image: "📷",
    description: "Kamera saku ringan untuk foto dan video sehari-hari.",
  },
];

const money = (value: number) => `$${value.toFixed(2)}`;
const emptyReport: BugReport = {
  category: "",
  severity: "",
  priority: "",
  expected: "",
  actual: "",
  reproduction: "",
};

const fieldClass =
  "mt-1 w-full rounded-lg border border-white/10 bg-[#10141a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60";
const labelClass = "block text-xs font-medium text-white/60";

export function QaLabScreen() {
  const [formOpen, setFormOpen] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [report, setReport] = useState<BugReport>(emptyReport);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<ReportEvaluation | null>(null);
  const [reports, setReports] = useState<SessionReport[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  const cartProduct = useMemo(
    () => PRODUCTS.find((product) => product.id === cartId),
    [cartId],
  );

  const resetSession = () => {
    setFormOpen(false);
    setCartId(null);
    setAddress("");
    setCheckoutMessage("");
    setReport(emptyReport);
    setEvidence([]);
    setEvaluation(null);
    setReports([]);
  };

  const openReport = (evidenceId: string | null = null) => {
    setEvidence(evidenceId ? [evidenceId] : []);
    setReport(emptyReport);
    setEvaluation(null);
    setFormOpen(true);
  };

  const setField = <K extends keyof BugReport>(key: K, value: BugReport[K]) =>
    setReport((current) => ({ ...current, [key]: value }));

  const submitReport = () => {
    const next = evaluateReport(report, evidence);
    setEvaluation(next);
    if (next.status !== "validated" || !next.bug) return;
    const matched = next.bug;
    setReports((current) => [
      ...current,
      {
        caseId: matched.id,
        foundAt: new Date().toISOString(),
        report,
        evaluation: next,
        score: scoreBugReport(matched, report),
      },
    ]);
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#080b10] text-white">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#090c11]/95 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/office" className="text-sm text-cyan-200 hover:text-white">
            ← Office
          </Link>
          <span className="text-white/20">/</span>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">
              Hermes3D · QA Lab
            </p>
            <h1 className="text-lg font-semibold">Bug Hunt E-Commerce</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGuide(true)}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/75 hover:bg-white/5"
          >
            Cara penggunaan
          </button>
          <button
            onClick={resetSession}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/75 hover:bg-white/5"
          >
            Reset sesi
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-5 p-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] lg:p-6">
        <section
          aria-label="Mock e-commerce"
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#10141a] shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">
                Toko latihan
              </p>
              <h2 className="text-xl font-semibold">Northstar Market</h2>
            </div>
            <span className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
              Cart {cartProduct ? "· 1 item" : "· kosong"}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <p className="text-sm text-white/55">
              Case ini memiliki {BUG_CASES.length} bug latihan tersembunyi.
            </p>
            <button
              onClick={() => openReport()}
              className="rounded-lg border border-cyan-200/20 px-3 py-2 text-xs text-cyan-100 hover:bg-cyan-300/10"
            >
              Temukan bug? Laporkan
            </button>
          </div>

          <div className="grid gap-4 p-5 pt-0 sm:grid-cols-2 xl:grid-cols-3">
            {PRODUCTS.map((product, index) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#151a21]"
              >
                <div
                  className={`flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-700/40 to-cyan-950/40 ${
                    index === 0 ? "scale-x-125" : ""
                  }`}
                  aria-label={`${product.name} product image`}
                >
                  <span className="text-7xl" role="img" aria-label={product.name}>
                    {product.image}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    {product.category}
                  </p>
                  <h3 className="mt-1 font-semibold">{product.name}</h3>
                  <p className="mt-1 text-sm text-white/55">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-cyan-100">{money(product.price)}</span>
                    <button
                      onClick={() => {
                        setCartId(product.id);
                        setCheckoutMessage("");
                      }}
                      className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-200"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {cartProduct ? (
            <div className="mx-5 mb-5 rounded-xl border border-white/10 bg-[#0b0f15] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40">Cart</p>
                  <p className="mt-1 font-semibold">{cartProduct.name}</p>
                </div>
                <button
                  onClick={() => setCartId(null)}
                  className="text-xs text-rose-200 hover:text-rose-100"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm">
                <span className="text-white/50">Subtotal</span>
                <b className="font-mono text-amber-100" data-testid="cart-subtotal">
                  {money(cartProduct.id === "headphones" ? cartProduct.price + 20 : cartProduct.price)}
                </b>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#10141a] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200/70">
              Checkout demo
            </p>
            <h2 className="mt-1 text-lg font-semibold">Uji validasi</h2>
            <label className={`${labelClass} mt-4`}>
              Alamat pengiriman
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={3}
                className={fieldClass}
                placeholder="Masukkan alamat (atau biarkan kosong untuk menguji case)"
              />
            </label>
            <button
              onClick={() => {
                if (address.trim()) {
                  setCheckoutMessage("Order demo berhasil dibuat.");
                  return;
                }
                setCheckoutMessage("Simulasi error: checkout mengalami crash karena alamat kosong.");
                openReport("BUG-004");
              }}
              className="mt-3 w-full rounded-lg bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200"
            >
              Place order
            </button>
            {checkoutMessage ? (
              <p role="status" className="mt-3 rounded-lg bg-rose-400/10 p-3 text-xs text-rose-100">
                {checkoutMessage}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#10141a] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
                  Temuan sesi
                </p>
                <h2 className="mt-1 text-lg font-semibold">Hasil laporan</h2>
              </div>
              <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-100">
                {new Set(reports.map((item) => item.caseId)).size}/{BUG_CASES.length} valid
              </span>
            </div>
            {reports.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-white/10 p-4 text-sm text-white/40">
                Belum ada temuan. Jelajahi toko, temukan perilaku yang salah, lalu laporkan.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reports.map((item, index) => (
                  <li
                    key={`${item.caseId}-${index}`}
                    className="rounded-xl border border-white/10 bg-[#0b0f15] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-[10px] text-cyan-200/70">{item.caseId}</p>
                        <h3 className="mt-1 text-sm font-semibold">
                          {item.evaluation.bug?.title ?? "Temuan sesi"}
                        </h3>
                      </div>
                      <span className="rounded-full bg-emerald-300/10 px-2 py-1 text-[10px] text-emerald-200">
                        Tervalidasi · {item.score.completeness}%
                      </span>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-white/35">Jenis</dt>
                        <dd>{item.report.category}</dd>
                      </div>
                      <div>
                        <dt className="text-white/35">Severity</dt>
                        <dd>{item.report.severity}</dd>
                      </div>
                      <div>
                        <dt className="text-white/35">Prioritas</dt>
                        <dd>{item.report.priority}</dd>
                      </div>
                      <div>
                        <dt className="text-white/35">Expected</dt>
                        <dd>{item.report.expected}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-white/35">Actual</dt>
                        <dd>{item.report.actual}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-white/35">How to reproduce</dt>
                        <dd className="whitespace-pre-wrap">{item.report.reproduction}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#10141a] p-5">
            <h2 className="font-semibold">Bug case</h2>
            <p className="mt-1 text-xs text-white/45">
              Empat jenis bug latihan tersedia. Kategori sebenarnya baru terbuka setelah laporan valid.
            </p>
            <ul className="mt-3 space-y-2">
              {BUG_CASES.map((bug) => (
                <li
                  key={bug.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2"
                >
                  <span className="text-xs text-white/65">{bug.id}</span>
                  <button
                    onClick={() => openReport(bug.id)}
                    className="shrink-0 text-[10px] text-cyan-200 hover:text-white"
                  >
                    Laporkan
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>

      {formOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setFormOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="my-auto max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-cyan-200/20 bg-[#11161e] p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
                  Form validasi bug
                </p>
                <h2 id="report-title" className="mt-1 text-xl font-semibold">
                  Laporkan temuan
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Isi berdasarkan yang kamu temukan. Kategori sebenarnya baru muncul saat laporan valid.
                </p>
              </div>
              <button
                aria-label="Tutup"
                onClick={() => setFormOpen(false)}
                className="rounded-lg px-2 py-1 text-white/50 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Jenis bug
                <select
                  value={report.category}
                  onChange={(event) =>
                    setField("category", event.target.value as BugCategory | "")
                  }
                  className={fieldClass}
                >
                  <option value="">Pilih kategori</option>
                  <option value="visual">Visual</option>
                  <option value="functional">Functional</option>
                  <option value="content">Content</option>
                  <option value="crash">Crash</option>
                </select>
              </label>
              <label className={labelClass}>
                Severity
                <select
                  value={report.severity}
                  onChange={(event) =>
                    setField("severity", event.target.value as BugReport["severity"])
                  }
                  className={fieldClass}
                >
                  <option value="">Pilih severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
              <label className={labelClass}>
                Prioritas
                <select
                  value={report.priority}
                  onChange={(event) =>
                    setField("priority", event.target.value as BugReport["priority"])
                  }
                  className={fieldClass}
                >
                  <option value="">Pilih prioritas</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
              <div className="rounded-lg bg-white/[0.03] p-3 text-xs text-white/45">
                <b className="text-white/70">Panduan</b>
                <p className="mt-1">Severity = besar dampak. Prioritas = seberapa cepat perlu diperbaiki.</p>
              </div>
              <label className={`${labelClass} sm:col-span-2`}>
                Expected result
                <textarea
                  value={report.expected}
                  onChange={(event) => setField("expected", event.target.value)}
                  rows={2}
                  className={fieldClass}
                  placeholder="Apa yang seharusnya terjadi?"
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Actual result
                <textarea
                  value={report.actual}
                  onChange={(event) => setField("actual", event.target.value)}
                  rows={2}
                  className={fieldClass}
                  placeholder="Apa yang benar-benar terjadi?"
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                How to reproduce
                <textarea
                  value={report.reproduction}
                  onChange={(event) => setField("reproduction", event.target.value)}
                  rows={3}
                  className={fieldClass}
                  placeholder={"1. Buka halaman produk\n2. Tambahkan ke cart\n3. Bandingkan harga"}
                />
              </label>
            </div>

            {evaluation ? (
              <div
                role="status"
                className={`mt-4 rounded-xl border p-4 text-sm ${
                  evaluation.status === "validated"
                    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                    : "border-amber-300/20 bg-amber-300/10 text-amber-100"
                }`}
              >
                <b>
                  {evaluation.status === "validated"
                    ? "Bug tervalidasi!"
                    : "Laporan belum tervalidasi"}
                </b>
                <p className="mt-1 text-xs opacity-75">{evaluation.message}</p>
                {evaluation.bug ? (
                  <div className="mt-3 border-t border-current/15 pt-3 text-xs">
                    <p>
                      <b>Case:</b> {evaluation.bug.id} · {evaluation.bug.title}
                    </p>
                    <p className="mt-1">Lokasi: {evaluation.bug.location}</p>
                    <p className="mt-1">Expected: {evaluation.bug.expectedBehaviour}</p>
                    <p className="mt-1">Actual: {evaluation.bug.actualBehaviour}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                Tutup
              </button>
              <button
                onClick={submitReport}
                className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
              >
                Kirim & validasi
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {showGuide ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowGuide(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#11161e] p-6"
          >
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
                  Dokumentasi QA Lab
                </p>
                <h2 id="guide-title" className="mt-1 text-xl font-semibold">
                  Cara menggunakan Bug Hunt
                </h2>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                aria-label="Tutup dokumentasi"
                className="text-white/50"
              >
                ✕
              </button>
            </div>
            <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-white/70">
              <li>Jelajahi katalog dan coba alur toko: buka produk, tambah ke cart, atau uji checkout.</li>
              <li>Catat perilaku yang terasa salah sebelum membuka daftar case.</li>
              <li>
                Pilih <b className="text-white">Laporkan</b>, lalu tentukan jenis bug: visual, functional,
                content, atau crash.
              </li>
              <li>Tentukan severity (besar dampak) dan prioritas (urgensi perbaikan).</li>
              <li>Isi expected result, actual result, serta langkah how to reproduce yang bisa diikuti orang lain.</li>
              <li>
                Tekan <b className="text-white">Kirim &amp; validasi</b>. Jika cocok, hasil dan ringkasan case
                muncul di form dan daftar temuan sesi.
              </li>
              <li>Gunakan Reset sesi untuk mengosongkan temuan dan mulai ulang.</li>
            </ol>
            <p className="mt-5 rounded-lg bg-amber-300/10 p-3 text-xs text-amber-100/80">
              Ini adalah aplikasi latihan lokal. Tidak ada pesanan, pembayaran, atau data toko sungguhan.
            </p>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Mulai latihan
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}
