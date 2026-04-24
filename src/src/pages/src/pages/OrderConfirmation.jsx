import { useLocation } from "react-router-dom";

export default function OrderConfirmation() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div>
      <h2>Order Confirmed</h2>
      <p>Your order ID is:</p>
      <h3>{orderId}</h3>
    </div>
  );
}