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

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  return (
    <CartContext.Provider value={{ count, setCount, updateCartCount: fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
}
