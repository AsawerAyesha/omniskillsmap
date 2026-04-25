import { Globe } from "lucide-react";
import { useUnmappedMode } from "./mode-context";

const COUNTRIES = ["Ghana", "Kenya", "Bangladesh", "Peru", "Vietnam"];

export function CountryChip() {
  const { country, setCountry } = useUnmappedMode();
  return (
    <label className="relative inline-flex items-center gap-2 rounded-full border border-border-subtle bg-[var(--earth-light)] px-3 py-1.5 text-xs font-medium text-[var(--earth-dark)] cursor-pointer hover:bg-[color-mix(in_oklab,var(--earth)_25%,var(--earth-light))] transition-colors">
      <Globe size={14} strokeWidth={1.5} />
      <span>{country}</span>
      <select
        aria-label="Select country context"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      >
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}