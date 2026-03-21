import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_item_modifier_groups")
    .select(`
      display_order,
      modifier_groups (
        id,
        name,
        description,
        selection_type,
        is_required,
        min_selections,
        max_selections,
        display_order,
        modifier_options (
          id,
          name,
          price_delta,
          is_default,
          is_available,
          display_order
        )
      )
    `)
    .eq("menu_item_id", itemId)
    .order("display_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modifier_groups = (data ?? []).map((row: any) => ({
    ...row.modifier_groups,
    options: (row.modifier_groups?.modifier_options ?? [])
      .filter((o: { is_available: boolean }) => o.is_available)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.display_order - b.display_order),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })).sort((a: any, b: any) => (a?.display_order ?? 0) - (b?.display_order ?? 0));

  return NextResponse.json({ modifier_groups });
}
