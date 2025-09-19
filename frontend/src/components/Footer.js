import React from "react";
import { Link } from "react-router-dom";
import "../Styling/Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-left">
          <h4>MyGrocery</h4>
          <p>&copy; {year} All rights reserved</p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/orders">Orders</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
