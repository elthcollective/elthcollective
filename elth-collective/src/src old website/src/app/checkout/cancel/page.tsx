"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-2xl border p-8">
        <h1 className="mb-4 text-3xl font-semibold">Payment Cancelled</h1>
        <p className="mb-4 text-neutral-700">
          Your payment was not completed.
        </p>

        {orderId ? (
          <p className="mb-6 text-sm text-neutral-600">
            Order number: {orderId}
          </p>
        ) : null}

        <div className="flex gap-3">
          <Link href="/checkout" className="rounded-xl border px-4 py-3">
            Return to Checkout
          </Link>

          <Link href="/bag" className="rounded-xl border px-4 py-3">
            Return to Bag
          </Link>
        </div>
      </div>
    </main>
  );
}