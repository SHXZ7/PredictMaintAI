"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function LivePage() {
  const router = useRouter()
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) router.push("/login")
  }, [router])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/history")
        const data = await res.json()
        console.log("Fetched history data:", data.slice(-3)) // Debug log
        setHistory(data)
        setLastUpdate(new Date())

        const statusRes = await fetch("http://localhost:8000/api/history/status")
        const statusData = await statusRes.json()
        setStatus(statusData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchHistory()
    const interval = setInterval(fetchHistory, 5000)

    return () => clearInterval(interval)
  }, [])

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return "N/A"
    const seconds = Math.floor((new Date() - lastUpdate) / 1000)
    return `${seconds} seconds ago`
  }

  const latestData = history[history.length - 1] || {}
  const currentStatus = latestData.status || "UNKNOWN"
  
  // Convert health to percentage if it's between 0-1
  let currentHealth = parseFloat(latestData.health) || 0
  if (currentHealth <= 1 && currentHealth > 0) {
    currentHealth = currentHealth * 100
  }
  
  const currentAnomaly = parseFloat(latestData.anomaly_score) || 0

  const getStatusColor = () => {
    switch (currentStatus) {
      case "NORMAL": return "#4ade80"
      case "WARNING": return "#fbbf24"
      case "CRITICAL": return "#ef4444"
      default: return "#6b7280"
    }
  }

  const getStatusEmoji = () => {
    switch (currentStatus) {
      case "NORMAL": return "🟢"
      case "WARNING": return "🟠"
      case "CRITICAL": return "🔴"
      default: return "⚪"
    }
  }

  // Prepare chart data (last 50 points for readability)
  const chartData = history.slice(-50).map((row, idx) => {
    let health = parseFloat(row.health) || 0
    // Convert to percentage if needed
    if (health <= 1 && health > 0) {
      health = health * 100
    }
    
    return {
      time: row.timestamp?.split(" ")[1]?.substring(0, 8) || `T${idx}`,
      health: health
    }
  })

  return (
    <>
      <Navbar />

      <div style={{ padding: "40px", color: "#fff", maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>Live Monitoring</h1>
        <p style={{ color: "#aaa", marginBottom: "30px" }}>Real-time equipment monitoring dashboard</p>

        {/* A. TOP SUMMARY CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px"
        }}>
          <div style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Machine Status</p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: getStatusColor() }}>
              {getStatusEmoji()} {currentStatus}
            </p>
          </div>

          <div style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Health Score</p>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>
              {currentHealth.toFixed(1)}%
            </p>
          </div>

          <div style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Anomaly Score</p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: currentAnomaly > 0.5 ? "#ef4444" : "#4ade80" }}>
              {currentAnomaly.toFixed(3)}
            </p>
          </div>

          <div style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Last Update</p>
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
              {getTimeSinceUpdate()}
            </p>
          </div>
        </div>

        {/* B. LIVE LINE CHART */}
        <div style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #334155",
          marginBottom: "40px"
        }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Health Score Trend</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#94a3b8" 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value) => [`${value.toFixed(1)}%`, "Health"]}
                />
                <Line
                  type="monotone"
                  dataKey="health"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>
              Loading chart data...
            </p>
          )}
        </div>

        {/* C. STATUS INDICATOR */}
        <div style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #334155",
          marginBottom: "40px",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>System Status</h2>
          <div style={{
            display: "inline-block",
            padding: "20px 60px",
            borderRadius: "50px",
            background: getStatusColor(),
            fontSize: "32px",
            fontWeight: "bold",
            color: "#000"
          }}>
            {getStatusEmoji()} {currentStatus}
          </div>
          {status?.escalation && (
            <p style={{ color: "#ef4444", marginTop: "20px", fontSize: "18px" }}>
              ⚠️ Escalation triggered due to sustained warnings
            </p>
          )}
        </div>

        {/* D. RAW DATA TABLE (DEBUG VIEW) */}
        <div style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #334155"
        }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Live Sensor Feed (Debug View)</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #334155" }}>
                  <th style={{ padding: "12px", textAlign: "left", color: "#94a3b8" }}>Time</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "#94a3b8" }}>Health</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "#94a3b8" }}>Anomaly Score</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "#94a3b8" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-10).reverse().map((row, idx) => {
                  let health = parseFloat(row.health) || 0
                  if (health <= 1 && health > 0) {
                    health = health * 100
                  }
                  
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid #334155" }}>
                      <td style={{ padding: "12px" }}>{row.timestamp}</td>
                      <td style={{ padding: "12px" }}>{health.toFixed(1)}%</td>
                      <td style={{ padding: "12px", color: row.anomaly_score > 0.5 ? "#ef4444" : "#4ade80" }}>
                        {parseFloat(row.anomaly_score).toFixed(3)}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          background: row.status === "NORMAL" ? "#4ade8033" :
                                     row.status === "WARNING" ? "#fbbf2433" : "#ef444433",
                          color: row.status === "NORMAL" ? "#4ade80" :
                                 row.status === "WARNING" ? "#fbbf24" : "#ef4444"
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}