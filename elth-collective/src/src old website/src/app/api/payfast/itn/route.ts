import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  buildPayfastSignature,
  buildUrlEncodedBody,
  payfastValidateUrl,
} from "@/lib/payfast";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>;

    const receivedSignature = textValue(formData, "signature");

    const signatureFields = { ...payload };
    delete signatureFields.signature;

    const generatedSignature = buildPayfastSignature(
      signatureFields,
      process.env.PAYFAST_PASSPHRASE || ""
    );

    if (!receivedSignature || receivedSignature !== generatedSignature) {
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const validateResponse = await fetch(payfastValidateUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: buildUrlEncodedBody(payload),
      cache: "no-store",
    });

    const validationText = await validateResponse.text();

    if (!validationText.toUpperCase().includes("VALID")) {
      return new NextResponse("Invalid ITN", { status: 400 });
    }

    const orderId = textValue(formData, "m_payment_id");
    const paymentStatus = textValue(formData, "payment_status").toLowerCase();
    const payfastPaymentId = textValue(formData, "pf_payment_id");
    const amountGross = Number(textValue(formData, "amount_gross") || "0");

    if (!orderId) {
      return new NextResponse("Missing order id", { status: 400 });
    }

    const { data: order, error: orderReadError } = await supabaseAdmin
      .from("orders")
      .select("id, grand_total, status")
      .eq("id", Number(orderId))
      .single();

    if (orderReadError || !order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (Number(order.grand_total).toFixed(2) !== amountGross.toFixed(2)) {
      return new NextResponse("Amount mismatch", { status: 400 });
    }

    const mappedStatus =
      paymentStatus === "complete"
        ? "paid"
        : paymentStatus === "cancelled"
        ? "cancelled"
        : "failed";

    if (order.status === "paid" && mappedStatus === "paid") {
      return new NextResponse("Already processed", { status: 200 });
    }

    const { error: updateOrderError } = await supabaseAdmin
      .from("orders")
      .update({
        status: mappedStatus,
        payment_reference: payfastPaymentId || null,
      })
      .eq("id", Number(orderId));

    if (updateOrderError) {
      return new NextResponse(updateOrderError.message, { status: 500 });
    }

    const { error: paymentInsertError } = await supabaseAdmin
      .from("payments")
      .upsert(
        {
          order_id: Number(orderId),
          provider: "payfast",
          provider_payment_id: payfastPaymentId || null,
          amount: amountGross,
          status: mappedStatus,
          raw_payload: payload,
        },
        {
          onConflict: "provider,provider_payment_id",
        }
      );

    if (paymentInsertError) {
      return new NextResponse(paymentInsertError.message, { status: 500 });
    }

    if (mappedStatus === "paid") {
      const { data: items, error: itemsError } = await supabaseAdmin
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", Number(orderId));

      if (itemsError) {
        return new NextResponse(itemsError.message, { status: 500 });
      }

      for (const item of items || []) {
        if (!item.product_id) continue;

        const { error: stockError } = await supabaseAdmin.rpc(
          "decrement_product_stock",
          {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          }
        );

        if (stockError) {
          return new NextResponse(stockError.message, { status: 500 });
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return new NextResponse(message, { status: 500 });
  }
}