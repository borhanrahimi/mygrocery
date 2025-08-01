import React from "react";
import "../Styling/OrderDetailsModal.css";

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const {
    _id,
    timestamp,
    status,
    deliveryOption,
    subtotal,
    taxAmount,
    deliveryFee,
    discountAmount,
    totalAmount,
    items,
    user
  } = order;

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="order-details-modal-overlay">
      <div className="order-details-modal">
        <h2>Order #{_id}</h2>
        <p><strong>Date:</strong> {formatDate(timestamp)}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Delivery:</strong> {deliveryOption}</p>

        <div className="order-section">
          <h3>Ship To</h3>
          <p>
            {user?.firstName} {user?.lastName}
            <br />
            {user?.email}
            <br />
            {user?.phone}
          </p>
        </div>

        <div className="order-section">
          <h3>Payment Method</h3>
          <p>Password: ••••••••</p>
        </div>

        <div className="order-section">
          <h3>Items</h3>
          <ul>
            {items.map((item, idx) => (
              <li key={idx}>
                {item.quantity}× {item.productId?.name || "Deleted Product"}
              </li>
            ))}
          </ul>
        </div>

        <div className="order-section totals">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Tax: ${taxAmount.toFixed(2)}</p>
          <p>Delivery Fee: ${deliveryFee.toFixed(2)}</p>
          {discountAmount > 0 && (
            <p>Discount: -${discountAmount.toFixed(2)}</p>
          )}
          <hr />
          <p><strong>Total: ${totalAmount.toFixed(2)}</strong></p>
        </div>

        <div className="modal-actions">
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
