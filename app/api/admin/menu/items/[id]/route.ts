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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const update: Record<string, unknown> = {};
  if (body.category_id   !== undefined) update.category_id   = body.category_id;
  if (body.name          !== undefined) update.name          = body.name.trim();
  if (body.description   !== undefined) update.description   = body.description?.trim() || null;
  if (body.price         !== undefined) update.price         = Number(body.price);
  if (body.image_url     !== undefined) update.image_url     = body.image_url || null;
  if (body.image_path    !== undefined) update.image_path    = body.image_path || null;
  if (body.is_available  !== undefined) update.is_available  = body.is_available;
  if (body.is_featured   !== undefined) update.is_featured   = body.is_featured;
  if (body.display_order !== undefined) update.display_order = body.display_order;
  if (body.tags          !== undefined) update.tags          = body.tags;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("menu_items")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Get image_path before deleting so we can clean up storage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any)
    .from("menu_items")
    .select("image_path")
    .eq("id", id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("menu_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (item?.image_path) {
    await supabase.storage.from("menu-images").remove([item.image_path]);
  }

  return NextResponse.json({ ok: true });
}
