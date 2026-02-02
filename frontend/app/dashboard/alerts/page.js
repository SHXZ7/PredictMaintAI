"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar"

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [useMockData, setUseMockData] = useState(false)

  // Mock data for demonstration when no real alerts exist
  const mockAlerts = [
    {
      _id: "mock1",
      machine_id: "PUMP_01",
      severity: "CRITICAL",
      message: "Failure predicted within 8 hours - Immediate action required",
      predicted_hours: 8,
      confidence: 0.85,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      acknowledged: false
    },
    {
      _id: "mock2",
      machine_id: "MOTOR_02",
      severity: "CRITICAL",
      message: "Failure predicted within 12 hours - High anomaly detected",
      predicted_hours: 12,
      confidence: 0.82,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      acknowledged: false
    },
    {
      _id: "mock3",
      machine_id: "HVAC_01",
      severity: "WARNING",
      message: "Failure predicted within 24 hours - Temperature anomaly",
      predicted_hours: 24,
      confidence: 0.72,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      acknowledged: false
    },
    {
      _id: "mock4",
      machine_id: "COMPRESSOR_01",
      severity: "WARNING",
      message: "Failure predicted within 36 hours - Elevated vibration levels",
      predicted_hours: 36,
      confidence: 0.68,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      acknowledged: false
    },
    {
      _id: "mock5",
      machine_id: "BEARING_01",
      severity: "WARNING",
      message: "Failure predicted within 48 hours - Wear indicators rising",
      predicted_hours: 48,
      confidence: 0.65,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      acknowledged: false
    },
    {
      _id: "mock6",
      machine_id: "PUMP_02",
      severity: "CRITICAL",
      message: "Alert acknowledged - Maintenance scheduled",
      predicted_hours: 15,
      confidence: 0.78,
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      acknowledged: true,
      acknowledged_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() // 10 hours ago
    }
  ]

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/alerts")
      const data = await res.json()
      
      // Use mock data if no real alerts
      if (!data || data.length === 0) {
        console.log("No alerts from backend, using mock data for demo")
        setAlerts(mockAlerts)
        setUseMockData(true)
      } else {
        setAlerts(data)
        setUseMockData(false)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
      // Use mock data on error
      setAlerts(mockAlerts)
      setUseMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = async (alertId) => {
    // If using mock data, just update locally
    if (useMockData) {
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === alertId 
            ? { ...alert, acknowledged: true, acknowledged_at: new Date().toISOString() }
            : alert
        )
      )
      return
    }

    try {
      console.log("Acknowledging alert:", alertId)
      
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === alertId 
            ? { ...alert, acknowledged: true, acknowledging: false }
            : alert
        )
      )
      
      const res = await fetch(`http://localhost:8000/api/alerts/${alertId}/ack`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
      
      const data = await res.json()
      console.log("Acknowledge response:", data)
      
      if (res.ok) {
        await fetchAlerts()
      } else {
        console.error("Failed to acknowledge:", data)
        alert("Failed to acknowledge alert: " + (data.detail || "Unknown error"))
        await fetchAlerts()
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error)
      alert("Error acknowledging alert. Please try again.")
      await fetchAlerts()
    }
  }

  const handleAcknowledge = (alertId) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert._id === alertId 
          ? { ...alert, acknowledging: true }
          : alert
      )
    )
    acknowledgeAlert(alertId)
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return "#ef4444"
      case "WARNING":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const getSeverityEmoji = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return "🔴"
      case "WARNING":
        return "🟡"
      default:
        return "⚪"
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "all") return true
    if (filter === "critical") return alert.severity === "CRITICAL"
    if (filter === "warning") return alert.severity === "WARNING"
    if (filter === "unacknowledged") return !alert.acknowledged
    return true
  })

  const criticalCount = alerts.filter(a => a.severity === "CRITICAL" && !a.acknowledged).length
  const warningCount = alerts.filter(a => a.severity === "WARNING" && !a.acknowledged).length

  return (
    <>
      <Navbar />
      <div style={{ padding: "30px", paddingTop: "80px", color: "#fff", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "15px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>Alerts & Notifications</h1>
          <p style={{ color: "#aaa", marginBottom: "0" }}>
            Predictive maintenance alerts and system warnings
            {useMockData && (
              <span style={{ 
                marginLeft: "10px", 
                padding: "4px 12px", 
                background: "rgba(59, 130, 246, 0.2)", 
                borderRadius: "12px",
                fontSize: "12px",
                color: "#60a5fa"
              }}>
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
          <button
            onClick={fetchAlerts}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "#3b82f6",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "20px"
        }}>
          <div style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Total Alerts</p>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>{alerts.length}</p>
          </div>

          <div style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "8px",
            border: "2px solid #ef4444"
          }}>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>🔴 Critical</p>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#ef4444" }}>{criticalCount}</p>
          </div>

          <div style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "8px",
            border: "2px solid #f59e0b"
          }}>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>🟡 Warning</p>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b" }}>{warningCount}</p>
          </div>

          <div style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Acknowledged</p>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#4ade80" }}>
              {alerts.filter(a => a.acknowledged).length}
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          {["all", "critical", "warning", "unacknowledged"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                background: filter === f ? "#3b82f6" : "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#fff",
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #334155"
        }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Active Alerts</h2>

          {loading ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>
              Loading alerts...
            </p>
          ) : filteredAlerts.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>
              ✅ No alerts to display
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {filteredAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#0f172a",
                    padding: "20px",
                    borderRadius: "8px",
                    border: `2px solid ${getSeverityColor(alert.severity)}`,
                    opacity: alert.acknowledged ? 0.6 : 1
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          background: getSeverityColor(alert.severity),
                          color: "#000",
                          fontWeight: "bold",
                          fontSize: "12px"
                        }}>
                          {getSeverityEmoji(alert.severity)} {alert.severity}
                        </span>
                        <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                          {alert.machine_id}
                        </span>
                      </div>

                      <p style={{ fontSize: "16px", marginBottom: "12px", color: "#e2e8f0" }}>
                        {alert.message}
                      </p>

                      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "14px", color: "#94a3b8" }}>
                        <span>⏱️ {alert.predicted_hours}h to failure</span>
                        <span>📊 Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                        <span>🕐 {getTimeAgo(alert.created_at)}</span>
                      </div>
                    </div>

                    <div>
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledge(alert._id)}
                          disabled={alert.acknowledging}
                          style={{
                            padding: "10px 20px",
                            background: alert.acknowledging ? "#94a3b8" : "#4ade80",
                            border: "none",
                            borderRadius: "6px",
                            color: "#000",
                            fontWeight: "bold",
                            cursor: alert.acknowledging ? "not-allowed" : "pointer",
                            opacity: alert.acknowledging ? 0.7 : 1
                          }}
                        >
                          {alert.acknowledging ? "⏳ Processing..." : "✓ Acknowledge"}
                        </button>
                      ) : (
                        <span style={{
                          padding: "10px 20px",
                          background: "#334155",
                          borderRadius: "6px",
                          color: "#94a3b8",
                          fontSize: "14px"
                        }}>
                          ✓ Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
