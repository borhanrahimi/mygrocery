import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./ProfilePage.css";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_API_URL;

  const [activeTab, setActiveTab] = useState("profile");
  const [data, setData] = useState(null);
  const [formData, setFormData] = useState(null);

  const [editProfile, setEditProfile] = useState(false);
  const [editAddress, setEditAddress] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [successProfile, setSuccessProfile] = useState(false);
  const [successAddress, setSuccessAddress] = useState(false);

  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/api/auth/profile/${user}`)
        .then((res) => res.json())
        .then((res) => {
          const rawPhone = res.phone || "";
          setData(res);
          setFormData({
            firstName: res.firstName || "",
            lastName: res.lastName || "",
            phone: formatPhoneNumber(rawPhone),
            email: res.email || "",
            password: "",
            address:
              typeof res.address === "object"
                ? {
                    street: res.address.street || "",
                    city: res.address.city || "",
                    state: res.address.state || "",
                    zip: res.address.zip || "",
                  }
                : {
                    street: res.address || "",
                    city: "",
                    state: "",
                    zip: "",
                  },
          });
        })
        .catch((err) => {
          console.error("❌ Failed to load profile:", err);
        });
    }
  }, [user, API_URL]);

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7)
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(
      6,
      8
    )}-${digits.slice(8)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["street", "city", "state", "zip"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else if (name === "phone") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, phone: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    const rawPhone = formData.phone.replace(/\D/g, "");
    if (rawPhone.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    } else {
      setPhoneError("");
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${user}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: rawPhone,
          address: data.address, // prevent overwriting address
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Profile update failed:", errorText);
        return;
      }

      const updated = await res.json();
      setData({
        ...updated.user,
        phone: formatPhoneNumber(updated.user.phone),
      });
      setEditProfile(false);
      setSuccessProfile(true);
      setTimeout(() => setSuccessProfile(false), 2000);
    } catch (err) {
      console.error("❌ Save error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async () => {
    setSavingAddress(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${user}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          address: formData.address,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Address update failed:", errorText);
        return;
      }

      const updated = await res.json();
      setData(updated.user);
      setEditAddress(false);
      setSuccessAddress(true);
      setTimeout(() => setSuccessAddress(false), 2000);
    } catch (err) {
      console.error("❌ Save error:", err);
    } finally {
      setSavingAddress(false);
    }
  };

  if (!user || !data || !formData) return <p>Loading...</p>;

  const address = formData.address;

  return (
    <div className="page-container">
      <aside className="sidebar">
        <div className="sidebar-title">Account</div>
        <ul className="category-list">
          <li
            className={`category-item ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </li>
          <li
            className={`category-item ${
              activeTab === "payment" ? "active" : ""
            }`}
            onClick={() => setActiveTab("payment")}
          >
            Payment
          </li>
        </ul>
      </aside>

      <main className="main-content">
        {activeTab === "profile" && (
          <>
            <div className="card">
              <div className="card-header">
                <h3>Personal Information</h3>
                {editProfile ? (
                  <span className="edit-link" onClick={handleSaveProfile}>
                    {savingProfile ? "Saving..." : "Save"}
                  </span>
                ) : (
                  <span
                    className="edit-link"
                    onClick={() => setEditProfile(true)}
                  >
                    edit &gt;
                  </span>
                )}
              </div>
              {editProfile ? (
                <div className="card-body grid-5">
                  <div>
                    <b>Name</b>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <b>Last Name</b>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <b>Phone</b>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={17}
                    />
                    {phoneError && (
                      <div style={{ color: "red", fontSize: "12px" }}>
                        {phoneError}
                      </div>
                    )}
                  </div>
                  <div>
                    <b>Email</b>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <b>Password</b>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep"
                    />
                  </div>
                </div>
              ) : (
                <div className="card-body grid-5">
                  <div>
                    <b>Name</b>
                    <div>{data.firstName}</div>
                  </div>
                  <div>
                    <b>Last Name</b>
                    <div>{data.lastName}</div>
                  </div>
                  <div>
                    <b>Phone</b>
                    <div>{formatPhoneNumber(data.phone)}</div>
                  </div>
                  <div>
                    <b>Email</b>
                    <div>{data.email}</div>
                  </div>
                  <div>
                    <b>Password</b>
                    <div>•••••</div>
                  </div>
                </div>
              )}
              {successProfile && (
                <p style={{ color: "green", marginTop: "1rem" }}>
                  ✅ Profile updated!
                </p>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Address</h3>
                {editAddress ? (
                  <span className="edit-link" onClick={handleSaveAddress}>
                    {savingAddress ? "Saving..." : "Save"}
                  </span>
                ) : (
                  <span
                    className="edit-link"
                    onClick={() => setEditAddress(true)}
                  >
                    edit &gt;
                  </span>
                )}
              </div>
              {editAddress ? (
                <div className="card-body grid-4">
                  <div>
                    <b>Street</b>
                    <input
                      name="street"
                      value={address.street}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <b>Zip Code</b>
                    <input
                      name="zip"
                      value={address.zip}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <b>State</b>
                    <input
                      name="state"
                      value={address.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <b>City</b>
                    <input
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="card-body grid-4">
                  <div>
                    <b>Street</b>
                    <div>{data.address?.street || data.address}</div>
                  </div>
                  <div>
                    <b>Zip Code</b>
                    <div>{data.address?.zip || ""}</div>
                  </div>
                  <div>
                    <b>State</b>
                    <div>{data.address?.state || ""}</div>
                  </div>
                  <div>
                    <b>City</b>
                    <div>{data.address?.city || ""}</div>
                  </div>
                </div>
              )}
              {successAddress && (
                <p style={{ color: "green", marginTop: "1rem" }}>
                  ✅ Address updated!
                </p>
              )}
            </div>
          </>
        )}

        {activeTab === "payment" && (
          <div className="card">
            <div className="card-header">
              <h3>Payment Info</h3>
            </div>
            <div className="card-body">
              <p>This is a placeholder for your future payment method integration.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProfilePage;
