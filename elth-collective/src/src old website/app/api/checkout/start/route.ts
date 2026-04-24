import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  buildPayfastFormPayload,
  payfastProcessUrl,
  toPayfastAmount,
} from "@/lib/payfast";

type CheckoutItem = {
  id: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const customerName = String(body.customerName || "").trim();
    const customerEmail = String(body.customerEmail || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const fulfilmentMethod = String(body.fulfilmentMethod || "").trim() as
      | "delivery"
      | "collection"
      | "";
    const deliveryAddress = body.deliveryAddress || null;
    const collectionPoint = body.collectionPoint ? String(body.collectionPoint) : null;
    const deliveryFee = Number(body.deliveryFee || 0);
    const collectionFee = Number(body.collectionFee || 0);
    const items: CheckoutItem[] = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Missing customer details" },
        { status: 400 }
      );
    }

    if (!items.length) {
      return NextResponse.json(
        { error: "Your bag is empty" },
        { status: 400 }
      );
    }

    if (fulfilmentMethod !== "delivery" && fulfilmentMethod !== "collection") {
      return NextResponse.json(
        { error: "Choose delivery or collection" },
        { status: 400 }
      );
    }

    if (fulfilmentMethod === "delivery") {
      if (
        !deliveryAddress?.line1 ||
        !deliveryAddress?.suburb ||
        !deliveryAddress?.city ||
        !deliveryAddress?.postalCode
      ) {
        return NextResponse.json(
          { error: "Missing delivery address details" },
          { status: 400 }
        );
      }
    }

    if (fulfilmentMethod === "collection" && !collectionPoint) {
      return NextResponse.json(
        { error: "Choose a collection point" },
        { status: 400 }
      );
    }

    const productIds = items.map((item) => item.id);

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, stock")
      .in("id", productIds);

    if (productsError) {
      return NextResponse.json(
        { error: productsError.message },
        { status: 500 }
      );
    }

    if (!products || products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products were not found" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((product) => [String(product.id), product]));

    let itemsTotal = 0;

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

      itemsTotal += price * quantity;

      return {
        product_id: product.id,
        product_name: product.name,
        quantity,
        price,
      };
    });

    const grandTotal = Number(
      (
        itemsTotal +
        (fulfilmentMethod === "delivery" ? deliveryFee : 0) +
        (fulfilmentMethod === "collection" ? collectionFee : 0)
      ).toFixed(2)
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        fulfilment_method: fulfilmentMethod,
        delivery_address_line1:
          fulfilmentMethod === "delivery" ? String(deliveryAddress.line1 || "") : null,
        delivery_address_line2:
          fulfilmentMethod === "delivery" ? String(deliveryAddress.line2 || "") : null,
        delivery_suburb:
          fulfilmentMethod === "delivery" ? String(deliveryAddress.suburb || "") : null,
        delivery_city:
          fulfilmentMethod === "delivery" ? String(deliveryAddress.city || "") : null,
        delivery_postal_code:
          fulfilmentMethod === "delivery" ? String(deliveryAddress.postalCode || "") : null,
        collection_point:
          fulfilmentMethod === "collection" ? collectionPoint : null,
        items_total: Number(itemsTotal.toFixed(2)),
        delivery_fee: fulfilmentMethod === "delivery" ? Number(deliveryFee.toFixed(2)) : 0,
        collection_fee:
          fulfilmentMethod === "collection" ? Number(collectionFee.toFixed(2)) : 0,
        grand_total: grandTotal,
        currency: "ZAR",
        status: "pending",
        payment_provider: "payfast",
      })
      .select()
      .single();

    if (orderError || !order) {
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
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      );
    }

    const siteUrl =  import.meta.env.NEXT_PUBLIC_SITE_URL!;
    const merchantId =  import.meta.env.PAYFAST_MERCHANT_ID!;
    const merchantKey =  import.meta.env.PAYFAST_MERCHANT_KEY!;
    const passphrase =  import.meta.env.PAYFAST_PASSPHRASE || "";

    const payfastFields = buildPayfastFormPayload(
      {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `${siteUrl}/checkout/success?order_id=${order.id}`,
        cancel_url: `${siteUrl}/checkout/cancel?order_id=${order.id}`,
        notify_url: `${siteUrl}/api/payfast/itn`,
        name_first: customerName,
        email_address: customerEmail,
        m_payment_id: String(order.id),
        amount: toPayfastAmount(grandTotal),
        item_name: `Elth Collective Order ${order.id}`,
      },
      passphrase
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentUrl: payfastProcessUrl(),
      fields: payfastFields,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}