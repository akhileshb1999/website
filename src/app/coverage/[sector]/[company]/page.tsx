import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getAllCompanies, getCompany } from "@/lib/content";
import ViewBadge from "@/components/ViewBadge";
import Disclaimer from "@/components/Disclaimer";

export function generateStaticParams() {
  return getAllCompanies().map((company) => ({
    sector: company.sectorSlug,
    company: company.slug,
  }));
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ sector: string; company: string }>;
}) {
  const { sector: sectorSlug, company: companySlug } = await params;
  const company = getCompany(sectorSlug, companySlug);
  if (!company) notFound();

  return (
    <article>
      <Link
        href={`/coverage/${sectorSlug}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← {company.sector}
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl">{company.company}</h1>
        <span className="font-mono text-sm text-muted">{company.ticker}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <ViewBadge view={company.view} />
        <span className="text-sm text-muted">
          Conviction: {company.conviction}
        </span>
        <span className="text-sm text-muted">
          Updated {company.lastUpdated}
        </span>
      </div>

      {company.catalysts?.length > 0 && (
        <div className="mt-6">
          <h2 className="font-serif text-lg">Key Monitorables</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {company.catalysts.map((catalyst) => (
              <li key={catalyst}>{catalyst}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-serif text-lg">Investment Thesis</h2>
        <div className="prose-custom mt-2">
          <ReactMarkdown
            components={{
              h2: (props) => (
                <h2 className="mt-8 font-serif text-xl" {...props} />
              ),
              p: (props) => <p className="mt-4 leading-relaxed" {...props} />,
              ul: (props) => (
                <ul className="mt-3 list-disc space-y-1 pl-5" {...props} />
              ),
            }}
          >
            {company.body}
          </ReactMarkdown>
        </div>
      </div>

      {company.history?.length > 0 && (
        <div className="mt-10">
          <h2 className="font-serif text-lg">History</h2>
          <ul className="mt-3 space-y-3 border-l border-border pl-4">
            {company.history.map((entry) => (
              <li key={`${entry.date}-${entry.note}`} className="text-sm">
                <span className="font-mono text-xs text-muted">
                  {entry.date}
                </span>
                <p className="mt-1">{entry.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10">
        <Disclaimer />
      </div>
    </article>
  );
}
