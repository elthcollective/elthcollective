"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-2xl border p-8">
        <h1 className="mb-4 text-3xl font-semibold">Thank You</h1>
        <p className="mb-4 text-neutral-700">
          Your payment flow has been completed.
        </p>

        {orderId ? (
          <p className="mb-6 text-sm text-neutral-600">
            Order number: {orderId}
          </p>
        ) : null}

        <p className="mb-8 text-sm text-neutral-600">
          We are confirming your payment and order details.
        </p>

        <div className="flex gap-3">
          <Link href="/" className="rounded-xl border px-4 py-3">
            Continue Shopping
          </Link>

          <Link href="/bag" className="rounded-xl border px-4 py-3">
            Go to Bag
          </Link>
        </div>
      </div>
    </main>
  );
}