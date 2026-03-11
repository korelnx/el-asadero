"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          color: "var(--color-foreground)",
          borderRadius: "0",
          fontSize: "13px",
          fontFamily: "var(--font-sans)",
        },
        classNames: {
          success: "!border-primary/40",
          error: "!border-red-500/40",
          warning: "!border-yellow-500/40",
        },
      }}
      gap={8}
    />
  );
}
