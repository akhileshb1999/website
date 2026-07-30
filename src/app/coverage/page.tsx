import { SECTORS, getCompaniesForSector } from "@/lib/content";
import SectorCard from "@/components/SectorCard";

export default function CoveragePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl">Coverage</h1>
      <p className="mt-3 max-w-xl text-muted">
        Sectors I follow, and the companies within each one I have a view on.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SECTORS.map((sector) => (
          <SectorCard
            key={sector.slug}
            sector={sector}
            companyCount={getCompaniesForSector(sector.slug).length}
          />
        ))}
      </div>
    </div>
  );
}
