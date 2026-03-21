import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const order_number = searchParams.get("order_number")?.toUpperCase().trim();
  const phone = searchParams.get("phone")?.trim();

  if (!order_number || !phone) {
    return NextResponse.json({ error: "order_number and phone required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      order_number,
      status,
      type,
      customer_name,
      estimated_ready_at,
      created_at,
      subtotal,
      delivery_fee,
      tax,
      total,
      customer_phone,
      order_items (
        item_name,
        quantity,
        unit_price,
        subtotal,
        special_instructions,
        order_item_modifiers (
          group_name,
          option_name,
          price_delta
        )
      )
    `)
    .eq("order_number", order_number)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Verify phone (normalize: strip non-digits)
  const normalize = (p: string) => p.replace(/\D/g, "");
  if (normalize(order.customer_phone) !== normalize(phone)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Don't expose phone in response
  const { customer_phone: _, ...safeOrder } = order;
  return NextResponse.json(safeOrder);
}
