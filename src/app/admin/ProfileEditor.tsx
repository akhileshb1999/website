"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/sectors";
import { getFile, putFile } from "@/lib/github-content";
import { Button, Card, Field, Input, StatusBanner } from "./ui";

type Status = { type: "error" | "success"; message: string } | null;
const PATH = "src/content/profile.json";

const EMPTY_PROFILE: Profile = {
  name: "",
  title: "",
  tagline: "",
  location: "",
  email: "",
  links: { linkedin: "", twitter: "", substack: "" },
};

export default function ProfileEditor({
  token,
  branch,
}: {
  token: string;
  branch: string;
}) {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
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
          setProfile(JSON.parse(file.content) as Profile);
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

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const content = `${JSON.stringify(profile, null, 2)}\n`;
      await putFile(PATH, content, "Update profile", branch, token, sha);
      setStatus({ type: "success", message: "Saved profile." });
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </Field>
          <Field label="Title">
            <Input
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
            />
          </Field>
          <Field label="Tagline">
            <Input
              value={profile.tagline}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
            />
          </Field>
          <Field label="Location">
            <Input
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </Field>
          <Field label="LinkedIn URL">
            <Input
              value={profile.links.linkedin}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  links: { ...profile.links, linkedin: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Twitter / X URL">
            <Input
              value={profile.links.twitter}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  links: { ...profile.links, twitter: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Substack URL">
            <Input
              value={profile.links.substack}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  links: { ...profile.links, substack: e.target.value },
                })
              }
            />
          </Field>
        </div>
      </Card>
      <Button onClick={save} disabled={saving} className="self-start">
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
