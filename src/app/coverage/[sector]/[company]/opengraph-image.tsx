import { ImageResponse } from "next/og";
import { getAllCompanies, getCompany } from "@/lib/content";

export const alt = "Coverage thesis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllCompanies().map((company) => ({
    sector: company.sectorSlug,
    company: company.slug,
  }));
}

const VIEW_COLOR: Record<string, string> = {
  Bullish: "#10b981",
  Bearish: "#ef4444",
  Neutral: "#f59e0b",
  Watching: "#a1a1aa",
};

export default async function Image({
  params,
}: {
  params: Promise<{ sector: string; company: string }>;
}) {
  const { sector: sectorSlug, company: companySlug } = await params;
  const company = getCompany(sectorSlug, companySlug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0a09",
          color: "#f5f5f4",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#a1a1aa", display: "flex" }}>
          {company?.sector ?? "Coverage"}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, display: "flex" }}>
            {company?.company ?? "Company"}
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#a1a1aa",
              marginTop: 16,
              display: "flex",
            }}
          >
            {company?.ticker}
          </div>
        </div>
        <div
          style={{
            fontSize: 28,
            color: company ? VIEW_COLOR[company.view] : "#a1a1aa",
            display: "flex",
          }}
        >
          {company?.view ?? "Watching"}
        </div>
      </div>
    ),
    { ...size }
  );
}
