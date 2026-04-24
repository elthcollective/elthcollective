import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function OrderHistory({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data || []);
    };

    if (user) fetchOrders();
  }, [user]);

  return (
    <div>
      <h2>Your Orders</h2>

      {orders.map((order) => (
        <div key={order.id}>
          <p>Order ID: {order.id}</p>
          <p>Total: {order.total}</p>
          <p>Status: {order.status}</p>
        </div>
      ))}
    </div>
  );
}