import { createContext, useState, useEffect, useCallback } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);
  const userId = localStorage.getItem("userId");
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchCartCount = useCallback(() => {
    if (userId) {
      fetch(`${API_URL}/api/cart/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          const totalItems = data.items?.reduce((acc, item) => acc + item.quantity, 0);
          setCount(totalItems || 0);
        })
        .catch((err) => {
          console.error("❌ Failed to update cart count:", err);
          setCount(0);
        });
    }
  }, [userId, API_URL]);

  // ✅ Add to Cart Function
  const addToCart = (productId) => {
    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }

    fetch(`${API_URL}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId, productId, quantity: 1 })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add to cart");
        return res.json();
      })
      .then(() => {
        fetchCartCount(); // ✅ Refresh cart count after adding
      })
      .catch((err) => {
        console.error("❌ Error adding to cart:", err);
        alert("❌ Failed to add item to cart.");
      });
  };

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  return (
    <CartContext.Provider value={{ count, setCount, updateCartCount: fetchCartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}
