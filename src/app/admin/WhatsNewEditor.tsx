"use client";

import { useEffect, useState } from "react";
import type { WhatsNewItem } from "@/lib/sectors";
import { getFile, putFile } from "@/lib/github-content";
import { Button, Card, Field, Input, StatusBanner, Textarea } from "./ui";

type Status = { type: "error" | "success"; message: string } | null;
const PATH = "src/content/whats-new.json";

function blank(): WhatsNewItem {
  return {
    title: "",
    description: "",
    link: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

export default function WhatsNewEditor({
  token,
  branch,
}: {
  token: string;
  branch: string;
}) {
  const [items, setItems] = useState<WhatsNewItem[]>([]);
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
          setItems(JSON.parse(file.content) as WhatsNewItem[]);
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

  function update(index: number, patch: Partial<WhatsNewItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const content = `${JSON.stringify(items, null, 2)}\n`;
      await putFile(PATH, content, "Update what's new", branch, token, sha);
      setStatus({ type: "success", message: "Saved what's new." });
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
            <Field label="Date">
              <Input
                type="date"
                value={item.date}
                onChange={(e) => update(i, { date: e.target.value })}
              />
            </Field>
            <Field label="Link (optional)">
              <Input
                value={item.link ?? ""}
                onChange={(e) => update(i, { link: e.target.value })}
              />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Description">
              <Textarea
                rows={3}
                value={item.description}
                onChange={(e) => update(i, { description: e.target.value })}
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
