export type View = "Bullish" | "Bearish" | "Neutral" | "Watching";
export type Conviction = "High" | "Medium" | "Low";

export interface Sector {
  slug: string;
  label: string;
}

export const SECTORS: Sector[] = [
  { slug: "consumer", label: "Consumer" },
  { slug: "logistics", label: "Logistics" },
  { slug: "capital-markets", label: "Capital Markets" },
];

export interface HistoryEntry {
  date: string;
  note: string;
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  links: {
    linkedin: string;
    twitter: string;
    substack: string;
  };
}

export interface ReadingItem {
  title: string;
  author: string;
  status: string;
  takeaway: string;
  tags: string[];
  date: string;
}

export interface WhatsNewItem {
  title: string;
  description: string;
  link?: string;
  date: string;
}
