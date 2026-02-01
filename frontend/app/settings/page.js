"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"
import ProButton from "../components/ProButton"

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    alertThreshold: "medium",
    autoRefresh: true,
    theme: "dark"
  })

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleSave = () => {
    // Save settings
    localStorage.setItem("userSettings", JSON.stringify(settings))
    alert("Settings saved successfully!")
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
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#fff", marginBottom: "10px" }}>
            Settings
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
            Customize your application preferences
          </p>

          {/* Notifications */}
          <div style={{
            background: "rgba(21, 27, 43, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "20px"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "20px" }}>
              Notifications
            </h2>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <p style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>Email Notifications</p>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>Receive alerts and updates via email</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.emailNotifications ? "#10b981" : "#334155",
                  borderRadius: "24px",
                  transition: "0.3s"
                }}></span>
                <span style={{
                  position: "absolute",
                  content: "",
                  height: "18px",
                  width: "18px",
                  left: settings.emailNotifications ? "29px" : "3px",
                  bottom: "3px",
                  background: "white",
                  borderRadius: "50%",
                  transition: "0.3s"
                }}></span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>Push Notifications</p>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>Receive browser push notifications</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.pushNotifications ? "#10b981" : "#334155",
                  borderRadius: "24px",
                  transition: "0.3s"
                }}></span>
                <span style={{
                  position: "absolute",
                  content: "",
                  height: "18px",
                  width: "18px",
                  left: settings.pushNotifications ? "29px" : "3px",
                  bottom: "3px",
                  background: "white",
                  borderRadius: "50%",
                  transition: "0.3s"
                }}></span>
              </label>
            </div>
          </div>

          {/* Alert Settings */}
          <div style={{
            background: "rgba(21, 27, 43, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "20px"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "20px" }}>
              Alert Preferences
            </h2>

            <div>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
                Alert Threshold
              </label>
              <select
                value={settings.alertThreshold}
                onChange={(e) => setSettings({ ...settings, alertThreshold: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px"
                }}
              >
                <option value="low">Low - All alerts</option>
                <option value="medium">Medium - Important alerts only</option>
                <option value="high">High - Critical alerts only</option>
              </select>
            </div>
          </div>

          {/* Display Settings */}
          <div style={{
            background: "rgba(21, 27, 43, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "20px"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "20px" }}>
              Display
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>Auto Refresh</p>
                  <p style={{ color: "#94a3b8", fontSize: "12px" }}>Automatically refresh data every 30 seconds</p>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings.autoRefresh ? "#10b981" : "#334155",
                    borderRadius: "24px",
                    transition: "0.3s"
                  }}></span>
                  <span style={{
                    position: "absolute",
                    content: "",
                    height: "18px",
                    width: "18px",
                    left: settings.autoRefresh ? "29px" : "3px",
                    bottom: "3px",
                    background: "white",
                    borderRadius: "50%",
                    transition: "0.3s"
                  }}></span>
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px"
                }}
              >
                <option value="dark">Dark</option>
                <option value="light">Light (Coming Soon)</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              padding: "14px",
              background: "#10b981",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  )
}
