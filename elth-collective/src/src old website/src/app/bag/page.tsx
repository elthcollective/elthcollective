"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type BagItem = {
  id: string;
  name?: string;
  price?: number;
  quantity: number;
};

export default function BagPage() {
  const [bag, setBag] = useState<BagItem[]>([]);

  useEffect(() => {
    try {
      const storedBag = JSON.parse(localStorage.getItem("bag") || "[]");
      setBag(Array.isArray(storedBag) ? storedBag : []);
    } catch {
      setBag([]);
    }
  }, []);

  function updateQuantity(id: string, quantity: number) {
    const updated = bag.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );

    setBag(updated);
    localStorage.setItem("bag", JSON.stringify(updated));
  }

  function removeItem(id: string) {
    const updated = bag.filter((item) => item.id !== id);
    setBag(updated);
    localStorage.setItem("bag", JSON.stringify(updated));
  }

  const total = useMemo(() => {
    return bag.reduce((sum, item) => {
      const price = item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [bag]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-semibold">Your Bag</h1>

      {bag.length === 0 ? (
        <div className="space-y-4">
          <p className="text-neutral-600">Your bag is empty.</p>

          <Link
            href="/"
            className="inline-flex rounded-xl border px-4 py-3"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Items */}
          {bag.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <p className="font-medium">{item.name || "Product"}</p>
                <p className="text-sm text-neutral-600">
                  Price: R{item.price || 0}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, Number(e.target.value))
                  }
                  className="w-16 rounded border px-2 py-1"
                />

                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="font-medium">
                R{((item.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="flex justify-end">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-xl border px-6 py-3 font-medium"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}