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

export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { category_id, name, description, price, image_url, image_path, is_available, is_featured, display_order, tags } = body;

  if (!name?.trim())    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!category_id)     return NextResponse.json({ error: "Category is required" }, { status: 400 });
  if (price == null || isNaN(Number(price))) return NextResponse.json({ error: "Valid price is required" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("menu_items")
    .insert({
      category_id,
      name: name.trim(),
      description: description?.trim() || null,
      price: Number(price),
      image_url: image_url || null,
      image_path: image_path || null,
      is_available: is_available ?? true,
      is_featured: is_featured ?? false,
      display_order: display_order ?? 0,
      tags: tags ?? [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
