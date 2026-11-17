import { existsSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import { NextResponse } from "next/server";

import {
  aggregateUsageRows,
  type UsageSummaryRow,
} from "@/lib/office/usageSummary";

export const runtime = "nodejs";

const requireCjs = createRequire(import.meta.url);

type StateDb = {
  prepare: (sql: string) => { all: (...params: unknown[]) => unknown[] };
  close?: () => void;
};

type SqliteModule = {
  DatabaseSync: new (file: string, options?: { readOnly?: boolean }) => StateDb;
};

const loadSqlite = (): SqliteModule | null => {
  // node:sqlite ships with Node 22+. Bundled Next output can break
  // createRequire paths, and `process.getBuiltinModule` is the reliable way
  // to reach a builtin from inside a bundled route handler.
  const builtin = (
    process as unknown as { getBuiltinModule?: (name: string) => unknown }
  ).getBuiltinModule?.("node:sqlite");
  if (builtin) return builtin as SqliteModule;
  try {
    return requireCjs("node:sqlite") as SqliteModule;
  } catch {
    return null;
  }
};

type DbAttempt = { profile: string; opened: boolean; detail?: string };

const openStateDb = (filePath: string): { db: StateDb | null; detail?: string } => {
  const sqlite = loadSqlite();
  if (!sqlite) return { db: null, detail: "node:sqlite module unavailable" };
  try {
    return { db: new sqlite.DatabaseSync(filePath, { readOnly: true }) };
  } catch (error) {
    return { db: null, detail: error instanceof Error ? error.message : String(error) };
  }
};

const resolveHermesRoot = () => {
  const override = process.env.HERMES_HOME?.trim();
  if (override) return override;
  return path.join(os.homedir(), ".hermes");
};

/** Lists the primary state.db plus every profile state.db on this machine. */
const listStateDbs = (root: string): Array<{ profile: string; file: string }> => {
  const entries: Array<{ profile: string; file: string }> = [];
  const primary = path.join(root, "state.db");
  if (existsSync(primary)) entries.push({ profile: "default", file: primary });
  const profilesDir = path.join(root, "profiles");
  if (!existsSync(profilesDir)) return entries;
  try {
    for (const name of readdirSync(profilesDir)) {
      const file = path.join(profilesDir, name, "state.db");
      if (existsSync(file)) entries.push({ profile: name, file });
    }
  } catch {
    // Ignore unreadable profile directories; the primary db is enough.
  }
  return entries;
};

const readRows = (db: StateDb, profile: string, sinceUnix: number): UsageSummaryRow[] => {
  const rows = db.prepare(
    `SELECT session_key, model, input_tokens, output_tokens, cache_read_tokens,
            cache_write_tokens, estimated_cost_usd, actual_cost_usd, cost_status
       FROM sessions
      WHERE COALESCE(last_activity_at, started_at) >= ?
      ORDER BY COALESCE(last_activity_at, started_at) DESC
      LIMIT 5000`,
  ).all(sinceUnix);

  return rows.map((raw) => {
    const row = raw as Record<string, unknown>;
    const asCount = (value: unknown) =>
      typeof value === "number" && Number.isFinite(value) ? value : 0;
    const asOptionalNumber = (value: unknown) =>
      typeof value === "number" && Number.isFinite(value) ? value : null;
    return {
      sessionKey: typeof row.session_key === "string" ? row.session_key : "unknown",
      model: typeof row.model === "string" ? row.model : null,
      profileName: profile,
      inputTokens: asCount(row.input_tokens),
      outputTokens: asCount(row.output_tokens),
      cacheReadTokens: asCount(row.cache_read_tokens),
      cacheWriteTokens: asCount(row.cache_write_tokens),
      estimatedCostUsd: asOptionalNumber(row.estimated_cost_usd),
      actualCostUsd: asOptionalNumber(row.actual_cost_usd),
      costStatus: typeof row.cost_status === "string" ? row.cost_status : null,
    } satisfies UsageSummaryRow;
  });
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const daysParam = Number(url.searchParams.get("days") ?? "7");
  const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 365) : 7;
  const sinceUnix = Math.floor(Date.now() / 1000) - days * 86_400;

  const dbs = listStateDbs(resolveHermesRoot());
  if (dbs.length === 0) {
    return NextResponse.json(
      { available: false, days, error: "No local Hermes state database found." },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const rows: UsageSummaryRow[] = [];
  const attempts: DbAttempt[] = [];
  let opened = 0;
  for (const entry of dbs) {
    const result = openStateDb(entry.file);
    if (!result.db) {
      attempts.push({ profile: entry.profile, opened: false, detail: result.detail });
      continue;
    }
    opened += 1;
    attempts.push({ profile: entry.profile, opened: true });
    try {
      rows.push(...readRows(result.db, entry.profile, sinceUnix));
    } catch (error) {
      // A profile with an unmigrated schema should not break the whole bar.
      attempts[attempts.length - 1].detail =
        error instanceof Error ? error.message : String(error);
    } finally {
      result.db.close?.();
    }
  }

  if (opened === 0) {
    return NextResponse.json(
      { available: false, days, error: "Local SQLite reader unavailable.", attempts },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      available: true,
      days,
      profiles: dbs.map((entry) => entry.profile),
      summary: aggregateUsageRows(rows),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
