"use client";

import { useEffect, useState } from "react";

import {
  describeBillingCoverage,
  formatBillingLabel,
  formatCompactTokens,
  type UsageSummary,
} from "@/lib/office/usageSummary";

type SummaryResponse = {
  available: boolean;
  days?: number;
  error?: string;
  summary?: UsageSummary;
};

const LoadingSkeleton = () => (
  <span className="inline-block h-4 w-12 animate-pulse rounded bg-white/10" />
);

/**
 * Token + billing totals for the local Hermes runtime, pinned to the top of the
 * office dashboard. Billing is read from session cost records; unpriced sessions
 * are surfaced as "—"/"*" rather than a fake $0.00.
 */
export function UsageSummaryBar() {
  const [data, setData] = useState<SummaryResponse | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/office/usage-summary?days=7", {
          cache: "no-store",
        });
        const next = (await response.json()) as SummaryResponse;
        if (active) setData(next);
      } catch {
        if (active) setData({ available: false, error: "Usage data unavailable." });
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const summary = data?.summary;
  const billingHint = summary
    ? describeBillingCoverage(summary)
    : data?.available === false
      ? "Local usage data unavailable"
      : "Reading local session records";

  return (
    <aside
      aria-label="Token usage and billing summary"
      className="pointer-events-auto absolute left-3 top-[7.6rem] z-40 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-xl border border-amber-500/20 bg-[#120e09]/95 px-3 py-2 shadow-lg backdrop-blur-md sm:gap-4"
      title="Usage totals come from local Hermes session records. Unpriced sessions are not treated as free."
    >
      <div className="min-w-[76px]">
        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-100/45">
          Tokens · 7d
        </div>
        <div className="mt-0.5 font-mono text-sm font-semibold text-amber-100/90">
          {summary ? (
            formatCompactTokens(summary.totals.totalTokens)
          ) : data?.available === false ? (
            "—"
          ) : (
            <LoadingSkeleton />
          )}
        </div>
        {summary ? (
          <div className="font-mono text-[9px] text-white/35">
            {formatCompactTokens(summary.totals.billableTokens)} in/out ·{" "}
            {formatCompactTokens(summary.totals.cacheReadTokens)} cache
          </div>
        ) : null}
      </div>
      <div className="h-8 w-px bg-white/10" />
      <div className="min-w-[76px]">
        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-100/45">
          Billing · 7d
        </div>
        <div className="mt-0.5 font-mono text-sm font-semibold text-amber-100/90">
          {summary ? (
            formatBillingLabel(summary)
          ) : data?.available === false ? (
            "—"
          ) : (
            <LoadingSkeleton />
          )}
        </div>
        <div className="max-w-40 truncate font-mono text-[9px] text-white/35">
          {billingHint}
        </div>
      </div>
    </aside>
  );
}
