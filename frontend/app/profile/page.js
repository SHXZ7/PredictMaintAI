"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"
import ProButton from "../components/ProButton"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: ""
  })

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    } else {
      // Load user data (mock for now)
      const userData = {
        name: "John Doe",
        email: "john.doe@company.com",
        role: "Maintenance Engineer",
        department: "Operations",
        joinedDate: "January 2024",
        lastLogin: new Date().toLocaleString()
      }
      setUser(userData)
      setFormData({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department
      })
    }
  }, [router])

  const handleSave = () => {
    // Save updated profile data
    setUser({ ...user, ...formData })
    setIsEditing(false)
    alert("Profile updated successfully!")
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#fff" }}>Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <ProButton />
      <div style={{
        minHeight: "100vh",
        background: "#0a0e17",
        paddingTop: "100px",
        padding: "100px 2rem 2rem"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Header */}
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#fff", marginBottom: "10px" }}>
            Profile
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
            Manage your account information
          </p>

          {/* Profile Card */}
          <div style={{
            background: "rgba(21, 27, 43, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "2rem"
          }}>
            {/* Avatar Section */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", paddingBottom: "30px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px"
              }}>
                👤
              </div>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "5px" }}>
                  {user.name}
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>{user.role}</p>
              </div>
            </div>

            {/* Profile Details */}
            {isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
                    Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                  <button
                    onClick={handleSave}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#10b981",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#334155",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "10px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>Email:</span>
                  <span style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>{user.email}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "10px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>Department:</span>
                  <span style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>{user.department}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "10px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>Joined:</span>
                  <span style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>{user.joinedDate}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "10px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>Last Login:</span>
                  <span style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>{user.lastLogin}</span>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    marginTop: "10px",
                    padding: "12px",
                    background: "#3b82f6",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
