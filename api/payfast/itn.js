const { supabaseAdmin } = require("../_lib/supabase");
const {
  buildSignature,
  parseFormEncoded,
  toUrlEncoded,
} = require("../_lib/payfast");

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const rawBody = await readRawBody(req);
    const payload = parseFormEncoded(rawBody);

    const receivedSignature = String(payload.signature || "");
    const generatedSignature = buildSignature(
      payload,
       import.meta.env.PAYFAST_PASSPHRASE || ""
    );

    if (!receivedSignature || receivedSignature !== generatedSignature) {
      return res.status(400).send("Invalid signature");
    }

    const validateUrl =
      process.env.PAYFAST_SANDBOX === "true"
        ? "https://sandbox.payfast.co.za/eng/query/validate"
        : "https://www.payfast.co.za/eng/query/validate";

    const validateResponse = await fetch(validateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: toUrlEncoded(payload),
    });

    const validateText = await validateResponse.text();

    if (!validateText.toUpperCase().includes("VALID")) {
      return res.status(400).send("Invalid ITN");
    }

    const orderId = Number(payload.m_payment_id || 0);
    const paymentStatus = String(payload.payment_status || "").toLowerCase();
    const payfastPaymentId = String(payload.pf_payment_id || "");
    const amountGross = Number(payload.amount_gross || 0);

    if (!orderId) {
      return res.status(400).send("Missing order id");
    }

    const { data: order, error: orderReadError } = await supabaseAdmin
      .from("orders")
      .select("id, grand_total, status")
      .eq("id", orderId)
      .single();

    if (orderReadError || !order) {
      return res.status(404).send("Order not found");
    }

    if (Number(order.grand_total).toFixed(2) !== amountGross.toFixed(2)) {
      return res.status(400).send("Amount mismatch");
    }

    const mappedStatus =
      paymentStatus === "complete"
        ? "paid"
        : paymentStatus === "cancelled"
        ? "cancelled"
        : "failed";

    const { error: orderUpdateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: mappedStatus,
        payment_reference: payfastPaymentId || null,
      })
      .eq("id", orderId);

    if (orderUpdateError) {
      return res.status(500).send(orderUpdateError.message);
    }

    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .upsert(
        {
          order_id: orderId,
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

    if (paymentError) {
      return res.status(500).send(paymentError.message);
    }

    return res.status(200).send("OK");
  } catch (error) {
    return res
      .status(500)
      .send(error instanceof Error ? error.message : "Server error");
  }
};