import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetch(`/api/cart/${userId}`)
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
  }, [userId]);

  const updateCartCount = () => {
    if (userId) {
      fetch(`/api/cart/${userId}`)
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
  };

  return (
    <CartContext.Provider value={{ count, setCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
}
