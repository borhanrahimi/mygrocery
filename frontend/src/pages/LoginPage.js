import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../Styling/AuthForm.css"; // Same CSS used in SignUpPage

const LoginPage = () => {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const res = await axios.post(`${API_URL}/api/users/login`, formData);
  
      const userData = {
        userId: res.data.userId,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        email: res.data.email,
        phone: res.data.phone
      };
  
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("userId", res.data.userId);
  
      navigate("/");
    } catch (err) {
      if (err.response) {
        console.error("❌ Server responded with error:", err.response.data);
      } else {
        console.error("❌ Login failed:", err.message);
      }
      alert("❌ Invalid email or password.");
    }
  };
  

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2 className="auth-title">Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="auth-btn">Login</button>

        <p className="auth-toggle">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
