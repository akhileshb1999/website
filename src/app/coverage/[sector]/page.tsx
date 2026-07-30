import { notFound } from "next/navigation";
import Link from "next/link";
import { SECTORS, getSector, getCompaniesForSector } from "@/lib/content";
import ViewFilter from "@/components/ViewFilter";

export function generateStaticParams() {
  return SECTORS.map((sector) => ({ sector: sector.slug }));
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ sector: string }>;
}) {
  const { sector: sectorSlug } = await params;
  const sector = getSector(sectorSlug);
  if (!sector) notFound();

  const companies = getCompaniesForSector(sectorSlug);

  return (
    <div>
      <Link href="/coverage" className="text-sm text-muted hover:text-foreground">
        ← Coverage
      </Link>
      <h1 className="mt-3 font-serif text-3xl">{sector.label}</h1>
      <p className="mt-2 text-muted">
        {companies.length} {companies.length === 1 ? "company" : "companies"}{" "}
        under coverage.
      </p>

      <div className="mt-8">
        <ViewFilter companies={companies} />
      </div>
    </div>
  );
}
