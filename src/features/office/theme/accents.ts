/**
 * Accent palette for the office UI chrome.
 *
 * One tone per team area so panels, headings and name badges read as a
 * coherent set instead of ad-hoc colors:
 *   founder  → emerald (vision / HQ)
 *   IT       → amber   (war room, worker room, playing room)
 *   planning → cyan    (planning & collaboration)
 *   social   → pink    (social media studio)
 *
 * All values are static Tailwind class strings so the JIT compiler can see
 * them. Add new tones here instead of inlining classNames in components.
 */
export type OfficeAccentTone = {
  /** Section heading text color. */
  heading: string;
  /** Card / list-row background + border. */
  card: string;
  /** Highlighted name inside a row. */
  name: string;
  /** Small badge (e.g. "Founder"). */
  badge: string;
};

export const OFFICE_ACCENTS = {
  founder: {
    heading: "text-emerald-100",
    card: "border border-emerald-400/15 bg-emerald-950/20",
    name: "text-emerald-200",
    badge: "border border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  },
  it: {
    heading: "text-amber-100",
    card: "border border-amber-400/10 bg-amber-950/15",
    name: "text-amber-100",
    badge: "border border-amber-400/30 bg-amber-400/10 text-amber-100",
  },
  planning: {
    heading: "text-cyan-100",
    card: "border border-cyan-400/10 bg-cyan-950/15",
    name: "text-cyan-100",
    badge: "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
  },
  social: {
    heading: "text-pink-100",
    card: "border border-pink-400/10 bg-pink-950/15",
    name: "text-pink-100",
    badge: "border border-pink-400/30 bg-pink-400/10 text-pink-100",
  },
} as const satisfies Record<string, OfficeAccentTone>;

export type OfficeAccentKey = keyof typeof OFFICE_ACCENTS;
