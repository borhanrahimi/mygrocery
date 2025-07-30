import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import PayNowButton from "../components/PayNowButton";
import "./CartPage.css";

function CartPage() {
  const [cart, setCart] = useState([]);
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [showDeliveryMenu, setShowDeliveryMenu] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const userId = localStorage.getItem("userId");
  const { setCount } = useContext(CartContext);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  const deliveryOptions = {
    standard: { label: "Standard (3–5 days)", price: 5 },
    express: { label: "Express (1–2 days)", price: 15 },
    pickup: { label: "Pickup (Free)", price: 0 },
  };

  const loadCart = useCallback(() => {
    fetch(`${API_URL}/api/cart/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const items = data.items
          .filter((i) => i.productId)
          .map((i) => ({
            ...i.productId,
            quantity: i.quantity,
            rawProductId: i.productId._id,
          }));
        setCart(items);
        const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        setCount(totalCount);
      })
      .catch((err) => {
        console.error("❌ Failed to load cart:", err);
        alert("❌ Could not load cart.");
      });
  }, [userId, setCount, API_URL]);

  useEffect(() => {
    if (userId) {
      loadCart();
    }
  }, [userId, loadCart]);

  const removeFromCart = (productId) => {
    fetch(`${API_URL}/api/cart/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    })
      .then(loadCart)
      .catch((err) => {
        console.error("❌ Remove from cart error:", err);
        alert("❌ Could not remove item.");
      });
  };

  const handleCheckout = () => {
    if (!userId) {
      alert("You must be logged in to checkout.");
      return;
    }

    fetch(`${API_URL}/api/orders/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, deliveryOption, discountCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orderId) {
          setCart([]);
          setCount(0);
          navigate("/checkout-success", { state: data });
        } else {
          alert("❌ Error placing order.");
        }
      })
      .catch((err) => {
        console.error("❌ Checkout error:", err);
        alert("❌ Something went wrong.");
      });
  };

  if (!userId) {
    return <p>Please <a href="/auth">log in</a> to view your cart.</p>;
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const isStudent = discountCode.trim().toLowerCase() === "student";
  const discount = isStudent ? subtotal * 0.1 : 0;
  const discountedSubtotal = subtotal - discount;
  const taxAmount = discountedSubtotal * 0.0825;
  const deliveryFee = deliveryOptions[deliveryOption].price;
  const totalWithTax = discountedSubtotal + taxAmount + deliveryFee;

  return (
    <div className="cart-container">
      <h2> Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cart.map((item) => (
              <li key={item.rawProductId} className="cart-item">
                <div className="cart-item-info">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <br />
                    ${item.price?.toFixed(2) || "0.00"} × {item.quantity} = $
                    {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.rawProductId)}>Remove</button>
              </li>
            ))}
          </ul>

          {/* Delivery Option */}
          <div style={{ marginTop: "2rem", position: "relative", maxWidth: "300px" }}>
            <label style={{ fontWeight: "bold" }}>Delivery Option:</label>
            <div
              onClick={() => setShowDeliveryMenu(!showDeliveryMenu)}
              className="dropdown-box"
            >
              {deliveryOptions[deliveryOption].label} – ${deliveryOptions[deliveryOption].price.toFixed(2)}
              <span style={{ float: "right" }}>{showDeliveryMenu ? "▲" : "▼"}</span>
            </div>

            {showDeliveryMenu && (
              <div className="delivery-dropdown">
                {Object.entries(deliveryOptions).map(([key, option]) => (
                  <div
                    key={key}
                    onClick={() => {
                      setDeliveryOption(key);
                      setShowDeliveryMenu(false);
                    }}
                    style={{
                      background: deliveryOption === key ? "#e6f7ff" : "white",
                    }}
                  >
                    {option.label} – ${option.price.toFixed(2)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount Code */}
          <div style={{ marginTop: "1rem", maxWidth: "300px" }}>
            <label htmlFor="discount">Discount Code:</label>
            <input
              id="discount"
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter code (e.g. student)"
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                marginTop: "0.25rem",
              }}
            />
          </div>

          {/* Summary */}
          <div className="summary">
            <h3>Subtotal: ${subtotal.toFixed(2)}</h3>
            {isStudent && (
              <h3 style={{ color: "green" }}>Student Discount: -${discount.toFixed(2)}</h3>
            )}
            <h3>Tax: ${taxAmount.toFixed(2)}</h3>
            <h3>Delivery Fee: ${deliveryFee.toFixed(2)}</h3>
            <h2>Total: ${totalWithTax.toFixed(2)}</h2>
          </div>

          <div className="checkout-buttons">
            <button className="checkout-btn" onClick={handleCheckout}>
              Place Order (No Payment)
            </button>
            <PayNowButton cart={cart} />
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
