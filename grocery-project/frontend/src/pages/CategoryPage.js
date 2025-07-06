import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import "./CategoryPage.css";
import { CartContext } from "../context/CartContext";

function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const userId = localStorage.getItem("userId");
  const { setCount } = useContext(CartContext);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(
          p => p.category.toLowerCase() === categoryName.toLowerCase()
        );
        setProducts(filtered);
      });
  }, [categoryName]);

  const addToCart = (productId) => {
    if (!userId) {
      alert("Please log in to add to cart.");
      return;
    }

    fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId })
    })
      .then(res => res.json())
      .then(data => {
        const total = data.items.reduce((sum, item) => sum + item.quantity, 0);
        setCount(total); // ✅ Update cart badge count
      })
      .catch(err => {
        console.error("Add to cart error:", err);
      });
  };

  return (
    <div>
      <h2>{categoryName} Products</h2>
      <div className="product-grid">
        {products.map(p => (
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
