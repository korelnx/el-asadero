import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const [{ data: categories, error: catError }, { data: items, error: itemError }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, description, display_order")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("menu_items")
      .select("id, category_id, name, description, price, image_url, is_featured, tags, display_order")
      .eq("is_available", true)
      .order("display_order"),
  ]);

  if (catError || itemError) {
    return NextResponse.json({ error: catError?.message ?? itemError?.message }, { status: 500 });
  }

  return NextResponse.json(
    { categories: categories ?? [], items: items ?? [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}
