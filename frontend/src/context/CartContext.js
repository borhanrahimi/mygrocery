import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);
  const { user } = useContext(AuthContext); // ✅ use user from context
  const API_URL = process.env.REACT_APP_API_URL;

  // ✅ Load cart count
  const loadCartCount = useCallback(() => {
    if (!user?.userId) return;

    fetch(`${API_URL}/api/cart/${user.userId}`)
      .then((res) => res.json())
      .then((data) => {
        const totalCount = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCount(totalCount);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch cart:", err);
      });
  }, [API_URL, user]);

  useEffect(() => {
    loadCartCount();
  }, [loadCartCount]);

  const updateCartCount = (newCount) => {
    setCount(newCount);
  };

  const addToCart = (productId, quantity = 1) => {
    if (!user?.userId) {
      alert("Please log in to add items to your cart.");
      return;
    }

    fetch(`${API_URL}/api/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId, productId, quantity }),
    })
      .then((res) => res.json())
      .then(() => {
        loadCartCount(); // ✅ refresh cart count
      })
      .catch((err) => {
        console.error("❌ Failed to add to cart:", err);
        alert("❌ Could not add item to cart.");
      });
  };

  return (
    <CartContext.Provider
      value={{
        count,
        setCount,
        updateCartCount,
        loadCartCount,
        addToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
