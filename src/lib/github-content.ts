export const REPO_OWNER = "akhileshb1999";
export const REPO_NAME = "website";

export interface GithubFile {
  path: string;
  sha: string;
  content: string;
}

export interface GithubDirEntry {
  name: string;
  path: string;
  type: "file" | "dir";
}

function apiHeaders(token: string): HeadersInit {
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function utf8ToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(b64: string): string {
  return decodeURIComponent(escape(atob(b64.replace(/\n/g, ""))));
}

async function githubRequest(
  path: string,
  token: string,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    { ...init, headers: { ...apiHeaders(token), ...(init?.headers ?? {}) } }
  );
  return res;
}

export async function listDir(
  dirPath: string,
  branch: string,
  token: string
): Promise<GithubDirEntry[]> {
  const res = await githubRequest(`${dirPath}?ref=${encodeURIComponent(branch)}`, token);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Failed to list ${dirPath}: ${res.status}`);
  const data = (await res.json()) as GithubDirEntry[];
  return Array.isArray(data) ? data : [];
}

export async function getFile(
  filePath: string,
  branch: string,
  token: string
): Promise<GithubFile | null> {
  const res = await githubRequest(`${filePath}?ref=${encodeURIComponent(branch)}`, token);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch ${filePath}: ${res.status}`);
  const data = (await res.json()) as { sha: string; content: string };
  return { path: filePath, sha: data.sha, content: base64ToUtf8(data.content) };
}

export async function putFile(
  filePath: string,
  content: string,
  message: string,
  branch: string,
  token: string,
  sha?: string
): Promise<void> {
  const res = await githubRequest(filePath, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: utf8ToBase64(content),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to write ${filePath}: ${res.status} ${body}`);
  }
}

export async function deleteFile(
  filePath: string,
  message: string,
  branch: string,
  token: string,
  sha: string
): Promise<void> {
  const res = await githubRequest(filePath, token, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha, branch }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to delete ${filePath}: ${res.status} ${body}`);
  }
}
