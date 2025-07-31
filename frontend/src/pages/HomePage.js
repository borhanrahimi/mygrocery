import React, { useEffect, useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import "../Styling/HomePage.css";

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
        alert("Could not load products");
      });
  }, [API_URL]);

  const categories = ["All", "Fruit", "Meat", "Bakery", "Dairy", "Coffee"];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="homepage-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Category</h3>
        <ul>
          {categories.map((cat) => (
            <li
              key={cat}
              className={cat === selectedCategory ? "active" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* Main content */}
      <div className="main-content">
        <div className="search-header">
          <div className="result-count">{filteredProducts.length} products</div>
          <h2 className="search-title">All Products</h2>
          <div className="sort-dropdown">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Sort</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        <div className="product-grid">
          {sortedProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>${product.price.toFixed(2)}</p>
              <p>Available</p>
              <button
                className="add-btn"
                onClick={() => addToCart(product._id, product.stockQuantity)}
                disabled={product.stockQuantity === 0}
              >
                {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
