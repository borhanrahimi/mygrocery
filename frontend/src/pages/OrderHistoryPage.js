import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./OrderHistoryPage.css";

const OrderHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date-newest");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const getTotalAmount = (order) => {
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );
    const discount = order.discountCode?.toUpperCase() === "STUDENT" ? subtotal * 0.1 : 0;
    const tax = (subtotal - discount) * 0.0825;
    const delivery = order.deliveryFee || 0;
    return { subtotal, discount, tax, delivery, total: subtotal - discount + tax + delivery };
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  const sortedOrders = [...orders].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return getTotalAmount(a).total - getTotalAmount(b).total;
      case "price-high-low":
        return getTotalAmount(b).total - getTotalAmount(a).total;
      case "date-oldest":
        return new Date(a.timestamp) - new Date(b.timestamp);
      case "date-newest":
      default:
        return new Date(b.timestamp) - new Date(a.timestamp);
    }
  });

  if (loading) return <p>Loading order history...</p>;
  if (!orders.length) return <p>No orders found.</p>;

  return (
    <div className="order-history-container">
      <div className="order-header-bar">
        <span className="order-count">
          {sortedOrders.length} Order{sortedOrders.length !== 1 ? "s" : ""}
        </span>
        <h2 className="order-history-title">Your Order History</h2>
        <div className="sort-section">
          <label htmlFor="sortSelect" className="sort-label">Sort</label>
          <select
            id="sortSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="date-newest">Date: Newest</option>
            <option value="date-oldest">Date: Oldest</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      <hr className="order-divider" />

      {sortedOrders.map((order) => {
        const { total } = getTotalAmount(order);

        return (
          <div key={order._id} className="order-card">
            <div className="order-summary-header">
              <div>
                <p><strong>Order Placed by:</strong></p>
                <p className="order-date">{new Date(order.timestamp).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Total:</strong></p>
                <p className="order-total">${total.toFixed(2)}</p>
              </div>
              <div>
                <p><strong>order</strong> #{order._id}</p>
                <p><strong>status:</strong> {order.status || "N/A"}</p>
              </div>
            </div>

            <hr className="order-divider" />

            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={item.productId.image}
                    alt={item.productId.name}
                    className="item-image"
                  />
                  <div className="item-info">
                    <strong>{item.productId.name}</strong>
                    <p className="price-line">
                      ${item.productId.price.toFixed(2)} × {item.quantity} = $
                      {(item.productId.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>


            <div className="order-footer">
              <button className="view-details-link" onClick={() => handleViewDetails(order)}>
                view order details
              </button>
            </div>
          </div>
        );
      })}

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <p><strong>Order Placed by:</strong> {new Date(selectedOrder.timestamp).toLocaleDateString()}</p>
              <p><strong>status:</strong> {selectedOrder.status}</p>
              <p><strong>order #</strong> {selectedOrder._id}</p>
            </div>

            <hr />

            <div className="modal-grid">
              <div>
                <h4>Ship to</h4>
                <p>Borhan</p>
                <p>20614 STONE OAK PKWY APT 2611</p>
                <p>SAN ANTONIO, TX 78258</p>
              </div>
              <div>
                <h4>Payment Method</h4>
                <p>Card ending in 7889 (to be replaced with live payment info)</p>
              </div>
              <div>
                <h4>Order Summary</h4>
                {(() => {
                  const { subtotal, discount, tax, delivery, total } = getTotalAmount(selectedOrder);
                  return (
                    <>
                      <p><strong>Shipping & Handling:</strong> ${delivery.toFixed(2)}</p>
                      <p><strong>Total before tax:</strong> ${subtotal.toFixed(2)}</p>
                      <p><strong>Estimated tax:</strong> ${tax.toFixed(2)}</p>
                      {discount > 0 && <p><strong>Discount:</strong> Student ${discount.toFixed(2)}</p>}
                      <p><strong>Total:</strong> ${total.toFixed(2)}</p>
                    </>
                  );
                })()}
              </div>
            </div>

            <hr />

            <div className="modal-items">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <img src={item.productId.image} alt={item.productId.name} className="item-image" />
                  <div className="item-info">
                    <strong>{item.productId.name}</strong>
                    <p>${item.productId.price.toFixed(2)} × {item.quantity} = ${(item.productId.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="close-modal-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
