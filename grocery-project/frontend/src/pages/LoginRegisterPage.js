import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRegister.css";

function LoginRegisterPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Corrected endpoints to match backend
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login"
      ? { email: form.email, password: form.password }
      : form;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.userId) {
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/");
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (err) {
      alert("⚠️ Network error or server is down.");
      console.error("❌ Login/Register error:", err);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h1>Mygrocery</h1>
        <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>

        {mode === "signup" && (
          <>
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </>
        )}

        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {mode === "login" && (
          <button
            type="button"
            className="forgot-link"
            onClick={() => alert("Reset password coming soon!")}
          >
            Forgot your password?
          </button>
        )}

        <button type="submit" className="auth-btn">
          {mode === "login" ? "Log in" : "Sign up"}
        </button>

        <p style={{ marginTop: "1rem" }}>
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <span
            className="toggle-link"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "sign up" : "log in"}
          </span>
        </p>
      </form>
    </div>
  );
}

export default LoginRegisterPage;
