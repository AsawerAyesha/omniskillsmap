import * as React from "react";

export function OfflineBanner() {
  const [online, setOnline] = React.useState(true);
  const [lastSaved] = React.useState(() =>
    new Date().toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  );

  React.useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;

  return (
    <div role="status" aria-live="polite" className="u-offline">
      You&rsquo;re offline — showing last saved data from {lastSaved}
    </div>
  );
}