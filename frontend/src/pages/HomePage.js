import React, { useEffect, useState, useContext } from "react";
import "./HomePage.css";
import { CartContext } from "../context/CartContext";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const { addToCart } = useContext(CartContext);

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

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) =>
            p.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "a-z":
        return a.name.localeCompare(b.name);
      case "z-a":
        return b.name.localeCompare(a.name);
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="page-container">
      <aside className="sidebar">
        <h3 className="sidebar-title">Category</h3>
        <ul className="category-list">
          {categories.map((cat) => (
            <li
              key={cat}
              className={`category-item ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
        <div className="search-header-bar">
          <span className="result-count">
            {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}
          </span>

          <h2 className="search-query-text">
            {selectedCategory === "All"
              ? "All Products"
              : `${selectedCategory} Products`}
          </h2>

          <div className="sort-section">
            <label htmlFor="sortSelect" className="sort-label">
              Sort
            </label>
            <select
              id="sortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="default">Default</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        <hr className="search-divider" />

        <div className="product-grid">
          {sortedProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-img"
              />
              <h4>{product.name}</h4>
              <p>${product.price.toFixed(2)}</p>
              <p className="availability">
                {product.stockQuantity > 0 ? "Available" : "Out of Stock"}
              </p>
              <button
                className={
                  product.stockQuantity > 0
                    ? "add-button"
                    : "add-button disabled"
                }
                disabled={product.stockQuantity === 0}
                onClick={() =>
                  product.stockQuantity > 0 && addToCart(product._id)
                }
              >
                {product.stockQuantity > 0 ? "Add to Cart" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default HomePage;
