"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar"
import { LineChart, Line, ResponsiveContainer } from "recharts"

export default function HealthPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [machineHistory, setMachineHistory] = useState({})

  // AI Chat State
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [selectedMachineForChat, setSelectedMachineForChat] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    fetchHealthData()
    const interval = setInterval(fetchHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchHealthData = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/health")
      const result = await res.json()
      setData(result)
      
      // Fetch mini trend history for each machine
      if (result.machines) {
        fetchMachineHistories(result.machines)
      }
    } catch (error) {
      console.error("Error fetching health data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMachineHistories = async (machines) => {
    const histories = {}
    
    for (const machine of machines) {
      try {
        const res = await fetch(
          `http://localhost:8000/api/trends?machine_id=${machine.machine_id}&hours=6`
        )
        const trendData = await res.json()
        
        // Transform data for chart
        histories[machine.machine_id] = trendData.slice(-20).map((point, idx) => {
          let health = parseFloat(point.health) || 0
          if (health <= 1 && health > 0) {
            health = health * 100
          }
          return {
            index: idx,
            health: health
          }
        })
      } catch (error) {
        console.error(`Error fetching history for ${machine.machine_id}:`, error)
        histories[machine.machine_id] = []
      }
    }
    
    setMachineHistory(histories)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "CRITICAL":
        return { border: "#ef4444", bg: "#991b1b", text: "#fca5a5" }
      case "WARNING":
        return { border: "#f59e0b", bg: "#92400e", text: "#fcd34d" }
      case "HEALTHY":
        return { border: "#4ade80", bg: "#14532d", text: "#86efac" }
      default:
        return { border: "#6b7280", bg: "#374151", text: "#9ca3af" }
    }
  }

  const getTrendIcon = (trend) => {
    if (trend > 2) return "📈"
    if (trend < -2) return "📉"
    return "➡️"
  }

  const askAI = async () => {
    if (!chatInput.trim()) return

    setChatLoading(true)
    const userMessage = chatInput
    setChatInput("")

    // Add user question to messages
    const newMessages = [...chatMessages, { q: userMessage, a: null, loading: true }]
    setChatMessages(newMessages)

    try {
      // Build request body - only include machine_id if selected
      const requestBody = {
        message: userMessage
      }
      
      // Only add machine_id if a specific machine is selected
      if (selectedMachineForChat) {
        requestBody.machine_id = selectedMachineForChat
      }

      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("API Error:", errorData)
        throw new Error(`API returned ${res.status}: ${errorData.detail || 'Unknown error'}`)
      }

      const result = await res.json()

      setChatMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          q: userMessage,
          a: result.response,
          loading: false,
          model: result.model_used,
          context: result.context_used
        }
        return updated
      })

    } catch (err) {
      console.error("Chat error:", err)
      setChatMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          q: userMessage,
          a: "Sorry, I couldn't process your question. " + err.message,
          loading: false,
          error: true
        }
        return updated
      })
    } finally {
      setChatLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      askAI()
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#fff"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "50px",
              height: "50px",
              border: "4px solid #334155",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }}></div>
            <p>Loading health data...</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "40px", textAlign: "center", color: "#fff" }}>
          <p>Unable to load health data</p>
        </div>
      </>
    )
  }

  const suggestedQuestions = [
    "Which machines need immediate attention?",
    "What is the overall fleet health?",
    "Show me all critical alerts",
    "What maintenance should I schedule?"
  ]

  return (
    <>
      <Navbar />
      <div style={{ padding: "30px", paddingTop: "80px", color: "#fff", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>Fleet Health Monitor</h1>
          <p style={{ color: "#aaa" }}>Real-time equipment health scores and metrics</p>
        </div>

        {/* Fleet Summary */}
        <div style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #334155",
          marginBottom: "30px"
        }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Fleet Overview</h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px"
          }}>
            {/* Fleet Health */}
            <div style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "6px",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>Fleet Health</p>
              <p style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: data.fleet_health > 70 ? "#4ade80" : data.fleet_health > 50 ? "#fbbf24" : "#ef4444"
              }}>
                {data.fleet_health}%
              </p>
            </div>

            {/* Total Machines */}
            <div style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "6px",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>Total Machines</p>
              <p style={{ fontSize: "32px", fontWeight: "bold" }}>{data.total_machines}</p>
            </div>

            {/* Critical */}
            <div style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "6px",
              textAlign: "center",
              border: data.critical_machines > 0 ? "2px solid #ef4444" : "none"
            }}>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>🔴 Critical</p>
              <p style={{ fontSize: "32px", fontWeight: "bold", color: "#ef4444" }}>
                {data.critical_machines}
              </p>
            </div>

            {/* Warning */}
            <div style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "6px",
              textAlign: "center",
              border: data.warning_machines > 0 ? "2px solid #f59e0b" : "none"
            }}>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>🟡 Warning</p>
              <p style={{ fontSize: "32px", fontWeight: "bold", color: "#f59e0b" }}>
                {data.warning_machines}
              </p>
            </div>

            {/* Healthy */}
            <div style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "6px",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>✅ Healthy</p>
              <p style={{ fontSize: "32px", fontWeight: "bold", color: "#4ade80" }}>
                {data.healthy_machines}
              </p>
            </div>

            {/* Alerts */}
            <div style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "6px",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>Active Alerts</p>
              <p style={{ fontSize: "32px", fontWeight: "bold", color: "#fbbf24" }}>
                {data.total_unacknowledged_alerts}
              </p>
            </div>
          </div>
        </div>

        {/* Individual Machines */}
        <div>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Machine Status</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px"
          }}>
            {data.machines.map(machine => {
              const colors = getStatusColor(machine.status)
              const history = machineHistory[machine.machine_id] || []
              
              return (
                <div
                  key={machine.machine_id}
                  style={{
                    background: "#1e293b",
                    padding: "25px",
                    borderRadius: "8px",
                    border: `2px solid ${colors.border}`,
                    position: "relative"
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    background: colors.bg,
                    color: colors.text,
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    {machine.status}
                  </div>

                  {/* Machine ID */}
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginBottom: "15px",
                    paddingRight: "80px"
                  }}>
                    {machine.machine_id}
                  </h3>

                  {/* Health Score */}
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px"
                    }}>
                      <span style={{ fontSize: "14px", color: "#94a3b8" }}>Health Score</span>
                      <span style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: machine.health_score > 70 ? "#4ade80" : machine.health_score > 50 ? "#fbbf24" : "#ef4444"
                      }}>
                        {machine.health_score}%
                      </span>
                    </div>
                    <div style={{
                      height: "8px",
                      background: "#0f172a",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${machine.health_score}%`,
                        background: machine.health_score > 70 ? "#4ade80" : machine.health_score > 50 ? "#fbbf24" : "#ef4444",
                        transition: "width 0.3s ease"
                      }}></div>
                    </div>
                  </div>

                  {/* 📊 HEALTH TREND MINI CHART */}
                  {history.length > 0 && (
                    <div style={{
                      background: "#0f172a",
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "15px"
                    }}>
                      <p style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginBottom: "8px"
                      }}>
                        Last 6 Hours Trend
                      </p>
                      <ResponsiveContainer width="100%" height={80}>
                        <LineChart data={history}>
                          <Line
                            type="monotone"
                            dataKey="health"
                            stroke={machine.health_score > 70 ? "#4ade80" : machine.health_score > 50 ? "#fbbf24" : "#ef4444"}
                            strokeWidth={2}
                            dot={false}
                            animationDuration={300}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Metrics Grid */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    fontSize: "14px",
                    marginBottom: "15px"
                  }}>
                    <div>
                      <span style={{ color: "#94a3b8" }}>Trend:</span>
                      <span style={{ marginLeft: "5px", fontWeight: "500" }}>
                        {getTrendIcon(machine.health_trend)} {machine.health_trend > 0 ? "+" : ""}{machine.health_trend}%
                      </span>
                    </div>

                    <div>
                      <span style={{ color: "#94a3b8" }}>Anomaly:</span>
                      <span style={{ marginLeft: "5px", fontWeight: "500" }}>
                        {machine.anomaly_rate.toFixed(1)}%
                      </span>
                    </div>

                    <div>
                      <span style={{ color: "#94a3b8" }}>Alerts:</span>
                      <span style={{
                        marginLeft: "5px",
                        fontWeight: "500",
                        color: machine.unacknowledged_alerts > 0 ? "#fbbf24" : "inherit"
                      }}>
                        {machine.unacknowledged_alerts}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: "#94a3b8" }}>Data:</span>
                      <span style={{ marginLeft: "5px", fontWeight: "500" }}>
                        {machine.data_points} pts
                      </span>
                    </div>
                  </div>

                  {/* 🤖 AI HEALTH EXPLANATION */}
                  {machine.explanation && (
                    <div style={{
                      background: "#0f172a",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "15px",
                      borderLeft: "3px solid #3b82f6"
                    }}>
                      <p style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginBottom: "6px",
                        fontWeight: "600"
                      }}>
                        🤖 AI Analysis
                      </p>
                      <p style={{
                        fontSize: "13px",
                        lineHeight: "1.6",
                        color: "#cbd5e1"
                      }}>
                        {machine.explanation}
                      </p>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div style={{
                    marginTop: "15px",
                    paddingTop: "15px",
                    borderTop: "1px solid #334155",
                    fontSize: "12px",
                    color: "#64748b"
                  }}>
                    Updated: {machine.last_updated ? new Date(machine.last_updated).toLocaleTimeString() : "N/A"}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 🤖 SINGLE UNIFIED AI CHAT - FLEET WIDE */}
        <div style={{
          marginTop: "40px",
          background: "#1e293b",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #334155"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px"
          }}>
            <div>
              <h2 style={{ fontSize: "20px", marginBottom: "5px" }}>🤖 AI Maintenance Engineer</h2>
              <p style={{ fontSize: "14px", color: "#94a3b8" }}>
                Ask questions about any machine or the entire fleet
              </p>
            </div>
            {chatMessages.length > 0 && (
              <button
                onClick={() => {
                  setChatMessages([])
                  setSelectedMachineForChat(null)
                }}
                style={{
                  padding: "8px 16px",
                  background: "#334155",
                  border: "1px solid #475569",
                  borderRadius: "6px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Clear Chat
              </button>
            )}
          </div>

          {/* Machine Selector */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px", display: "block" }}>
              Focus on specific machine (optional):
            </label>
            <select
              value={selectedMachineForChat || ""}
              onChange={(e) => setSelectedMachineForChat(e.target.value || null)}
              style={{
                padding: "10px",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "14px",
                width: "300px"
              }}
            >
              <option value="">All Machines (Fleet-wide)</option>
              {data.machines.map(machine => (
                <option key={machine.machine_id} value={machine.machine_id}>
                  {machine.machine_id} - {machine.status} ({machine.health_score}%)
                </option>
              ))}
            </select>
          </div>

          {/* Suggested Questions */}
          {chatMessages.length === 0 && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>
                Try asking:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setChatInput(q)}
                    style={{
                      padding: "8px 16px",
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "16px",
                      fontSize: "13px",
                      color: "#94a3b8",
                      cursor: "pointer"
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div style={{
            maxHeight: "400px",
            overflowY: "auto",
            marginBottom: "20px",
            background: "#0f172a",
            padding: "20px",
            borderRadius: "8px"
          }}>
            {chatMessages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <p style={{ fontSize: "48px", marginBottom: "10px" }}>🤖</p>
                <p>Ask me anything about your machines or fleet health!</p>
              </div>
            ) : (
              chatMessages.map((m, i) => (
                <div key={i} style={{ marginBottom: "20px" }}>
                  {/* User Question */}
                  <div style={{
                    background: "#1e3a8a",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "8px"
                  }}>
                    <p style={{ fontSize: "14px", color: "#93c5fd", margin: 0 }}>
                      <strong>You:</strong> {m.q}
                    </p>
                  </div>

                  {/* AI Answer */}
                  {m.loading ? (
                    <div style={{
                      background: "#1e293b",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      color: "#94a3b8"
                    }}>
                      <p style={{ fontSize: "14px", margin: 0 }}>
                        <strong>AI Engineer:</strong> Analyzing data...
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      background: m.error ? "#7f1d1d" : "#1e293b",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      borderLeft: `4px solid ${m.error ? "#ef4444" : "#3b82f6"}`
                    }}>
                      <p style={{
                        fontSize: "14px",
                        color: "#e2e8f0",
                        margin: 0,
                        whiteSpace: "pre-line",
                        lineHeight: "1.8"
                      }}>
                        <strong>AI Engineer:</strong> {m.a}
                      </p>
                      {m.model && (
                        <p style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginTop: "8px",
                          marginBottom: 0
                        }}>
                          📊 {m.context} • 🤖 {m.model}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={chatLoading}
              style={{
                flex: 1,
                background: "#0f172a",
                border: "1px solid #334155",
                padding: "14px 16px",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                outline: "none"
              }}
              placeholder={
                selectedMachineForChat 
                  ? `Ask about ${selectedMachineForChat}...` 
                  : "Ask about any machine or the fleet..."
              }
            />
            <button
              onClick={askAI}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                padding: "14px 30px",
                background: chatLoading || !chatInput.trim() ? "#334155" : "#3b82f6",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer"
              }}
            >
              {chatLoading ? "⏳ Thinking..." : "Ask AI"}
            </button>
          </div>
        </div>

      </div>
    </>
  )
}
