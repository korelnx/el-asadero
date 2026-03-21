import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurant_settings")
    .select("key, value")
    .in("key", ["min_order_delivery", "min_order_pickup", "delivery_fee", "tax_rate"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (data ?? []) as any[]) {
    const raw = String(row.value).replace(/^"|"$/g, "");
    settings[row.key] = parseFloat(raw);
  }

  return NextResponse.json(settings);
}
