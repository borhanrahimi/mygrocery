import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import "./CategoryPage.css";
import { CartContext } from "../context/CartContext";

function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState("none");

  const { setCount } = useContext(CartContext);
  const userId = localStorage.getItem("userId");
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (p) => p.category.toLowerCase() === categoryName.toLowerCase()
        );
        setOriginalProducts(filtered);
        setProducts(filtered); // initial unsorted
      })
      .catch((err) => {
        console.error("❌ Failed to fetch products:", err);
        alert("❌ Could not load products");
      });
  }, [categoryName, API_URL]);

  useEffect(() => {
    let sorted = [...originalProducts];

    if (sortOrder === "asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      sorted.sort((a, b) => b.price - a.price);
    }

    setProducts(sorted);
  }, [sortOrder, originalProducts]);

  const addToCart = (productId, available) => {
    if (!available) {
      alert("⚠️ This product is currently out of stock.");
      return;
    }

    if (!userId) {
      alert("⚠️ Please log in to add items to your cart.");
      return;
    }

    fetch(`${API_URL}/api/cart/add`, {
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
        setCount(total);
      })
      .catch((err) => {
        console.error("❌ Add to cart error:", err);
        alert("❌ Could not add to cart.");
      });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{categoryName} Products</h2>

      {/* 🔽 Sort Dropdown */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="sort">Sort by Price: </label>
        <select
          id="sort"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="none">Default</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>

      <div className="product-grid">
        {products.map((p) => (
          <div key={p._id} className="product-card">
            <img src={p.image} alt={p.name} className="product-img" />
            <h4>{p.name}</h4>
            <p>${p.price.toFixed(2)}</p>
            <p>
              Availability:{" "}
              <span style={{ color: p.available ? "green" : "red" }}>
                {p.available ? "Available" : "Out of Stock"}
              </span>
            </p>
            <button
              className="add-btn"
              onClick={() => addToCart(p._id, p.available)}
              disabled={!p.available}
              style={!p.available ? { backgroundColor: "gray", color: "#fff" } : {}}
            >
              {p.available ? "Add to Cart" : "Unavailable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryPage;
