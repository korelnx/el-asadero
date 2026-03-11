import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;
  const { data: profile } = await authClient
    .from("profiles").select("role").eq("id", user.id).single<{ role: string }>();
  return profile?.role === "admin" ? createServiceClient() : null;
}

export async function GET() {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: categories, error: catError }, { data: items, error: itemError }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, description, display_order, is_active, created_at")
      .order("display_order"),
    supabase
      .from("menu_items")
      .select("id, category_id, name, description, price, image_url, image_path, is_available, is_featured, display_order, tags, created_at")
      .order("display_order"),
  ]);

  if (catError || itemError) {
    return NextResponse.json({ error: catError?.message ?? itemError?.message }, { status: 500 });
  }

  return NextResponse.json({ categories, items });
}
