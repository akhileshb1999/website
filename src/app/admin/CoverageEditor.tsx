"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SECTORS } from "@/lib/sectors";
import type { View, Conviction } from "@/lib/sectors";
import { listDir, getFile, putFile, deleteFile } from "@/lib/github-content";
import {
  parseCompanyMarkdown,
  serializeCompanyMarkdown,
  slugify,
  type CompanyFields,
} from "@/lib/coverage-markdown";
import { Field, Input, Textarea, Select, Button, Card, StatusBanner } from "./ui";

interface CompanyRow {
  slug: string;
  path: string;
  sha: string;
  fields: CompanyFields;
  body: string;
}

type Status = { type: "error" | "success"; message: string } | null;

const VIEWS: View[] = ["Bullish", "Bearish", "Neutral", "Watching"];
const CONVICTIONS: Conviction[] = ["High", "Medium", "Low"];

function blankFields(sectorLabel: string): CompanyFields {
  return {
    company: "",
    ticker: "",
    sector: sectorLabel,
    view: "Watching",
    conviction: "Low",
    lastUpdated: new Date().toISOString().slice(0, 10),
    catalysts: [],
    history: [],
  };
}

export default function CoverageEditor({
  token,
  branch,
}: {
  token: string;
  branch: string;
}) {
  const [sectorSlug, setSectorSlug] = useState(SECTORS[0].slug);
  const [rows, setRows] = useState<CompanyRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [editingRow, setEditingRow] = useState<CompanyRow | "new" | null>(null);

  const sector = SECTORS.find((s) => s.slug === sectorSlug) ?? SECTORS[0];
  const dirPath = `src/content/coverage/${sectorSlug}`;

  async function loadRows() {
    setLoading(true);
    setStatus(null);
    try {
      const entries = await listDir(dirPath, branch, token);
      const files = entries.filter(
        (e) => e.type === "file" && e.name.endsWith(".md")
      );
      const loaded = await Promise.all(
        files.map(async (entry): Promise<CompanyRow | null> => {
          const file = await getFile(entry.path, branch, token);
          if (!file) return null;
          const { fields, body } = parseCompanyMarkdown(file.content);
          return {
            slug: entry.name.replace(/\.md$/, ""),
            path: entry.path,
            sha: file.sha,
            fields,
            body,
          };
        })
      );
      const nonNull = loaded.filter((r): r is CompanyRow => r !== null);
      nonNull.sort((a, b) => a.fields.company.localeCompare(b.fields.company));
      setRows(nonNull);
    } catch (err) {
      setStatus({ type: "error", message: (err as Error).message });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // loadRows sets loading/status state before its first await, which is
    // the standard data-fetching-on-mount pattern (matches React's own
    // effect docs) and intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectorSlug]);

  function selectSector(slug: string) {
    setSectorSlug(slug);
    setEditingRow(null);
  }

  async function handleSave(
    fields: CompanyFields,
    body: string,
    existing: CompanyRow | null
  ) {
    setStatus(null);
    try {
      const slug = existing ? existing.slug : slugify(fields.company);
      const path = existing ? existing.path : `${dirPath}/${slug}.md`;

      if (!existing) {
        const clash = await getFile(path, branch, token);
        if (clash) {
          setStatus({
            type: "error",
            message: `A file already exists at ${path}. Edit it from the list instead.`,
          });
          return;
        }
      }

      const content = serializeCompanyMarkdown(fields, body);
      await putFile(
        path,
        content,
        `${existing ? "Update" : "Add"} coverage: ${fields.company}`,
        branch,
        token,
        existing?.sha
      );
      setStatus({ type: "success", message: `Saved ${fields.company}.` });
      setEditingRow(null);
      loadRows();
    } catch (err) {
      console.error("[admin] save failed:", err);
      setStatus({ type: "error", message: (err as Error).message });
    }
  }

  async function handleDelete(row: CompanyRow) {
    if (!confirm(`Delete ${row.fields.company}? This cannot be undone.`)) return;
    setStatus(null);
    try {
      await deleteFile(
        row.path,
        `Remove coverage: ${row.fields.company}`,
        branch,
        token,
        row.sha
      );
      setStatus({ type: "success", message: `Deleted ${row.fields.company}.` });
      setEditingRow(null);
      loadRows();
    } catch (err) {
      console.error("[admin] delete failed:", err);
      setStatus({ type: "error", message: (err as Error).message });
    }
  }

  if (editingRow) {
    return (
      <CompanyForm
        row={editingRow === "new" ? null : editingRow}
        sectorLabel={sector.label}
        status={status}
        onCancel={() => setEditingRow(null)}
        onSave={handleSave}
        onDelete={editingRow !== "new" ? () => handleDelete(editingRow) : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {SECTORS.map((s) => (
          <button
            key={s.slug}
            onClick={() => selectSector(s.slug)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              s.slug === sectorSlug
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
        <Button
          variant="secondary"
          className="ml-auto"
          onClick={() => setEditingRow("new")}
        >
          + Add company
        </Button>
      </div>

      <StatusBanner status={status} />

      {loading && <p className="text-sm text-muted">Loading…</p>}

      {!loading && rows && rows.length === 0 && (
        <p className="text-sm text-muted">No companies in {sector.label} yet.</p>
      )}

      {!loading && rows && rows.length > 0 && (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <button
              key={row.path}
              onClick={() => setEditingRow(row)}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition hover:border-foreground/30"
            >
              <div>
                <span className="font-serif">{row.fields.company}</span>{" "}
                <span className="font-mono text-xs text-muted">
                  {row.fields.ticker}
                </span>
              </div>
              <span className="font-mono text-xs uppercase text-muted">
                {row.fields.view}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted">
        Changes commit directly to{" "}
        <code className="font-mono">{branch}</code>. See it live on{" "}
        <Link href="/coverage" className="underline" target="_blank">
          the Coverage page
        </Link>{" "}
        once the deploy finishes.
      </p>
    </div>
  );
}

function CompanyForm({
  row,
  sectorLabel,
  status,
  onSave,
  onDelete,
  onCancel,
}: {
  row: CompanyRow | null;
  sectorLabel: string;
  status: Status;
  onSave: (
    fields: CompanyFields,
    body: string,
    existing: CompanyRow | null
  ) => Promise<void>;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [fields, setFields] = useState<CompanyFields>(
    row?.fields ?? blankFields(sectorLabel)
  );
  const [body, setBody] = useState(row?.body ?? "");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof CompanyFields>(key: K, value: CompanyFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function updateCatalyst(index: number, value: string) {
    const next = [...fields.catalysts];
    next[index] = value;
    update("catalysts", next);
  }

  function updateHistory(index: number, key: "date" | "note", value: string) {
    const next = fields.history.map((h, i) =>
      i === index ? { ...h, [key]: value } : h
    );
    update("history", next);
  }

  async function submit() {
    setSaving(true);
    try {
      await onSave(fields, body, row);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={onCancel}
        className="self-start text-sm text-muted hover:text-foreground"
      >
        ← Back to list
      </button>

      <StatusBanner status={status} />

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company">
            <Input
              value={fields.company}
              onChange={(e) => update("company", e.target.value)}
            />
          </Field>
          <Field label="Ticker">
            <Input
              value={fields.ticker}
              onChange={(e) => update("ticker", e.target.value)}
            />
          </Field>
          <Field label="View">
            <Select
              value={fields.view}
              onChange={(e) => update("view", e.target.value as View)}
            >
              {VIEWS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Conviction">
            <Select
              value={fields.conviction}
              onChange={(e) => update("conviction", e.target.value as Conviction)}
            >
              {CONVICTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Last updated">
            <Input
              type="date"
              value={fields.lastUpdated}
              onChange={(e) => update("lastUpdated", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <span className="block text-xs font-mono uppercase tracking-wide text-muted">
          Key Monitorables
        </span>
        <div className="mt-2 flex flex-col gap-2">
          {fields.catalysts.map((c, i) => (
            <div key={i} className="flex gap-2">
              <Input value={c} onChange={(e) => updateCatalyst(i, e.target.value)} />
              <Button
                variant="secondary"
                onClick={() =>
                  update(
                    "catalysts",
                    fields.catalysts.filter((_, idx) => idx !== i)
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() => update("catalysts", [...fields.catalysts, ""])}
          >
            + Add monitorable
          </Button>
        </div>
      </Card>

      <Card>
        <span className="block text-xs font-mono uppercase tracking-wide text-muted">
          History
        </span>
        <div className="mt-2 flex flex-col gap-3">
          {fields.history.map((h, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="date"
                value={h.date}
                onChange={(e) => updateHistory(i, "date", e.target.value)}
                className="sm:w-40"
              />
              <Input
                value={h.note}
                placeholder="e.g. Upgraded to Bullish on margin recovery"
                onChange={(e) => updateHistory(i, "note", e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={() =>
                  update(
                    "history",
                    fields.history.filter((_, idx) => idx !== i)
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() =>
              update("history", [
                ...fields.history,
                { date: new Date().toISOString().slice(0, 10), note: "" },
              ])
            }
          >
            + Add history entry
          </Button>
        </div>
      </Card>

      <Card>
        <Field label="Thesis (markdown)">
          <Textarea
            rows={14}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="font-mono"
          />
        </Field>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={submit} disabled={saving || !fields.company || !fields.ticker}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        {onDelete && (
          <Button variant="danger" onClick={onDelete} disabled={saving} className="ml-auto">
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
