// src/components/PayNowButton.js
import React from "react";
import { useNavigate } from "react-router-dom";

const PayNowButton = ({ userId, deliveryOption, discountCode }) => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handlePayment = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payments/charge-saved-method`, {
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

      if (res.ok && data.success) {
        navigate("/checkout-success");
      } else {
        alert("❌ Payment failed: " + (data.message || "Something went wrong"));
      }
    } catch (err) {
      console.error("❌ Error charging card:", err);
      alert("❌ Could not process payment.");
    }
  };

  return (
    <button className="pay-btn" onClick={handlePayment}>
      Pay with Saved Card
    </button>
  );
};

export default PayNowButton;
