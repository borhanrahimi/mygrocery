import { createContext, useState, useEffect } from "react";

export const CartContext = createContext(); // ✅ Named export

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetch(`/api/cart/${userId}`)
        .then(res => res.json())
        .then(data => {
          const totalItems = data.items?.reduce((acc, item) => acc + item.quantity, 0);
          setCount(totalItems || 0);
        })
        .catch(err => {
          console.error("❌ Failed to load cart:", err);
          setCount(0);
        });
    }
  }, [userId]);

  return (
    <CartContext.Provider value={{ count, setCount }}>
      {children}
    </CartContext.Provider>
  );
}
