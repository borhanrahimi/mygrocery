import React, { useState } from "react";

const PayNowButton = ({ cart }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      console.log("🧾 Stripe session response:", data);

      window.location.href = data.url;

    } catch (error) {
      console.error("❌ Stripe redirect error:", error);
      alert("⚠️ Failed to redirect to payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="pay-now-button" onClick={handleCheckout} disabled={loading}>
      {loading ? "Redirecting..." : "💳 Pay with Card"}
    </button>
  );
};

export default PayNowButton;
