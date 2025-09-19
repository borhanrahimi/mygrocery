import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51Rqd3tD1s9AluFDZFlSUPD87Y3oYiETZaynNsSdDLwWI7HLDglSGUaS9WfeTiShublMcCzSqc7MUCuzm0NmEX1A000NevL1a5e"
);

export default function PayNowButton({ userId, deliveryOption, discountCode }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      if (!userId) throw new Error("Missing userId");
      if (!deliveryOption) throw new Error("Missing deliveryOption");

      setLoading(true);

      const base = process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "";
      const res = await fetch(`${base}/api/orders/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          deliveryOption,
          discountCode: discountCode || "",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data = await res.json();

      if (!data?.url) throw new Error("No checkout URL returned by backend");

      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({ url: data.url });
      if (result.error) throw result.error;
    } catch (err) {
      console.error("❌ Stripe redirect error:", err);
      alert(err.message || "⚠️ Failed to redirect to payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="pay-now-button"
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? "Processing..." : "💳 Pay with Card"}
    </button>
  );
}
