import * as React from "react";
import { X } from "lucide-react";

export interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  ariaLabel = "Tags",
}: TagInputProps) {
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    if (value.some((v) => v.toLowerCase() === t.toLowerCase())) return;
    onChange([...value, t]);
    setDraft("");
  };

  const remove = (t: string) => onChange(value.filter((v) => v !== t));

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-border-strong bg-surface-raised px-3 py-2.5 min-h-[56px] focus-within:border-earth transition-colors"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1.5 rounded-full bg-earth-light pl-3 pr-1 py-1 text-[13px] font-medium text-earth-dark origin-left animate-tag-pop motion-reduce:animate-none"
        >
          {t}
          <button
            type="button"
            aria-label={`Remove ${t}`}
            onClick={(e) => {
              e.stopPropagation();
              remove(t);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-[color-mix(in_oklab,var(--earth)_30%,transparent)] transition-colors"
          >
            <X size={12} strokeWidth={2} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        aria-label={ariaLabel}
        value={draft}
        placeholder={value.length ? "" : placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            remove(value[value.length - 1]);
          }
        }}
        onBlur={() => add(draft)}
        className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-[14px] text-ink placeholder:text-ink-tertiary py-1"
      />
    </div>
  );
}