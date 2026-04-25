import { Toaster as Sonner } from "sonner";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export function BrandToaster() {
  return (
    <Sonner
      position="top-center"
      offset={64}
      visibleToasts={3}
      duration={3000}
      icons={{
        success: <CheckCircle2 size={16} strokeWidth={1.5} color="var(--signal-green)" />,
        error: <AlertCircle size={16} strokeWidth={1.5} color="var(--signal-red)" />,
        info: <Info size={16} strokeWidth={1.5} color="var(--earth-dark)" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!bg-[var(--surface-raised)] !text-[var(--ink)] !border !border-border-subtle !shadow-md !rounded-xl",
          title: "!font-medium !text-[13px]",
          description: "!text-[var(--ink-tertiary)] !text-[12px]",
        },
      }}
    />
  );
}