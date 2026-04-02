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

    const customerName = String(body.customerName || "").trim();
    const customerEmail = String(body.customerEmail || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const fulfilmentMethod = String(body.fulfilmentMethod || "").trim();
    const deliveryAddress = body.deliveryAddress || null;
    const collectionPoint = body.collectionPoint || null;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: "Missing customer details" });
    }

    if (!items.length) {
      return res.status(400).json({ error: "No items in order" });
    }

    if (!["delivery", "collection"].includes(fulfilmentMethod)) {
      return res.status(400).json({ error: "Invalid fulfilment method" });
    }

    if (fulfilmentMethod === "delivery") {
      if (
        !deliveryAddress ||
        !String(deliveryAddress.line1 || "").trim() ||
        !String(deliveryAddress.suburb || "").trim() ||
        !String(deliveryAddress.city || "").trim() ||
        !String(deliveryAddress.postalCode || "").trim()
      ) {
        return res.status(400).json({ error: "Missing delivery details" });
      }
    }

    if (fulfilmentMethod === "collection") {
      if (
        !String(collectionPoint || "").trim() ||
        String(collectionPoint || "").trim() === "Select collection point"
      ) {
        return res.status(400).json({ error: "Missing collection point" });
      }
    }

    let itemsTotal = 0;

    for (const item of items) {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.price || 0);

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity in order" });
      }

      if (Number.isNaN(unitPrice) || unitPrice < 0) {
        return res.status(400).json({ error: "Invalid price in order" });
      }

      itemsTotal += quantity * unitPrice;
    }

    const customNote =
      items
        .map((item) => String(item.message || "").trim())
        .filter(Boolean)
        .join(" | ") || null;

    const deliveryFee = fulfilmentMethod === "delivery" ? 80 : 0;
    const collectionFee = 0;
    const grandTotal = Number((itemsTotal + deliveryFee + collectionFee).toFixed(2));

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        fulfilment_method: fulfilmentMethod,
        delivery_address_line1:
          fulfilmentMethod === "delivery"
            ? String(deliveryAddress.line1 || "").trim()
            : null,
        delivery_address_line2:
          fulfilmentMethod === "delivery"
            ? String(deliveryAddress.line2 || "").trim()
            : null,
        delivery_suburb:
          fulfilmentMethod === "delivery"
            ? String(deliveryAddress.suburb || "").trim()
            : null,
        delivery_city:
          fulfilmentMethod === "delivery"
            ? String(deliveryAddress.city || "").trim()
            : null,
        delivery_postal_code:
          fulfilmentMethod === "delivery"
            ? String(deliveryAddress.postalCode || "").trim()
            : null,
        collection_point:
          fulfilmentMethod === "collection"
            ? String(collectionPoint || "").trim()
            : null,
        total: grandTotal,
        items_total: Number(itemsTotal.toFixed(2)),
        delivery_fee: Number(deliveryFee.toFixed(2)),
        collection_fee: Number(collectionFee.toFixed(2)),
        grand_total: grandTotal,
        currency: "ZAR",
        payment_status: "pending",
        order_status: "pending",
        payment_provider: "pending_payfast_setup",
        custom_note: customNote,
      })
      .select()
      .single();

    if (orderError || !order) {
      return res.status(500).json({
        error: orderError?.message || "Failed to create order",
      });
    }

    const itemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: null,
      quantity: Number(item.quantity || 1),
      unit_price: Number(Number(item.price || 0).toFixed(2)),
    }));

    console.log("itemsPayload:", itemsPayload);

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(itemsPayload);

    if (itemsError) {
      return res.status(500).json({ error: itemsError.message });
    }

    return res.status(200).json({
      success: true,
      orderId: order.id,
      message: "Order and order items saved as pending",
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Server error",
    });
  }
};