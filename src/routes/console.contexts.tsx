import { createFileRoute, Outlet } from "@tanstack/react-router";

/* /console/contexts/* layout — currently a passthrough so the wizard route
 * (`/console/contexts/new`) and the future contexts list can each mount
 * their own ConsoleGuard + page chrome. */
export const Route = createFileRoute("/console/contexts")({
  component: () => <Outlet />,
});