import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { SECTORS } from "@/lib/sectors";
import type {
  Sector,
  View,
  Conviction,
  HistoryEntry,
  Profile,
  ReadingItem,
  WhatsNewItem,
} from "@/lib/sectors";

export { SECTORS };
export type { Sector, View, Conviction, HistoryEntry, Profile, ReadingItem, WhatsNewItem };

const CONTENT_DIR = path.join(process.cwd(), "src", "content");

export interface Company {
  slug: string;
  sectorSlug: string;
  company: string;
  ticker: string;
  sector: string;
  view: View;
  conviction: Conviction;
  lastUpdated: string;
  catalysts: string[];
  history: HistoryEntry[];
  body: string;
}

export function getSector(sectorSlug: string): Sector | undefined {
  return SECTORS.find((s) => s.slug === sectorSlug);
}

export function getCompaniesForSector(sectorSlug: string): Company[] {
  const dir = path.join(CONTENT_DIR, "coverage", sectorSlug);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        sectorSlug,
        body: content.trim(),
        ...(data as Omit<Company, "slug" | "sectorSlug" | "body">),
      };
    })
    .sort((a, b) => a.company.localeCompare(b.company));
}

export function getAllCompanies(): Company[] {
  return SECTORS.flatMap((sector) => getCompaniesForSector(sector.slug));
}

export function getCompany(
  sectorSlug: string,
  companySlug: string
): Company | undefined {
  return getCompaniesForSector(sectorSlug).find((c) => c.slug === companySlug);
}

export function getProfile(): Profile {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "profile.json"), "utf-8");
  return JSON.parse(raw) as Profile;
}

export function getAboutMarkdown(): string {
  return fs.readFileSync(path.join(CONTENT_DIR, "about.md"), "utf-8");
}

export function getReadingList(): ReadingItem[] {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "reading.json"), "utf-8");
  return JSON.parse(raw) as ReadingItem[];
}

export function getWhatsNew(): WhatsNewItem[] {
  const raw = fs.readFileSync(
    path.join(CONTENT_DIR, "whats-new.json"),
    "utf-8"
  );
  return JSON.parse(raw) as WhatsNewItem[];
}
