import { createContext, useState, useEffect, useCallback } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);
  const userId = localStorage.getItem("userId");
  const API_URL = process.env.REACT_APP_API_URL;

  // ✅ Load cart count on mount
  const loadCartCount = useCallback(() => {
    if (!userId) return;

    fetch(`${API_URL}/api/cart/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const totalCount = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCount(totalCount);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch cart:", err);
      });
  }, [userId, API_URL]);

  useEffect(() => {
    loadCartCount();
  }, [loadCartCount]);

  // ✅ Allow manual update from anywhere
  const updateCartCount = (newCount) => {
    setCount(newCount);
  };

  return (
    <CartContext.Provider value={{ count, setCount, updateCartCount, loadCartCount }}>
      {children}
    </CartContext.Provider>
  );
}
