import React from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51Rqd3tD1s9AluFDZFlSUPD87Y3oYiETZaynNsSdDLwWI7HLDglSGUaS9WfeTiShublMcCzSqc7MUCuzm0NmEX1A000NevL1a5e");

const PayNowButton = ({ cart }) => {
  const handleCheckout = async () => {
    try {
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

      if (!data.url) {
        throw new Error("No URL returned from backend");
      }

      const stripe = await stripePromise;
      stripe.redirectToCheckout({ url: data.url });
    } catch (error) {
      console.error("❌ Stripe redirect error:", error);
      alert("⚠️ Failed to redirect to payment.");
    }
  };

  return (
    <button className="pay-now-button" onClick={handleCheckout}>
      💳 Pay with Card
    </button>
  );
};

export default PayNowButton;
