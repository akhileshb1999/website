import Link from "next/link";
import type { Company } from "@/lib/content";
import ViewBadge from "./ViewBadge";

export default function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      href={`/coverage/${company.sectorSlug}/${company.slug}`}
      className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 transition hover:border-foreground/30 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-lg">{company.company}</h3>
          <span className="font-mono text-xs text-muted">
            {company.ticker}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Updated {company.lastUpdated}
        </p>
      </div>
      <ViewBadge view={company.view} />
    </Link>
  );
}
