"use client";

import { useMemo, useState } from "react";
import type { Company, View } from "@/lib/content";
import CompanyCard from "./CompanyCard";

const OPTIONS: (View | "All")[] = ["All", "Bullish", "Bearish", "Neutral", "Watching"];

export default function ViewFilter({ companies }: { companies: Company[] }) {
  const [filter, setFilter] = useState<(typeof OPTIONS)[number]>("All");

  const filtered = useMemo(
    () =>
      filter === "All" ? companies : companies.filter((c) => c.view === filter),
    [companies, filter]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition ${
              filter === option
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">No companies match this view.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}
