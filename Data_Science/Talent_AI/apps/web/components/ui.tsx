import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap font-semibold tracking-tight ${className}`}>
      <span
        aria-hidden="true"
        className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground"
      >
        T
      </span>
      Talent AI
    </span>
  );
}

/** Loading indicator. Standalone it's announced as "Loading" to screen
 * readers; inside something that already says what's happening (a button
 * reading "Uploading..."), pass `decorative` so it isn't announced twice. */
export function Spinner({
  className = "h-4 w-4",
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <svg
      className={`animate-[spin_0.7s_linear_infinite] ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      {...(decorative ? { "aria-hidden": true } : { role: "status", "aria-label": "Loading" })}
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
  // min-h-10 keeps even the compact buttons a comfortable tap target. The
  // press scale is skipped for reduced motion and for disabled buttons.
  const base =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 ease-snappy motion-safe:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";
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
      {loading && <Spinner className="h-4 w-4" decorative />}
      {children}
    </button>
  );
}

// 16px text on phones: iOS zooms the page when you focus a field with
// anything smaller. 14px from the sm breakpoint up.
const fieldClass =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-base text-foreground placeholder:text-muted transition-colors focus:border-accent sm:text-sm";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClass} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${fieldClass} ${className}`} {...props} />;
}

/** A visible label above a form control, with optional help text under it.
 * Placeholders only show an example; the label is what names the field. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
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

/** role="alert" so screen readers announce the error as soon as it appears. */
export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
    >
      {children}
    </p>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}
