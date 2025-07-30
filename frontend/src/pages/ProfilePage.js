import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./ProfilePage.css";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_API_URL;

  const [activeTab, setActiveTab] = useState("profile");
  const [data, setData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/api/auth/profile/${user}`)
        .then((res) => res.json())
        .then((res) => {
          setData(res);
          setFormData({
            firstName: res.firstName || "",
            lastName: res.lastName || "",
            phone: res.phone || "",
            email: res.email || "",
            password: "",
            address: typeof res.address === "object"
              ? {
                  street: res.address.street || "",
                  city: res.address.city || "",
                  state: res.address.state || "",
                  zip: res.address.zip || ""
                }
              : {
                  street: res.address || "",
                  city: "",
                  state: "",
                  zip: ""
                }
          });
        })
        .catch((err) => {
          console.error("❌ Failed to load profile:", err);
        });
    }
  }, [user, API_URL]);

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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${user}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setData(updated.user);
      setEditMode(false);
      alert("✅ Changes saved!");
    } catch (err) {
      console.error("❌ Save error:", err);
      alert("❌ Failed to save changes");
    } finally {
      setSaving(false);
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
            className={`category-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </li>
          <li
            className={`category-item ${activeTab === "payment" ? "active" : ""}`}
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
                {editMode ? (
                  <span className="edit-link" onClick={handleSave}>
                    {saving ? "Saving..." : "Save"}
                  </span>
                ) : (
                  <span className="edit-link" onClick={() => setEditMode(true)}>
                    edit &gt;
                  </span>
                )}
              </div>
              {editMode ? (
                <div className="card-body grid-5">
                  <div><b>Name</b><input name="firstName" value={formData.firstName} onChange={handleChange} /></div>
                  <div><b>Last Name</b><input name="lastName" value={formData.lastName} onChange={handleChange} /></div>
                  <div><b>Phone</b><input name="phone" value={formData.phone} onChange={handleChange} /></div>
                  <div><b>Email</b><input name="email" value={formData.email} onChange={handleChange} /></div>
                  <div><b>Password</b><input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep" /></div>
                </div>
              ) : (
                <div className="card-body grid-5">
                  <div><b>Name</b><div>{data.firstName}</div></div>
                  <div><b>Last Name</b><div>{data.lastName}</div></div>
                  <div><b>Phone</b><div>{data.phone}</div></div>
                  <div><b>Email</b><div>{data.email}</div></div>
                  <div><b>Password</b><div>•••••</div></div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Address</h3>
                {editMode && (
                  <span className="edit-link" onClick={handleSave}>
                    {saving ? "Saving..." : "Save"}
                  </span>
                )}
              </div>
              {editMode ? (
                <div className="card-body grid-4">
                  <div><b>Street</b><input name="street" value={address.street} onChange={handleChange} /></div>
                  <div><b>Zip Code</b><input name="zip" value={address.zip} onChange={handleChange} /></div>
                  <div><b>State</b><input name="state" value={address.state} onChange={handleChange} /></div>
                  <div><b>City</b><input name="city" value={address.city} onChange={handleChange} /></div>
                </div>
              ) : (
                <div className="card-body grid-4">
                  <div><b>Street</b><div>{data.address?.street || data.address}</div></div>
                  <div><b>Zip Code</b><div>{data.address?.zip || ""}</div></div>
                  <div><b>State</b><div>{data.address?.state || ""}</div></div>
                  <div><b>City</b><div>{data.address?.city || ""}</div></div>
                </div>
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
