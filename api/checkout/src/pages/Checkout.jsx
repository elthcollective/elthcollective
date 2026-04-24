import { useState } from "react";

export default function Checkout({ cartItems }) {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    fulfilmentMethod: "delivery",
  });

  const handlePayment = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cartItems,
        ...form,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Order created: " + data.orderId);
    }
  };

  return (
    <div>
      <h2>Checkout</h2>

      {cartItems.map((item) => (
        <div key={item.id}>
          {item.name} x {item.quantity}
        </div>
      ))}

      <input
        placeholder="Name"
        onChange={(e) =>
          setForm({ ...form, customerName: e.target.value })
        }
      />

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({ ...form, customerEmail: e.target.value })
        }
      />

      <input
        placeholder="Phone"
        onChange={(e) =>
          setForm({ ...form, customerPhone: e.target.value })
        }
      />

      <select
        onChange={(e) =>
          setForm({ ...form, fulfilmentMethod: e.target.value })
        }
      >
        <option value="delivery">Delivery</option>
        <option value="collection">Collection</option>
      </select>

      <button onClick={handlePayment}>
        Payment
      </button>
    </div>
  );
}