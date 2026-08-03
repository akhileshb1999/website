"use client";

import { useSyncExternalStore } from "react";

const TOKEN_KEY = "admin_github_token";
const BRANCH_KEY = "admin_github_branch";
const DEFAULT_BRANCH = "claude/portfolio-website-plan-rv2zng";

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

function getTokenSnapshot() {
  return localStorage.getItem(TOKEN_KEY);
}

function getBranchSnapshot() {
  return localStorage.getItem(BRANCH_KEY) ?? DEFAULT_BRANCH;
}

function getServerTokenSnapshot() {
  return null;
}

function getServerBranchSnapshot() {
  return DEFAULT_BRANCH;
}

export function useAdminAuth() {
  const token = useSyncExternalStore(
    subscribe,
    getTokenSnapshot,
    getServerTokenSnapshot
  );
  const branch = useSyncExternalStore(
    subscribe,
    getBranchSnapshot,
    getServerBranchSnapshot
  );

  function setToken(value: string) {
    localStorage.setItem(TOKEN_KEY, value);
    notify();
  }

  function setBranch(value: string) {
    localStorage.setItem(BRANCH_KEY, value);
    notify();
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    notify();
  }

  return { token, branch, setToken, setBranch, signOut };
}
