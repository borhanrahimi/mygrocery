import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function CartPage() {
  const [cart, setCart] = useState([]);
  const userId = localStorage.getItem("userId");
  const { setCount } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetch(`/api/cart/${userId}`)
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
        });
    }
  }, [userId]);

  const removeFromCart = (productId) => {
    fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    }).then(() => {
      fetch(`/api/cart/${userId}`)
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
          setCount(totalCount); // 🔴 update badge count
        });
    });
  };

  const handleCheckout = () => {
  if (!userId) {
    alert("You must be logged in to checkout.");
    return;
  }

  fetch("/api/orders/create", {
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
      console.error("Checkout error:", err);
      alert("❌ Something went wrong.");
    });
};

  if (!userId) {
    return <p>Please <a href="/auth">log in</a> to view your cart.</p>;
  }

  return (
    <>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.rawProductId} className="product-item">
                <div className="product-info">
                  <img src={item.image} alt={item.name} className="product-img" />
                  <span>
                    <strong>{item.name}</strong> - ${item.price?.toFixed(2) || "0.00"} x {item.quantity || 1}
                  </span>
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

          <button
            className="add-btn"
            onClick={handleCheckout}
            style={{ marginTop: "1rem", width: "100%" }}
          >
            Checkout
          </button>
        </>
      )}
    </>
  );
}

export default CartPage;
