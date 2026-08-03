import type { View, Conviction, HistoryEntry } from "@/lib/sectors";

export interface CompanyFields {
  company: string;
  ticker: string;
  sector: string;
  view: View;
  conviction: Conviction;
  lastUpdated: string;
  catalysts: string[];
  history: HistoryEntry[];
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function serializeCompanyMarkdown(
  fields: CompanyFields,
  body: string
): string {
  const catalystsBlock =
    fields.catalysts.length > 0
      ? fields.catalysts.map((c) => `  - ${yamlString(c)}`).join("\n")
      : "  []";

  const historyBlock =
    fields.history.length > 0
      ? fields.history
          .map(
            (h) => `  - date: ${yamlString(h.date)}\n    note: ${yamlString(h.note)}`
          )
          .join("\n")
      : "  []";

  return `---
company: ${yamlString(fields.company)}
ticker: ${yamlString(fields.ticker)}
sector: ${yamlString(fields.sector)}
view: ${yamlString(fields.view)}
conviction: ${yamlString(fields.conviction)}
lastUpdated: ${yamlString(fields.lastUpdated)}
catalysts:
${catalystsBlock}
history:
${historyBlock}
---

${body.trim()}
`;
}

/** Unescapes a double-quoted YAML scalar, e.g. "Titan\\"s Co" -> Titan"s Co */
function unquote(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  return trimmed;
}

export function parseCompanyMarkdown(raw: string): {
  fields: CompanyFields;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("File does not look like a company markdown file");
  }
  const [, frontmatter, body] = match;
  const lines = frontmatter.split("\n");

  const fields: CompanyFields = {
    company: "",
    ticker: "",
    sector: "",
    view: "Watching",
    conviction: "Low",
    lastUpdated: "",
    catalysts: [],
    history: [],
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const simple = line.match(/^(\w+):\s*(.*)$/);
    if (simple && simple[2].trim() !== "") {
      const [, key, value] = simple;
      const unquoted = unquote(value);
      if (key === "company") fields.company = unquoted;
      else if (key === "ticker") fields.ticker = unquoted;
      else if (key === "sector") fields.sector = unquoted;
      else if (key === "view") fields.view = unquoted as View;
      else if (key === "conviction") fields.conviction = unquoted as Conviction;
      else if (key === "lastUpdated") fields.lastUpdated = unquoted;
      i++;
      continue;
    }

    if (line.startsWith("catalysts:")) {
      i++;
      while (i < lines.length && lines[i].startsWith("  - ")) {
        fields.catalysts.push(unquote(lines[i].slice(4)));
        i++;
      }
      continue;
    }

    if (line.startsWith("history:")) {
      i++;
      while (i < lines.length && lines[i].startsWith("  - date:")) {
        const date = unquote(lines[i].slice("  - date:".length));
        let note = "";
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith("note:")) {
          note = unquote(lines[i + 1].trim().slice("note:".length));
          i++;
        }
        fields.history.push({ date, note });
        i++;
      }
      continue;
    }

    i++;
  }

  return { fields, body: body.trim() };
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
