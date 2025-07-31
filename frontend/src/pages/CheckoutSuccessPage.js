import React from "react";
import { Link } from "react-router-dom";
import "./CheckoutSuccessPage.css";

const CheckoutSuccessPage = () => {
  return (
    <div className="success-page">
      <h2>✅ Order Placed Successfully!</h2>
      <p>Thank you for shopping with us. Your order has been received and is being processed.</p>

      <div className="success-actions">
        <Link to="/orders" className="btn">
          View My Orders
        </Link>
        <Link to="/" className="btn secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
