const { supabaseAdmin } = require("../_lib/supabase");

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }

    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(req);

    console.log("🔥 BODY RECEIVED:", JSON.stringify(body, null, 2));

    const items = Array.isArray(body.items) ? body.items : [];

    if (!items.length) {
      return res.status(400).json({ error: "No items in order" });
    }

    let itemsTotal = 0;

    const cleanedItems = items.map((item, index) => {
      console.log(`🧩 ITEM ${index}:`, item);

      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.price);

      if (!Number.isFinite(unitPrice)) {
        return res.status(400).json({
          error: "PRICE IS MISSING FROM FRONTEND",
          item,
        });
      }

      itemsTotal += quantity * unitPrice;

      return {
        product_id: null,
        product_name: String(item.name || item.id || "Product"),
        qty: quantity,
        quantity: quantity,
        unit_price: Number(unitPrice.toFixed(2)),
        price: Number(unitPrice.toFixed(2)),
        gift_message: String(item.message || "").trim() || null,
      };
    });

    const customNote =
      cleanedItems
        .filter((i) => i.gift_message)
        .map((i) => `${i.product_name}: ${i.gift_message}`)
        .join(" | ") || null;

    const grandTotal = Number(itemsTotal.toFixed(2));

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        total: grandTotal,
        custom_note: customNote,
        payment_status: "pending",
        order_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      return res.status(500).json({ error: orderError.message });
    }

    const itemsPayload = cleanedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      qty: item.qty,
      quantity: item.quantity,
      unit_price: item.unit_price,
      price: item.price,
      gift_message: item.gift_message,
    }));

    console.log("🚀 FINAL ITEMS PAYLOAD:", itemsPayload);

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(itemsPayload);

    if (itemsError) {
      return res.status(500).json({
        error: itemsError.message,
        payload: itemsPayload,
      });
    }

    return res.status(200).json({
      success: true,
      message: "ORDER + ITEMS SAVED ✅",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};