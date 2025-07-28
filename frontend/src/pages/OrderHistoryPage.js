import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./OrderHistoryPage.css";

const OrderHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("timestamp");
  const [order, setOrder] = useState("desc");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user) {
      axios
        .get(`${API_URL}/api/orders/${user}?sortBy=${sortBy}&order=${order}`)
        .then((res) => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch orders:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user, API_URL, sortBy, order]);

  if (loading) return <p>Loading order history...</p>;
  if (!orders.length) return <p>No orders found.</p>;

  return (
    <div className="order-history-container">
      <h2>🧾 Your Order History</h2>

      {/* Sort dropdowns */}
      <div style={{ margin: "1rem 0" }}>
        <label style={{ fontWeight: "bold", marginRight: "0.5rem" }}>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="timestamp">Date</option>
          <option value="totalAmount">Total Price</option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          style={{ marginLeft: "1rem" }}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {orders.map((order) => {
        const subtotal = order.items.reduce(
          (sum, item) => sum + item.productId.price * item.quantity,
          0
        );

        const discountCode = order.discountCode;
        const discountAmount =
          discountCode?.toUpperCase() === "STUDENT" ? subtotal * 0.1 : 0;

        const discountedSubtotal = subtotal - discountAmount;
        const tax = discountedSubtotal * 0.0825;
        const deliveryFee = order.deliveryFee || 0;
        const total = discountedSubtotal + tax + deliveryFee;

        const totalQuantity = order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        return (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Date:</strong> {new Date(order.timestamp).toLocaleString()}</p>
              <p><strong>Status:</strong> {order.status || "N/A"}</p>
              <p><strong>Total Items:</strong> {totalQuantity}</p>
              {discountCode && (
                <p><strong>Discount Code:</strong> {discountCode}</p>
              )}
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={item.productId.image}
                    alt={item.productId.name}
                    className="item-image"
                  />
                  <span>
                    {item.quantity}x {item.productId.name} — ${item.productId.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "right", marginTop: "1rem" }}>
              <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
              {discountAmount > 0 && (
                <p><strong>Discount (10%):</strong> -${discountAmount.toFixed(2)}</p>
              )}
              <p><strong>Tax (8.25%):</strong> ${tax.toFixed(2)}</p>
              <p><strong>Delivery Fee:</strong> ${deliveryFee.toFixed(2)}</p>
              <p><strong>Total:</strong> ${total.toFixed(2)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistoryPage;
