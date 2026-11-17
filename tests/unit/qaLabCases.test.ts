import { describe, expect, it } from "vitest";
import {
  BUG_CASES,
  evaluateReport,
  findMatchingBug,
  getBugById,
  scoreBugReport,
  type BugReport,
} from "@/lib/qa-lab/cases";

const validReport = (overrides: Partial<BugReport> = {}): BugReport => ({
  category: "functional",
  severity: "high",
  priority: "high",
  expected: "Subtotal cart sama dengan harga katalog",
  actual: "Harga di cart lebih mahal dari katalog",
  reproduction: "1. Buka katalog\n2. Add to cart\n3. Bandingkan harga",
  ...overrides,
});

describe("qa lab bug cases", () => {
  it("exposes one seeded case per bug category", () => {
    expect(BUG_CASES.map((bug) => bug.category)).toEqual([
      "functional",
      "visual",
      "content",
      "crash",
    ]);
    expect(BUG_CASES.map((bug) => bug.trigger)).toEqual([
      "cart-price",
      "image-stretch",
      "wrong-description",
      "empty-address",
    ]);
  });

  it("counts every required field toward completeness", () => {
    expect(scoreBugReport(getBugById("BUG-001")!, validReport())).toEqual({
      accepted: true,
      completeness: 100,
      missing: [],
    });
    expect(
      scoreBugReport(getBugById("BUG-001")!, validReport({ severity: "", actual: "  " })),
    ).toMatchObject({ accepted: false, missing: ["severity", "actual"] });
  });

  it("does not accept a complete report filed under the wrong category", () => {
    expect(scoreBugReport(getBugById("BUG-001")!, validReport({ category: "visual" })))
      .toMatchObject({ accepted: false });
  });

  it("rejects a report that is missing fields", () => {
    expect(evaluateReport(validReport({ reproduction: "" }))).toMatchObject({
      status: "incomplete",
    });
  });

  it("validates a report that names the observed symptom", () => {
    const result = evaluateReport(validReport());
    expect(result.status).toBe("validated");
    expect(result.bug?.id).toBe("BUG-001");
  });

  it("validates on category plus observed evidence even when wording differs", () => {
    const result = evaluateReport(
      validReport({
        actual: "Jumlahnya tidak sesuai",
        expected: "Seharusnya sama",
      }),
      ["BUG-001"],
    );
    expect(result).toMatchObject({ status: "validated", bug: { id: "BUG-001" } });
  });

  it("flags a complete report whose category matches nothing in the store", () => {
    expect(
      evaluateReport(validReport({ category: "content", actual: "harga meleset" })),
    ).toMatchObject({ status: "wrong-category" });
  });

  it("matches the visual bug from wording alone", () => {
    const visual = validReport({
      category: "visual",
      expected: "Gambar tidak gepeng",
      actual: "Gambar melebar dan terdistorsi",
    });
    expect(evaluateReport(visual)).toMatchObject({
      status: "validated",
      bug: { id: "BUG-002" },
    });
  });

  it("only matches cases inside the chosen category", () => {
    const report = validReport({ category: "crash" });
    expect(findMatchingBug(report)?.id).toBeUndefined();
    expect(
      findMatchingBug({ ...report, actual: "checkout error karena alamat kosong" })?.id,
    ).toBe("BUG-004");
  });
});
