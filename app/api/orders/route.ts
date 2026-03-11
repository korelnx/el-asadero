import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      items,          // [{ menu_item_id, item_name, item_description, base_price, quantity, unit_price, subtotal }]
      subtotal,
      delivery_fee,
      tax,
      tip = 0,
      total,
      payment_method,
      special_instructions,
    } = body;

    // Use anon client just to get the current user (optional)
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    // Use service role to bypass RLS for inserts
    const supabase = createServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error: orderError } = await (supabase as any)
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        type,
        status: "new",
        customer_name,
        customer_email,
        customer_phone,
        delivery_address: delivery_address ?? null,
        subtotal,
        delivery_fee: delivery_fee ?? 0,
        tax: tax ?? 0,
        tip,
        total,
        payment_method,
        special_instructions: special_instructions ?? null,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: orderError?.message ?? "Failed to create order" }, { status: 500 });
    }

    // Insert order items
    if (items?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: itemsError } = await (supabase as any).from("order_items").insert(
        items.map((item: {
          menu_item_id?: string;
          item_name: string;
          item_description?: string;
          base_price: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
          special_instructions?: string;
        }) => ({
          order_id: order.id,
          menu_item_id: item.menu_item_id ?? null,
          item_name: item.item_name,
          item_description: item.item_description ?? null,
          base_price: item.base_price,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          special_instructions: item.special_instructions ?? null,
        }))
      );

      if (itemsError) {
        console.error("Order items insert error:", itemsError);
        // Order was created — don't fail the whole request
      }
    }

    return NextResponse.json({ order_number: order.order_number, id: order.id });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
