"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

// ─── Config type ──────────────────────────────────────────────────────────────

export type ChartConfig = Record<string, { label?: string; color?: string }>;

// ─── Context ─────────────────────────────────────────────────────────────────

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

// ─── Container ────────────────────────────────────────────────────────────────

export function ChartContainer({
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}) {
  // Inject CSS vars for colors
  const style = React.useMemo(() => {
    return Object.entries(config).reduce((acc, [key, val]) => {
      if (val.color) (acc as Record<string, string>)[`--color-${key}`] = val.color;
      return acc;
    }, {} as React.CSSProperties);
  }, [config]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn("flex justify-center text-xs", className)}
        style={style}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

export const ChartTooltip = Tooltip;

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
  formatter?: (value: number, name: string) => [string, string];
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-xs space-y-1">
      {label && <p className="font-medium text-foreground mb-1.5">{label}</p>}
      {payload.map((item) => {
        const [displayValue, displayName] = formatter
          ? formatter(item.value, item.name)
          : [item.value.toLocaleString(), item.name];
        return (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-foreground-muted">{displayName}</span>
            <span className="font-mono font-medium text-foreground ml-auto pl-4 tabular-nums">
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}
