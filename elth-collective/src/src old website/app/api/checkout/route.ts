import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type BagItem = {
  id: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Checkout body received:", body);

    const customerName = String(body.customerName || "").trim();
    const customerEmail = String(body.customerEmail || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const items: BagItem[] = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !customerEmail || items.length === 0) {
      return NextResponse.json(
        { error: "Missing customer details or bag items" },
        { status: 400 }
      );
    }

    const productIds = items.map((item) => String(item.id));

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, stock")
      .in("id", productIds);

    if (productsError) {
      console.error("Products read error:", productsError);
      return NextResponse.json(
        { error: productsError.message },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "No matching products found" },
        { status: 400 }
      );
    }

    const productMap = new Map(
      products.map((product) => [String(product.id), product])
    );

    let total = 0;

    const orderItems = items.map((item) => {
      const product = productMap.get(String(item.id));

      if (!product) {
        throw new Error(`Product not found: ${item.id}`);
      }

      const quantity = Number(item.quantity);
      const price = Number(product.price);
      const stock = Number(product.stock ?? 0);

      if (!quantity || quantity < 1) {
        throw new Error(`Invalid quantity for ${product.name}`);
      }

      if (stock < quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      total += price * quantity;

      return {
        product_id: product.id,
        product_name: product.name,
        quantity,
        price,
      };
    });

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        total_amount: Number(total.toFixed(2)),
        currency: "ZAR",
        status: "pending",
        payment_provider: "manual",
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { error: orderError?.message || "Could not create order" },
        { status: 500 }
      );
    }

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        }))
      );

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      );
    }

    console.log("Order saved successfully:", order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order saved successfully",
    });
  } catch (error) {
    console.error("Checkout route error:", error);

    const message =
      error instanceof Error ? error.message : "Server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}