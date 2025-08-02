// src/components/StripeCheckoutButton.js
import React from "react";

const StripeCheckoutButton = ({ userId, deliveryOption, discountCode }) => {
  const API_URL = process.env.REACT_APP_API_URL;

  const handleStripeCheckout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          deliveryOption,
          discountCode,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert("❌ Could not start Stripe checkout");
      }
    } catch (err) {
      console.error("❌ Stripe Checkout Error:", err);
      alert("❌ Failed to start payment");
    }
  };

  return (
    <button className="pay-btn" onClick={handleStripeCheckout}>
      Pay with Card
    </button>
  );
};

export default StripeCheckoutButton;
