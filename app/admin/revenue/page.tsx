"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// ─── Mock data ────────────────────────────────────────────────────────────────

const dailyRevenue = [
  { date: "Mar 1",  revenue: 1240, orders: 38 },
  { date: "Mar 2",  revenue: 980,  orders: 29 },
  { date: "Mar 3",  revenue: 1580, orders: 51 },
  { date: "Mar 4",  revenue: 1820, orders: 64 },
  { date: "Mar 5",  revenue: 2100, orders: 72 },
  { date: "Mar 6",  revenue: 1960, orders: 68 },
  { date: "Mar 7",  revenue: 2340, orders: 81 },
  { date: "Mar 8",  revenue: 1650, orders: 55 },
  { date: "Mar 9",  revenue: 1420, orders: 44 },
  { date: "Mar 10", revenue: 1890, orders: 61 },
  { date: "Mar 11", revenue: 2250, orders: 77 },
];

const topItems = [
  { name: "Carne Asada Burrito", sold: 148 },
  { name: "Al Pastor Tacos",     sold: 134 },
  { name: "Birria Quesadilla",   sold: 121 },
  { name: "Chicken Fajitas",     sold: 109 },
  { name: "Nachos Supreme",      sold: 97  },
  { name: "Street Tacos (3)",    sold: 89  },
];

const revenueConfig = {
  revenue: { label: "Revenue", color: "#2AACAA" },
} satisfies ChartConfig;

const ordersConfig = {
  orders: { label: "Orders", color: "#C9522A" },
} satisfies ChartConfig;

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-border bg-card p-5 space-y-1">
      <p className="text-xs text-foreground-muted uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-foreground-muted">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RevenuePage() {
  const totalRevenue = dailyRevenue.reduce((s, d) => s + d.revenue, 0);
  const totalOrders  = dailyRevenue.reduce((s, d) => s + d.orders, 0);
  const avgOrder     = totalRevenue / totalOrders;
  const todayRevenue = dailyRevenue[dailyRevenue.length - 1].revenue;
  const todayOrders  = dailyRevenue[dailyRevenue.length - 1].orders;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 h-16 border-b border-border flex items-center justify-between px-8">
        <h1 className="text-lg font-serif">Revenue</h1>
        <span className="text-xs text-foreground-muted border border-border px-3 py-1.5">
          March 2026
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Today's Revenue"
            value={`$${todayRevenue.toLocaleString()}`}
            sub={`${todayOrders} orders`}
            accent
          />
          <StatCard
            label="Month Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            sub="last 11 days"
          />
          <StatCard
            label="Total Orders"
            value={totalOrders.toString()}
            sub="last 11 days"
          />
          <StatCard
            label="Avg Order Value"
            value={`$${avgOrder.toFixed(2)}`}
          />
        </div>

        {/* Revenue area chart */}
        <div className="border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="text-sm font-medium">Daily Revenue</h2>
            <p className="text-xs text-foreground-muted mt-0.5">Last 11 days</p>
          </div>
          <ChartContainer config={revenueConfig} className="h-[220px] w-full">
            <AreaChart data={dailyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2AACAA" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2AACAA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#1E1E1E" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9A9A9A", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9A9A9A", fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
                width={52}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2AACAA"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#2AACAA", strokeWidth: 0 }}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Orders bar + Top items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Orders bar chart */}
          <div className="border border-border bg-card p-6 space-y-4">
            <div>
              <h2 className="text-sm font-medium">Daily Orders</h2>
              <p className="text-xs text-foreground-muted mt-0.5">Last 11 days</p>
            </div>
            <ChartContainer config={ordersConfig} className="h-[200px] w-full">
              <BarChart data={dailyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={16}>
                <CartesianGrid vertical={false} stroke="#1E1E1E" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9A9A9A", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9A9A9A", fontSize: 11 }}
                  width={32}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [String(value), "Orders"]}
                    />
                  }
                />
                <Bar dataKey="orders" fill="#C9522A" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Top items */}
          <div className="border border-border bg-card p-6 space-y-4">
            <div>
              <h2 className="text-sm font-medium">Top Items</h2>
              <p className="text-xs text-foreground-muted mt-0.5">By units sold this month</p>
            </div>
            <div className="space-y-3">
              {topItems.map((item, i) => {
                const pct = Math.round((item.sold / topItems[0].sold) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-foreground-muted w-4 flex-shrink-0">{i + 1}</span>
                        <span className="text-sm truncate">{item.name}</span>
                      </div>
                      <span className="text-xs text-foreground-muted ml-3 flex-shrink-0">{item.sold}</span>
                    </div>
                    <div className="h-1 bg-border rounded-full overflow-hidden ml-6">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
