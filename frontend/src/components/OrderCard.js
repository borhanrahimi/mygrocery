import React from "react";
import "../Styling/OrderCard.css";

const OrderCard = ({ order, onViewDetails }) => {
  return (
    <div className="order-card">
      <div className="order-header">
      <p><strong>Date:</strong> 
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

        <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Order ID:</strong> {order._id.slice(-6).toUpperCase()}</p>
      </div>

      <div className="order-items">
        {order.items.map((item, i) => (
          <p key={i}>
            {item.quantity}x {item.productId?.name || "Deleted Product"}
          </p>
        ))}
      </div>

      <div className="order-footer">
        <p>Subtotal: ${order.subtotal.toFixed(2)}</p>
        <p>Tax: ${order.taxAmount.toFixed(2)}</p>
        <p>Delivery: ${order.deliveryFee.toFixed(2)}</p>
        {order.discountAmount > 0 && (
          <p className="discount">Discount: -${order.discountAmount.toFixed(2)}</p>
        )}
        <p className="final-total">Total: ${order.totalAmount.toFixed(2)}</p>
        <button onClick={() => onViewDetails(order)} className="view-btn">
          View Details
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
