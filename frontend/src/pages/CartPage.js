import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function CartPage() {
  const [cart, setCart] = useState([]);
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [showDeliveryMenu, setShowDeliveryMenu] = useState(false);
  const userId = localStorage.getItem("userId");
  const { setCount } = useContext(CartContext);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  const deliveryOptions = {
    standard: { label: "Standard (3–5 days)", price: 5 },
    express: { label: "Express (1–2 days)", price: 15 },
    pickup: { label: "Pickup (Free)", price: 0 }
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
      body: JSON.stringify({ userId, deliveryOption }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orderId) {
          setCart([]);
          setCount(0);
          navigate("/checkout-success");
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

  const taxRate = 0.0825;
  const taxAmount = subtotal * taxRate;
  const deliveryFee = deliveryOptions[deliveryOption].price;
  const totalWithTax = subtotal + taxAmount + deliveryFee;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cart.map((item) => (
              <li
                key={item.rawProductId}
                className="product-item"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div
                  className="product-info"
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="product-img"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <br />
                    ${item.price?.toFixed(2) || "0.00"} × {item.quantity} = $
                    {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.rawProductId)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          {/* Dropdown delivery option */}
          <div style={{ marginTop: "2rem", position: "relative", maxWidth: "300px" }}>
            <label style={{ fontWeight: "bold" }}>Delivery Option:</label>
            <div
              onClick={() => setShowDeliveryMenu(!showDeliveryMenu)}
              style={{
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "0.5rem",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f9f9f9"
              }}
            >
              {deliveryOptions[deliveryOption].label} – ${deliveryOptions[deliveryOption].price.toFixed(2)}
              <span style={{ marginLeft: "1rem" }}>{showDeliveryMenu ? "▲" : "▼"}</span>
            </div>

            {showDeliveryMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderTop: "none",
                  zIndex: 10,
                }}
              >
                {Object.entries(deliveryOptions).map(([key, option]) => (
                  <div
                    key={key}
                    onClick={() => {
                      setDeliveryOption(key);
                      setShowDeliveryMenu(false);
                    }}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      background: deliveryOption === key ? "#e6f7ff" : "#fff",
                      borderBottom: "1px solid #eee"
                    }}
                  >
                    {option.label} – ${option.price.toFixed(2)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <h3 style={{ textAlign: "right", marginTop: "1rem" }}>
            Subtotal: ${subtotal.toFixed(2)}
          </h3>
          <h3 style={{ textAlign: "right" }}>
            Tax: ${taxAmount.toFixed(2)}
          </h3>
          <h3 style={{ textAlign: "right" }}>
            Delivery Fee: ${deliveryFee.toFixed(2)}
          </h3>
          <h2 style={{ textAlign: "right" }}>
            Total: ${totalWithTax.toFixed(2)}
          </h2>

          <button
            className="add-btn"
            onClick={handleCheckout}
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.75rem",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default CartPage;
