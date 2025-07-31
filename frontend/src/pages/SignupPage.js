import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, form);

      const userData = {
        userId: res.data.userId,
        email: res.data.email
      };

      setUser(userData);
      navigate("/");
    } catch (err) {
      console.error("❌ Signup error:", err.response?.data?.error || err.message);
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="signup-page">
      <h2>Sign Up</h2>
      {error && <p className="error">❌ {error}</p>}
      <form onSubmit={handleSignup}>
        <input name="firstName" placeholder="First Name" onChange={handleChange} required />
        <input name="lastName" placeholder="Last Name" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default SignupPage;
