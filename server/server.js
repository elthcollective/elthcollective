import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabaseAdmin } from "./_lib/supabase.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is healthy" });
});

app.post("/api/checkout/start", async (req, res) => {
  try {
    console.log("Checkout route hit");
    console.log("Body received:", req.body);

    const body = req.body || {};

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

    const orderItems = items.map((item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);

      if (!quantity || quantity < 1) {
        throw new Error("Invalid quantity in order");
      }

      if (price < 0) {
        throw new Error("Invalid price in order");
      }

      itemsTotal += price * quantity;

      return {
        product_id: String(item.id || "") || null,
        product_name: String(item.name || item.id || "Product"),
        quantity,
        price: Number(price.toFixed(2)),
        gift_message: String(item.message || "").trim() || null,
      };
    });

    const deliveryFee = fulfilmentMethod === "delivery" ? 80 : 0;
    const collectionFee = 0;
    const grandTotal = Number((itemsTotal + deliveryFee + collectionFee).toFixed(2));

    console.log("About to insert order");

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        fulfilment_method: fulfilmentMethod,
        delivery_address_line1:
          fulfilmentMethod === "delivery" ? String(deliveryAddress.line1 || "").trim() : null,
        delivery_address_line2:
          fulfilmentMethod === "delivery" ? String(deliveryAddress.line2 || "").trim() : null,
        delivery_suburb:
          fulfilmentMethod === "delivery" ? String(deliveryAddress.suburb || "").trim() : null,
        delivery_city:
          fulfilmentMethod === "delivery" ? String(deliveryAddress.city || "").trim() : null,
        delivery_postal_code:
          fulfilmentMethod === "delivery" ? String(deliveryAddress.postalCode || "").trim() : null,
        collection_point:
          fulfilmentMethod === "collection" ? String(collectionPoint || "").trim() : null,
        items_total: Number(itemsTotal.toFixed(2)),
        delivery_fee: Number(deliveryFee.toFixed(2)),
        collection_fee: Number(collectionFee.toFixed(2)),
        grand_total: grandTotal,
        total: grandTotal,
        currency: "ZAR",
        status: "pending",
        payment_provider: "pending_payfast_setup",
      })
      .select()
      .single();

    console.log("Order result:", order);
    console.log("Order error:", orderError);

    if (orderError || !order) {
      return res.status(500).json({
        error: orderError?.message || "Failed to create order",
      });
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
          gift_message: item.gift_message,
        }))
      );

    console.log("Items error:", itemsError);

    if (itemsError) {
      return res.status(500).json({ error: itemsError.message });
    }

    return res.status(200).json({
      success: true,
      orderId: order.id,
      message: "Order saved as pending",
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});