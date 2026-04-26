import type { ReactNode } from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import omniskillMark from "../assets/omniskill-mark.svg?url";
import { UnmappedModeProvider } from "../components/unmapped/mode-context";
import { AppShell } from "../components/unmapped/app-shell";
import { ThemeProvider } from "../components/unmapped/theme-context";
import { ConsoleAuthProvider } from "../components/unmapped/console/auth-context";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OmniSkill — Your skills. Mapped." },
      { name: "description", content: "OmniSkill is open infrastructure for mapping youth skills to real opportunities in low-income countries." },
      { name: "author", content: "OmniSkill" },
      { property: "og:title", content: "OmniSkill — Your skills. Mapped." },
      { property: "og:description", content: "OmniSkill is open infrastructure for mapping youth skills to real opportunities in low-income countries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "OmniSkill — Your skills. Mapped." },
      { name: "twitter:description", content: "OmniSkill is open infrastructure for mapping youth skills to real opportunities in low-income countries." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: omniskillMark,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <ConsoleAuthProvider>
        <UnmappedModeProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </UnmappedModeProvider>
      </ConsoleAuthProvider>
    </ThemeProvider>
  );
}
