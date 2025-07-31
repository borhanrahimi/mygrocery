import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import PayNowButton from "../components/PayNowButton";
import "../Styling/CartPage.css";

function CartPage() {
  const { user } = useContext(AuthContext);
  const { loadCartCount } = useContext(CartContext);
  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [discountCode, setDiscountCode] = useState("");
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // ✅ Load cart items
    fetch(`${API_URL}/api/cart/${user.userId}`)
      .then((res) => res.json())
      .then((data) => setCartItems(data.items || []))
      .catch((err) => console.error("❌ Failed to fetch cart:", err));

    // ✅ Load cart summary
    setLoading(true);
    fetch(`${API_URL}/api/cart/summary/${user.userId}?delivery=${deliveryOption}&discount=${discountCode}`)
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch summary:", err);
        setLoading(false);
      });
  }, [user, API_URL, deliveryOption, discountCode, navigate]);

  // ✅ Remove 1 unit of product from cart (clean version)
  const handleRemoveItem = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          productId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove item");
      }

      const data = await res.json();
      setCartItems(data.items || []);
      loadCartCount();

      // Refresh summary
      const summaryRes = await fetch(
        `${API_URL}/api/cart/summary/${user.userId}?delivery=${deliveryOption}&discount=${discountCode}`
      );

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      } else {
        console.warn("⚠️ Could not refresh summary, but item was removed.");
      }
    } catch (err) {
      console.error("❌ Failed to remove item:", err);
      alert("❌ Could not remove item.");
    }
  };

  const handleNoPaymentCheckout = () => {
    const payload = {
      userId: user.userId,
      deliveryOption,
      discountCode: discountCode || null,
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
      <h2>Your Cart</h2>

      {loading ? (
        <p>Loading cart...</p>
      ) : (
        <>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div className="cart-item" key={item._id}>
                  <img
                    src={item.productId?.image}
                    alt={item.productId?.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <h4>{item.productId?.name}</h4>
                    <p>
                      ${item.productId?.price.toFixed(2)} × {item.quantity} = $
                      {(item.productId?.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.productId?._id)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <hr />

              <div className="cart-options">
                <label>
                  <strong>Delivery Option:</strong>
                  <select
                    value={deliveryOption}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                  >
                    <option value="standard">Standard (3–5 days) – $5.00</option>
                    <option value="express">Express (1–2 days) – $15.00</option>
                    <option value="pickup">Pickup – Free</option>
                    <option value="carryout">Carryout – $2.99</option>
                  </select>
                </label>

                <label>
                  <strong>Discount Code:</strong>
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter code (e.g. STUDENT)"
                  />
                </label>
              </div>

              <div className="cart-summary">
                <p>Subtotal: ${summary?.subtotal?.toFixed(2)}</p>
                <p>Tax: ${summary?.tax?.toFixed(2)}</p>
                <p>Delivery Fee: ${summary?.deliveryFee?.toFixed(2)}</p>
                {summary?.discountAmount > 0 && (
                  <p className="discount">Discount: -${summary.discountAmount.toFixed(2)}</p>
                )}
                <h2>Total: ${summary?.total?.toFixed(2)}</h2>
              </div>

              <button className="place-order-btn" onClick={handleNoPaymentCheckout}>
                Place Order (No Payment)
              </button>

              <PayNowButton
                userId={user.userId}
                deliveryOption={deliveryOption}
                discountCode={discountCode}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default CartPage;
