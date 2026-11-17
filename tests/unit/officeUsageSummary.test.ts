import { describe, expect, it } from "vitest";

import {
  aggregateUsageRows,
  describeBillingCoverage,
  formatBillingLabel,
  formatCompactTokens,
  formatUsd,
  type UsageSummary,
} from "@/lib/office/usageSummary";

describe("aggregateUsageRows", () => {
  it("sums tokens and cost across sessions", () => {
    const summary = aggregateUsageRows([
      {
        inputTokens: 100,
        outputTokens: 20,
        cacheReadTokens: 300,
        cacheWriteTokens: 10,
        estimatedCostUsd: 0.25,
        actualCostUsd: null,
        costStatus: "estimated",
        sessionKey: "a",
        model: "m1",
        profileName: "default",
      },
      {
        inputTokens: 50,
        outputTokens: 5,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        estimatedCostUsd: 0,
        actualCostUsd: 0.5,
        costStatus: "actual",
        sessionKey: "b",
        model: "m2",
        profileName: "office",
      },
    ]);

    expect(summary.totals.inputTokens).toBe(150);
    expect(summary.totals.outputTokens).toBe(25);
    expect(summary.totals.cacheReadTokens).toBe(300);
    expect(summary.totals.cacheWriteTokens).toBe(10);
    expect(summary.totals.totalTokens).toBe(485);
    expect(summary.totals.costUsd).toBeCloseTo(0.75, 6);
    expect(summary.totals.billableTokens).toBe(175);
    expect(summary.sessions).toBe(2);
  });

  it("reports costUnknownSessions when no pricing data exists", () => {
    const summary = aggregateUsageRows([
      {
        inputTokens: 10,
        outputTokens: 1,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        estimatedCostUsd: 0,
        actualCostUsd: null,
        costStatus: "unknown",
        sessionKey: "a",
        model: "model-nemesis",
        profileName: "default",
      },
    ]);

    expect(summary.costUnknownSessions).toBe(1);
    expect(summary.costKnownSessions).toBe(0);
    expect(summary.totals.costUsd).toBe(0);
  });

  it("groups tokens per model sorted by total tokens", () => {
    const summary = aggregateUsageRows([
      {
        inputTokens: 10,
        outputTokens: 10,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        estimatedCostUsd: 0,
        actualCostUsd: null,
        costStatus: "unknown",
        sessionKey: "a",
        model: "small",
        profileName: "default",
      },
      {
        inputTokens: 500,
        outputTokens: 100,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        estimatedCostUsd: 0,
        actualCostUsd: null,
        costStatus: "unknown",
        sessionKey: "b",
        model: "big",
        profileName: "default",
      },
    ]);

    expect(summary.models.map((entry) => entry.model)).toEqual(["big", "small"]);
    expect(summary.models[0].totalTokens).toBe(600);
  });
});

describe("formatters", () => {
  it("formats compact tokens", () => {
    expect(formatCompactTokens(999)).toBe("999");
    expect(formatCompactTokens(15300)).toBe("15.3K");
    expect(formatCompactTokens(14_448_621)).toBe("14.4M");
  });

  it("formats usd with two decimals below ten", () => {
    expect(formatUsd(0)).toBe("$0.00");
    expect(formatUsd(3.456)).toBe("$3.46");
    expect(formatUsd(1234.5)).toBe("$1,235");
  });
});

describe("billing labels", () => {
  const base: UsageSummary = {
    sessions: 2,
    costKnownSessions: 0,
    costUnknownSessions: 2,
    models: [],
    profiles: [],
    totals: {
      inputTokens: 10,
      outputTokens: 5,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 15,
      billableTokens: 15,
      costUsd: 0,
      actualCostUsd: 0,
      estimatedCostUsd: 0,
    },
  };

  it("never reports unpriced sessions as $0.00", () => {
    expect(formatBillingLabel(base)).toBe("—");
    expect(describeBillingCoverage(base)).toContain("unpriced");
  });

  it("marks partial pricing with an asterisk", () => {
    const partial: UsageSummary = {
      ...base,
      costKnownSessions: 1,
      costUnknownSessions: 1,
      totals: { ...base.totals, costUsd: 0.42 },
    };
    expect(formatBillingLabel(partial)).toBe("$0.42*");
    expect(describeBillingCoverage(partial)).toBe("1 priced · 1 unpriced");
  });
});
