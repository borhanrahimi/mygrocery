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
    if (user?.userId) {
      axios
        .get(`${API_URL}/api/orders/${user.userId}`)
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
  }, [user?.userId, API_URL]);

  const sortOrders = (orderList) => {
    return [...orderList].sort((a, b) => {
      if (sortBy === "date-newest") return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === "date-oldest") return new Date(a.timestamp) - new Date(b.timestamp);
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
        <p>{orders.length} Orders</p>
        <h2>Your Order History</h2>
        <div>
          <label htmlFor="sort">Sort</label>{" "}
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-newest">Date: Newest</option>
            <option value="date-oldest">Date: Oldest</option>
            <option value="amount-high">Total: High to Low</option>
            <option value="amount-low">Total: Low to High</option>
          </select>
        </div>
      </div>

      <div className="order-list">
        {sortOrders(orders).map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-info">
              <p><strong>Order Placed:</strong><br />
                {order.timestamp
                  ? new Date(order.timestamp).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
              <p><strong>Total:</strong><br />${order?.totalAmount?.toFixed(2) || "0.00"}</p>
              <p><strong>Order:</strong><br />#{order._id}</p>
              <p><strong>Status:</strong><br />{order.status}</p>
            </div>

            <div className="order-items">
              {order.items?.map((item, i) => (
                <div key={i} className="item-line">
                  {item.productId?.image && (
                    <img src={item.productId.image} alt={item.productId.name} />
                  )}
                  <div>
                    <strong>{item.productId?.name}</strong><br />
                    ${item.productId?.price?.toFixed(2)} × {item.quantity} = $
                    {(item.productId?.price * item.quantity).toFixed(2)}
                  </div>
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
