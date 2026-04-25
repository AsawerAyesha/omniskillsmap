import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/policy")({
  component: PolicyLayout,
});

function PolicyLayout() {
  return <Outlet />;
}