import Link from "next/link";
import type { Sector } from "@/lib/content";

export default function SectorCard({
  sector,
  companyCount,
}: {
  sector: Sector;
  companyCount: number;
}) {
  return (
    <Link
      href={`/coverage/${sector.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/30"
    >
      <div>
        <h3 className="font-serif text-xl">{sector.label}</h3>
        <p className="mt-2 text-sm text-muted">
          {companyCount} {companyCount === 1 ? "company" : "companies"} under
          coverage
        </p>
      </div>
      <span className="mt-6 text-sm text-foreground/70 transition group-hover:text-foreground">
        View sector →
      </span>
    </Link>
  );
}
