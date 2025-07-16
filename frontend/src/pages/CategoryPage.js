import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import "./CategoryPage.css";
import { CartContext } from "../context/CartContext";

function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const { setCount } = useContext(CartContext);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (p) => p.category.toLowerCase() === categoryName.toLowerCase()
        );
        setProducts(filtered);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch products:", err);
        alert("❌ Could not load products");
      });
  }, [categoryName]);

  const addToCart = (productId) => {
    if (!userId) {
      alert("⚠️ Please log in to add items to your cart.");
      return;
    }

    fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add to cart");
        return res.json();
      })
      .then((data) => {
        const total = data.items.reduce((sum, item) => sum + item.quantity, 0);
        setCount(total); // ✅ update cart count silently
      })
      .catch((err) => {
        console.error("❌ Add to cart error:", err);
        alert("❌ Could not add to cart.");
      });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{categoryName} Products</h2>
      <div className="product-grid">
        {products.map((p) => (
          <div key={p._id} className="product-card">
            <img src={p.image} alt={p.name} className="product-img" />
            <h4>{p.name}</h4>
            <p>${p.price.toFixed(2)}</p>
            <button className="add-btn" onClick={() => addToCart(p._id)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryPage;
