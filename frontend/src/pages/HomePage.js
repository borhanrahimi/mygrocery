import React, { useEffect, useState, useContext } from "react";
import ProductCard from "../components/ProductCard";
import { CartContext } from "../context/CartContext";
import "./HomePage.css";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const { updateCartCount } = useContext(CartContext);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error("❌ Failed to fetch products:", err);
        alert("❌ Could not load products");
      });
  }, [API_URL]);

  const categories = ["All", "Fruit", "Meat", "Bakery", "Dairy", "Coffee"];

  const filtered = selectedCategory === "All"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="homepage">
      <div className="homepage-header">
        <h2>{selectedCategory}</h2>
        <div className="sort-controls">
          <label>Sort:</label>
          <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
            <option value="default">Default</option>
            <option value="name-asc">Name ↑</option>
            <option value="name-desc">Name ↓</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>
      </div>

      <div className="category-sidebar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? "active" : ""}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {sorted.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAdd={() => updateCartCount()}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
