import * as React from "react";
import { cn } from "@/lib/utils";

/* ============================================================
   UNMAPPED Primitives — thin React wrappers over CSS utility
   classes defined in src/styles.css. Keep markup minimal so
   tokens stay the single source of truth.
   ============================================================ */

type DivProps = React.HTMLAttributes<HTMLDivElement>;

/* Card */
export const UCard = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("u-card", className)} {...props} />
  ),
);
UCard.displayName = "UCard";

/* Badge */
export type UBadgeVariant = "neutral" | "green" | "amber" | "red" | "blue";
export interface UBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: UBadgeVariant;
}
export function UBadge({ variant = "neutral", className, ...props }: UBadgeProps) {
  const variantClass =
    variant === "neutral" ? "" : `u-badge--${variant}`;
  return <span className={cn("u-badge", variantClass, className)} {...props} />;
}

/* Data chip */
export interface UChipProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode;
  label: React.ReactNode;
}
export function UChip({ value, label, className, ...props }: UChipProps) {
  return (
    <div className={cn("u-chip", className)} {...props}>
      <span className="u-chip__value">{value}</span>
      <span className="u-chip__label">{label}</span>
    </div>
  );
}

/* Progress */
export interface UProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0–100
}
export function UProgress({ value, className, ...props }: UProgressProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className={cn("u-progress", className)}
      {...props}
    >
      <div className="u-progress__fill" style={{ width: `${v}%` }} />
    </div>
  );
}

/* Occupation tag */
export interface UOccupationProps extends React.HTMLAttributes<HTMLSpanElement> {
  code: string;
  name: string;
}
export function UOccupation({ code, name, className, ...props }: UOccupationProps) {
  return (
    <span className={cn("u-occupation", className)} {...props}>
      <span className="u-occupation__code">{code}</span>
      <span className="u-occupation__name">{name}</span>
    </span>
  );
}

/* Stat (large display number) */
export interface UStatProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}
export function UStat({ size = "lg", className, style, ...props }: UStatProps) {
  const sizes: Record<NonNullable<UStatProps["size"]>, string> = {
    sm: "1.5rem",
    md: "2.25rem",
    lg: "3.5rem",
    xl: "5rem",
  };
  return (
    <div
      className={cn("u-stat", className)}
      style={{ fontSize: sizes[size], ...style }}
      {...props}
    />
  );
}