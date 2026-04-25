import * as React from "react";
import { useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [direction, setDirection] = React.useState<"fwd" | "back">("fwd");
  const prevIdxRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const state =
      (typeof window !== "undefined" && (window.history.state as { idx?: number })) || {};
    const idx: number = typeof state.idx === "number" ? state.idx : 0;
    if (prevIdxRef.current !== null) {
      setDirection(idx < prevIdxRef.current ? "back" : "fwd");
    }
    prevIdxRef.current = idx;
  }, [location.pathname]);

  return (
    <div
      key={location.pathname}
      className={cn(direction === "back" ? "u-route-back" : "u-route-fwd")}
    >
      {children}
    </div>
  );
}