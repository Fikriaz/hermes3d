export type UsageSummaryRow = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  estimatedCostUsd: number | null;
  actualCostUsd: number | null;
  costStatus: string | null;
  sessionKey: string;
  model: string | null;
  profileName: string | null;
};

export type UsageSummary = {
  sessions: number;
  costKnownSessions: number;
  costUnknownSessions: number;
  models: Array<{ model: string; totalTokens: number }>;
  profiles: Array<{ profileName: string; totalTokens: number }>;
  totals: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    totalTokens: number;
    billableTokens: number;
    costUsd: number;
    actualCostUsd: number;
    estimatedCostUsd: number;
  };
};

const safeCount = (value: number): number =>
  Number.isFinite(value) && value > 0 ? value : 0;

export const aggregateUsageRows = (rows: UsageSummaryRow[]): UsageSummary => {
  const totals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: 0,
    billableTokens: 0,
    costUsd: 0,
    actualCostUsd: 0,
    estimatedCostUsd: 0,
  };
  let costKnownSessions = 0;
  let costUnknownSessions = 0;
  const models = new Map<string, number>();
  const profiles = new Map<string, number>();

  for (const row of rows) {
    const input = safeCount(row.inputTokens);
    const output = safeCount(row.outputTokens);
    const cacheRead = safeCount(row.cacheReadTokens);
    const cacheWrite = safeCount(row.cacheWriteTokens);
    const total = input + output + cacheRead + cacheWrite;
    totals.inputTokens += input;
    totals.outputTokens += output;
    totals.cacheReadTokens += cacheRead;
    totals.cacheWriteTokens += cacheWrite;
    totals.totalTokens += total;
    // Input/output tokens are billed; cached tokens are shown separately in total usage.
    totals.billableTokens += input + output;

    if (row.costStatus === "actual" && row.actualCostUsd !== null) {
      const actual = safeCount(row.actualCostUsd);
      totals.actualCostUsd += actual;
      totals.costUsd += actual;
      costKnownSessions += 1;
    } else if (row.costStatus === "estimated" && row.estimatedCostUsd !== null) {
      const estimated = safeCount(row.estimatedCostUsd);
      totals.estimatedCostUsd += estimated;
      totals.costUsd += estimated;
      costKnownSessions += 1;
    } else {
      costUnknownSessions += 1;
    }

    const model = row.model?.trim() || "Unknown model";
    const profile = row.profileName?.trim() || "default";
    models.set(model, (models.get(model) ?? 0) + total);
    profiles.set(profile, (profiles.get(profile) ?? 0) + total);
  }

  return {
    sessions: rows.length,
    costKnownSessions,
    costUnknownSessions,
    totals,
    models: Array.from(models, ([model, totalTokens]) => ({ model, totalTokens })).sort(
      (a, b) => b.totalTokens - a.totalTokens,
    ),
    profiles: Array.from(profiles, ([profileName, totalTokens]) => ({ profileName, totalTokens })).sort(
      (a, b) => b.totalTokens - a.totalTokens,
    ),
  };
};

export const formatCompactTokens = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return Math.round(value).toLocaleString("en-US");
};

export const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 10 ? 2 : 0,
    maximumFractionDigits: value < 10 ? 2 : 0,
  }).format(value);

/**
 * Billing label for the dashboard bar. Unpriced sessions must never be shown as
 * "$0.00" — zero is a real price, "unknown" is not.
 */
export const formatBillingLabel = (summary: UsageSummary): string => {
  if (summary.costKnownSessions === 0) return "—";
  const base = formatUsd(summary.totals.costUsd);
  return summary.costUnknownSessions > 0 ? `${base}*` : base;
};

/** Short human explanation of why a billing number is partial or missing. */
export const describeBillingCoverage = (summary: UsageSummary): string => {
  if (summary.costKnownSessions === 0) {
    return `${summary.costUnknownSessions} unpriced session${summary.costUnknownSessions === 1 ? "" : "s"}`;
  }
  if (summary.costUnknownSessions > 0) {
    return `${summary.costKnownSessions} priced · ${summary.costUnknownSessions} unpriced`;
  }
  return "Recorded provider cost";
};
