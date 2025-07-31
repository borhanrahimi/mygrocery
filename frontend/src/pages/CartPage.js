import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PayNowButton from "../components/PayNowButton";
import "./CartPage.css";

function CartPage() {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [isStudent, setIsStudent] = useState(false);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/api/cart/${user.userId}`)
      .then((res) => res.json())
      .then((data) => setCartItems(data.items || []))
      .catch((err) => console.error("❌ Failed to fetch cart:", err));

    fetchSummary(deliveryOption, isStudent ? "STUDENT" : null);
  }, [user, API_URL, deliveryOption, isStudent]);

  const fetchSummary = (delivery, discount) => {
    setLoading(true);
    fetch(`${API_URL}/api/cart/summary/${user.userId}?delivery=${delivery}&discount=${discount}`)
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch summary:", err);
        setLoading(false);
      });
  };

  const handleNoPaymentCheckout = () => {
    const payload = {
      userId: user.userId,
      deliveryOption,
      discountCode: isStudent ? "STUDENT" : null,
    };

    fetch(`${API_URL}/api/orders/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => navigate("/checkout-success"))
      .catch((err) => {
        console.error("❌ Order error:", err);
        alert("❌ Failed to place order.");
      });
  };

  return (
    <div className="cart-page">
      <h2>🛒 Your Cart</h2>

      {loading ? (
        <p>Loading cart...</p>
      ) : (
        <>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <ul className="cart-item-list">
                {cartItems.map((item) => (
                  <li key={item._id}>
                    {item.productId?.name} × {item.quantity} — $
                    {(item.productId?.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>

              <div className="checkout-controls">
                <label>
                  Delivery Option:
                  <select
                    value={deliveryOption}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                  >
                    <option value="standard">Standard - $5</option>
                    <option value="express">Express - $15</option>
                    <option value="pickup">Pickup - Free</option>
                    <option value="carryout">Carryout - $2.99</option>
                  </select>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isStudent}
                    onChange={() => setIsStudent(!isStudent)}
                  />
                  I am a student (10% off)
                </label>
              </div>

              <div className="summary-box">
                <p>Subtotal: ${summary?.subtotal?.toFixed(2)}</p>
                <p>Tax: ${summary?.tax?.toFixed(2)}</p>
                <p>Delivery: ${summary?.deliveryFee?.toFixed(2)}</p>
                {summary?.discountAmount > 0 && (
                  <p className="discount">Student Discount: -${summary.discountAmount.toFixed(2)}</p>
                )}
                <h3>Total: ${summary?.total?.toFixed(2)}</h3>
              </div>

              <div className="payment-options">
                <PayNowButton
                  userId={user.userId}
                  deliveryOption={deliveryOption}
                  discountCode={isStudent ? "STUDENT" : ""}
                />

                <button className="no-pay-btn" onClick={handleNoPaymentCheckout}>
                  Place Order (No Card)
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default CartPage;
