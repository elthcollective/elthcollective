import { supabase } from "../lib/supabaseClient";

export async function createOrder(userId, cartItems) {
  if (!userId || !cartItems || cartItems.length === 0) {
    console.log("Invalid order data");
    return null;
  }

  // 1. calculate total
  const total = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  // 2. create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        user_id: userId,
        total,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (orderError) {
    console.log("Order error:", orderError.message);
    return null;
  }

  // 3. create order items
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.log("Order items error:", itemsError.message);
    return null;
  }

  // 4. reduce stock (FULL REPLACEMENT LOGIC)
  for (const item of cartItems) {
    const { error: stockError } = await supabase.rpc("reduce_stock", {
      product_id_input: item.id,
      quantity_input: item.quantity,
    });

    if (stockError) {
      console.log(
        `Stock update failed for product ${item.id}:`,
        stockError.message
      );
    }
  }

  return order;
}