"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={`${fieldClass} ${props.className ?? ""}`} />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const styles = {
    primary: "bg-foreground text-background hover:opacity-90",
    secondary: "border border-border hover:border-foreground/30",
    danger: "border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10",
  };
  return (
    <button
      {...props}
      className={`rounded-full px-4 py-2 text-sm transition disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">{children}</div>
  );
}

export function StatusBanner({
  status,
}: {
  status: { type: "error" | "success"; message: string } | null;
}) {
  if (!status) return null;
  return (
    <p
      className={`rounded-lg border px-3 py-2 text-sm ${
        status.type === "error"
          ? "border-red-500/40 text-red-600 dark:text-red-400"
          : "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
      }`}
    >
      {status.message}
    </p>
  );
}
