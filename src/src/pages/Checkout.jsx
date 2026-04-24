import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../services/orderService";

export default function Checkout({ user, cartItems, setCartItems }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (loading) return;

    if (!user) {
      alert("Please log in first");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const order = await createOrder(user.id, cartItems);

      if (!order) {
        alert("Order failed. Please try again.");
        return;
      }

      // clear cart after success
      setCartItems([]);

      // go to confirmation page
      navigate("/order-confirmation", {
        state: { orderId: order.id },
      });
    } catch (error) {
      console.log("Checkout error:", error);
      alert("Something went wrong during checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Checkout</h2>

      <div>
        {cartItems?.map((item) => (
          <div key={item.id}>
            {item.name} x {item.quantity}
          </div>
        ))}
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{ marginTop: "20px" }}
      >
        {loading ? "Processing..." : "Proceed to Checkout"}
      </button>
    </div>
  );
}