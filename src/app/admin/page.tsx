"use client";

import { useState } from "react";
import { useAdminAuth } from "./useAdminAuth";
import { Button, Card, Field, Input } from "./ui";
import CoverageEditor from "./CoverageEditor";
import AboutEditor from "./AboutEditor";
import ProfileEditor from "./ProfileEditor";
import ReadingEditor from "./ReadingEditor";
import WhatsNewEditor from "./WhatsNewEditor";

const TABS = [
  { key: "coverage", label: "Coverage" },
  { key: "about", label: "About Me" },
  { key: "profile", label: "Profile" },
  { key: "reading", label: "Reading" },
  { key: "whats-new", label: "What's New" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminPage() {
  const { token, branch, setToken, setBranch, signOut } = useAdminAuth();
  const [tab, setTab] = useState<TabKey>("coverage");

  if (!token) {
    return <TokenSetup onSave={setToken} branch={branch} onBranchChange={setBranch} />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl">Admin</h1>
        <Button variant="secondary" onClick={signOut}>
          Sign out
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted">
        Editing content on branch <code className="font-mono">{branch}</code>.
        Changes commit directly to GitHub and go live after the deploy
        workflow runs.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              tab === t.key
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "coverage" && <CoverageEditor token={token} branch={branch} />}
        {tab === "about" && <AboutEditor token={token} branch={branch} />}
        {tab === "profile" && <ProfileEditor token={token} branch={branch} />}
        {tab === "reading" && <ReadingEditor token={token} branch={branch} />}
        {tab === "whats-new" && <WhatsNewEditor token={token} branch={branch} />}
      </div>
    </div>
  );
}

function TokenSetup({
  onSave,
  branch,
  onBranchChange,
}: {
  onSave: (token: string) => void;
  branch: string;
  onBranchChange: (branch: string) => void;
}) {
  const [tokenInput, setTokenInput] = useState("");
  const [branchInput, setBranchInput] = useState(branch);

  return (
    <div>
      <h1 className="font-serif text-3xl">Admin</h1>
      <p className="mt-3 max-w-xl text-muted">
        This page edits your site&apos;s content directly on GitHub. It needs a
        personal access token to write on your behalf. The token is stored
        only in this browser&apos;s local storage — it is never sent anywhere
        except GitHub&apos;s API, and never committed to the repo.
      </p>

      <Card>
        <div className="mt-0 flex flex-col gap-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>
              Go to{" "}
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground"
              >
                github.com/settings/personal-access-tokens/new
              </a>
            </li>
            <li>
              Under &quot;Repository access&quot;, choose &quot;Only select
              repositories&quot; and pick <code className="font-mono">website</code>
            </li>
            <li>
              Under &quot;Permissions → Repository permissions&quot;, set{" "}
              <strong>Contents</strong> to <strong>Read and write</strong> —
              leave everything else as No access
            </li>
            <li>Generate the token and paste it below</li>
          </ol>

          <Field label="GitHub personal access token">
            <Input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="github_pat_..."
            />
          </Field>

          <Field label="Branch to edit">
            <Input
              value={branchInput}
              onChange={(e) => setBranchInput(e.target.value)}
            />
          </Field>

          <Button
            onClick={() => {
              onBranchChange(branchInput);
              onSave(tokenInput);
            }}
            disabled={!tokenInput || !branchInput}
            className="self-start"
          >
            Save and continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
