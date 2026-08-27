import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
        T
      </span>
      Talent AI
    </span>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-[spin_0.7s_linear_infinite] ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-surface shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  loading,
  variant = "primary",
  className = "",
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
    secondary: "border border-border bg-surface text-foreground hover:bg-surface-hover",
    ghost: "text-muted hover:text-foreground hover:bg-surface-hover",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-accent ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-accent ${className}`}
      {...props}
    />
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" }) {
  const tones = {
    default: "bg-surface-hover text-muted",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
      {children}
    </p>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-12 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}
