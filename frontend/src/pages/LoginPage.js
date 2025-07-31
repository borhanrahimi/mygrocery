import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const userData = {
        userId: res.data.userId,
        email: res.data.email
      };

      setUser(userData);
      navigate("/"); // redirect to home
    } catch (err) {
      console.error("❌ Login error:", err.response?.data?.error || err.message);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      {error && <p className="error">❌ {error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
