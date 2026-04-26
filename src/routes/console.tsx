import { createFileRoute, Outlet } from "@tanstack/react-router";

/* Pathless layout for /console/*. The shell + auth gate are mounted inside
 * `console.index.tsx` and the auth-protected sub-routes via the
 * ConsoleGuard component, so this file just renders the Outlet — keeping
 * /console/auth/* publicly reachable while everything else is gated. */
export const Route = createFileRoute("/console")({
  component: () => <Outlet />,
});