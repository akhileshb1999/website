"use client";

import { useEffect, useState } from "react";
import { getFile, putFile } from "@/lib/github-content";
import { Button, Card, StatusBanner, Textarea } from "./ui";

type Status = { type: "error" | "success"; message: string } | null;
const PATH = "src/content/about.md";

export default function AboutEditor({
  token,
  branch,
}: {
  token: string;
  branch: string;
}) {
  const [content, setContent] = useState("");
  const [sha, setSha] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const file = await getFile(PATH, branch, token);
        setContent(file?.content ?? "");
        setSha(file?.sha);
      } catch (err) {
        setStatus({ type: "error", message: (err as Error).message });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch]);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      await putFile(PATH, content, "Update About Me", branch, token, sha);
      setStatus({ type: "success", message: "Saved About Me." });
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
      <Card>
        <Textarea
          rows={20}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="font-mono"
        />
      </Card>
      <Button onClick={save} disabled={saving} className="self-start">
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
