"use client";

import { useEffect, useState } from "react";
import type { ReadingItem } from "@/lib/sectors";
import { getFile, putFile } from "@/lib/github-content";
import { Button, Card, Field, Input, StatusBanner, Textarea } from "./ui";

type Status = { type: "error" | "success"; message: string } | null;
const PATH = "src/content/reading.json";

function blank(): ReadingItem {
  return {
    title: "",
    author: "",
    status: "Reading",
    takeaway: "",
    tags: [],
    date: new Date().toISOString().slice(0, 10),
  };
}

export default function ReadingEditor({
  token,
  branch,
}: {
  token: string;
  branch: string;
}) {
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [sha, setSha] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const file = await getFile(PATH, branch, token);
        if (file) {
          setItems(JSON.parse(file.content) as ReadingItem[]);
          setSha(file.sha);
        }
      } catch (err) {
        setStatus({ type: "error", message: (err as Error).message });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch]);

  function update(index: number, patch: Partial<ReadingItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const content = `${JSON.stringify(items, null, 2)}\n`;
      await putFile(PATH, content, "Update reading list", branch, token, sha);
      setStatus({ type: "success", message: "Saved reading list." });
      const file = await getFile(PATH, branch, token);
      setSha(file?.sha);
    } catch (err) {
      setStatus({ type: "error", message: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="flex flex-col gap-4">
      <StatusBanner status={status} />
      {items.map((item, i) => (
        <Card key={i}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={item.title}
                onChange={(e) => update(i, { title: e.target.value })}
              />
            </Field>
            <Field label="Author">
              <Input
                value={item.author}
                onChange={(e) => update(i, { author: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <Input
                value={item.status}
                onChange={(e) => update(i, { status: e.target.value })}
              />
            </Field>
            <Field label="Date">
              <Input
                type="date"
                value={item.date}
                onChange={(e) => update(i, { date: e.target.value })}
              />
            </Field>
            <Field label="Tags (comma-separated)">
              <Input
                value={item.tags.join(", ")}
                onChange={(e) =>
                  update(i, {
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Takeaway">
              <Textarea
                rows={3}
                value={item.takeaway}
                onChange={(e) => update(i, { takeaway: e.target.value })}
              />
            </Field>
          </div>
          <Button
            variant="danger"
            className="mt-3"
            onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
          >
            Remove
          </Button>
        </Card>
      ))}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setItems((prev) => [...prev, blank()])}>
          + Add item
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
