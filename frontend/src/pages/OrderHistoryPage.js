import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import OrderDetailsModal from "../components/OrderDetailsModal";
import "../Styling/OrderHistoryPage.css";

const OrderHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date-newest");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user) {
      axios
        .get(`${API_URL}/api/orders/${user}`)
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
  }, [user, API_URL]);

  const sortOrders = (orderList) => {
    return [...orderList].sort((a, b) => {
      if (sortBy === "date-newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "date-oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "amount-high") return (b.totalAmount || 0) - (a.totalAmount || 0);
      if (sortBy === "amount-low") return (a.totalAmount || 0) - (b.totalAmount || 0);
      return 0;
    });
  };

  if (loading) return <p>Loading orders...</p>;
  if (!orders.length) return <p>No orders found.</p>;

  return (
    <div className="order-history-page">
      <div className="order-header">
        <h2>Your Orders</h2>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date-newest">Newest First</option>
          <option value="date-oldest">Oldest First</option>
          <option value="amount-high">Total: High to Low</option>
          <option value="amount-low">Total: Low to High</option>
        </select>
      </div>

      <div className="order-list">
        {sortOrders(orders).map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-info">
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Total:</strong> ${order?.totalAmount?.toFixed(2) || "0.00"}</p>
            </div>

            <div className="order-items">
              {order.items?.map((item, i) => (
                <div key={i} className="item-line">
                  {item.quantity}x {item.productId?.name}
                </div>
              ))}
            </div>

            <div className="order-actions">
              <button onClick={() => setSelectedOrder(order)}>
                View Order Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderHistoryPage;
