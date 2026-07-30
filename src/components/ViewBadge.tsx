import type { View } from "@/lib/content";

const STYLES: Record<View, string> = {
  Bullish:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  Bearish: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
  Neutral: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  Watching: "bg-muted/10 text-muted border-border",
};

export default function ViewBadge({ view }: { view: View }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide ${STYLES[view]}`}
    >
      {view}
    </span>
  );
}
