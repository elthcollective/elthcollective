import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
import.meta.env.VITE_SUPABASE_URL
import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      fulfilmentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items" });
    }

    // 🔹 calculate total
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 🔹 STEP 1: create order FIRST
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          fulfilment_method: fulfilmentMethod,
          total,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.log(orderError);
      return res.status(500).json({ error: orderError.message });
    }

    // 🔹 STEP 2: attach items to order
    const itemsPayload = items.map((item) => ({
      order_id: order.id, // ✅ LINK HERE
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.log(itemsError);
      return res.status(500).json({ error: itemsError.message });
    }

    return res.status(200).json({
      success: true,
      orderId: order.id,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
}