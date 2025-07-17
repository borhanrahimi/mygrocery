import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function CartPage() {
  const [cart, setCart] = useState([]);
  const userId = localStorage.getItem("userId");
  const { setCount } = useContext(CartContext);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

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
      body: JSON.stringify({ userId }),
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

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

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
                <div className="product-info" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="product-img"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                  />
                  <div>
                    <strong>{item.name}</strong><br />
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

          <h3 style={{ textAlign: "right", marginTop: "1rem" }}>
            Total: ${totalPrice.toFixed(2)}
          </h3>

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
