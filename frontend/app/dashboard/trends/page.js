"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from "recharts"

export default function TrendsPage() {
  const router = useRouter()
  const [machines, setMachines] = useState([])
  const [selectedMachine, setSelectedMachine] = useState("")
  const [selectedMetric, setSelectedMetric] = useState("health")
  const [selectedHours, setSelectedHours] = useState(24)
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [timeSinceUpdate, setTimeSinceUpdate] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  // Fetch available machines
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/machines")
        const data = await res.json()
        setMachines(data)
        if (data.length > 0) {
          setSelectedMachine(data[0])
        }
      } catch (error) {
        console.error("Error fetching machines:", error)
      }
    }
    fetchMachines()
  }, [])

  // Fetch trend data when filters change
  useEffect(() => {
    if (!selectedMachine) return

    const fetchTrends = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `http://localhost:8000/api/trends?machine_id=${selectedMachine}&hours=${selectedHours}`
        )
        const data = await res.json()
        console.log("Trend data:", data.slice(-5))
        setTrendData(data)
        
        // Generate AI interpretation after data loads
        if (data.length > 0) {
          await generateAIInterpretation(data)
        }
      } catch (error) {
        console.error("Error fetching trends:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [selectedMachine, selectedHours])

  // Generate AI interpretation
  const generateAIInterpretation = async (data) => {
    if (data.length === 0) return

    setAiLoading(true)
    try {
      // Calculate summary statistics
      const healthValues = data.map(d => {
        let h = parseFloat(d.health) || 0
        if (h <= 1 && h > 0) h = h * 100
        return h
      })
      
      const anomalyValues = data.map(d => parseFloat(d.anomaly_score) || 0)
      
      const avgAnomaly = anomalyValues.reduce((sum, val) => sum + val, 0) / anomalyValues.length
      
      const summary = {
        health_start: healthValues[0],
        health_end: healthValues[healthValues.length - 1],
        health_change: healthValues[healthValues.length - 1] - healthValues[0],
        avg_anomaly: avgAnomaly,
        max_anomaly: Math.max(...anomalyValues),
        anomaly_spikes: anomalyValues.filter(a => a > 0.5).length
      }

      // Call AI interpretation endpoint
      const res = await fetch("http://localhost:8000/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          summary,
          machine_id: selectedMachine
        })
      })

      const aiResponse = await res.json()
      setAiInsight(aiResponse.insight)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error generating AI interpretation:", error)
      setAiInsight("Unable to generate AI interpretation at this time.")
      setLastUpdated(new Date())
    } finally {
      setAiLoading(false)
    }
  }

  // Update "time since last update" every second
  useEffect(() => {
    if (!lastUpdated) return

    const updateTimer = () => {
      const seconds = Math.floor((new Date() - lastUpdated) / 1000)
      if (seconds < 60) {
        setTimeSinceUpdate(`${seconds}s ago`)
      } else {
        const minutes = Math.floor(seconds / 60)
        setTimeSinceUpdate(`${minutes}m ago`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!selectedMachine) return

    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing trends...")
      fetchTrendsData()
    }, 60000) // 60 seconds

    return () => clearInterval(refreshInterval)
  }, [selectedMachine, selectedHours])

  // Extract fetch logic into separate function for reuse
  const fetchTrendsData = async () => {
    if (!selectedMachine) return

    setLoading(true)
    try {
      const res = await fetch(
        `http://localhost:8000/api/trends?machine_id=${selectedMachine}&hours=${selectedHours}`
      )
      const data = await res.json()
      console.log("Trend data:", data.slice(-5))
      setTrendData(data)
      
      // Generate AI interpretation after data loads
      if (data.length > 0) {
        await generateAIInterpretation(data)
      }
    } catch (error) {
      console.error("Error fetching trends:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update useEffect to use extracted function
  useEffect(() => {
    fetchTrendsData()
  }, [selectedMachine, selectedHours])

  // Prepare chart data
  const chartData = trendData.map((row, idx) => {
    let health = parseFloat(row.health) || 0
    if (health <= 1 && health > 0) {
      health = health * 100
    }

    const anomalyScore = parseFloat(row.anomaly_score) || 0

    return {
      time: row.timestamp?.split(" ")[1]?.substring(0, 8) || `T${idx}`,
      health: health,
      anomaly_score: anomalyScore,
      isAnomaly: anomalyScore > 0.5 // Threshold for red dots
    }
  })

  // Filter anomaly points for overlay
  const anomalyPoints = chartData.filter(point => point.isAnomaly)

  // Generate interpretation (fallback if AI fails)
  const generateInterpretation = () => {
    if (aiInsight) return aiInsight

    if (chartData.length === 0) return "No data available for analysis."

    const avgHealth = chartData.reduce((sum, p) => sum + p.health, 0) / chartData.length
    const recentHealth = chartData.slice(-10).reduce((sum, p) => sum + p.health, 0) / 10
    const anomalyCount = anomalyPoints.length
    const anomalyRate = ((anomalyCount / chartData.length) * 100).toFixed(1)

    const trend = recentHealth < avgHealth ? "degrading" : "stable"
    const healthStatus = avgHealth > 70 ? "good" : avgHealth > 50 ? "moderate" : "critical"

    return `📌 Insight for ${selectedMachine}:
Health is currently ${healthStatus} with an average of ${avgHealth.toFixed(1)}% over the past ${selectedHours} hours.
The system appears to be ${trend} ${recentHealth < avgHealth ? `(recent: ${recentHealth.toFixed(1)}%)` : ""}.
Detected ${anomalyCount} anomalies (${anomalyRate}% anomaly rate).
${anomalyCount > 5 ? "⚠️ High anomaly frequency suggests potential equipment issues requiring attention." : "✓ Anomaly rate is within acceptable range."}`
  }

  const getMetricValue = (point) => {
    return selectedMetric === "health" ? point.health : point.anomaly_score
  }

  const getYAxisDomain = () => {
    return selectedMetric === "health" ? [0, 100] : [0, 1]
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: "40px", color: "#fff", maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>Trends Analysis</h1>
        <p style={{ color: "#aaa", marginBottom: "30px" }}>Historical trends and anomaly patterns</p>

        {/* A. CONTROLS PANEL */}
        <div style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #334155",
          marginBottom: "30px"
        }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Analysis Controls</h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px"
          }}>
            {/* Machine Selector */}
            <div>
              <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontSize: "14px" }}>
                Machine
              </label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "4px",
                  color: "#fff",
                  fontSize: "14px"
                }}
              >
                {machines.map(machine => (
                  <option key={machine} value={machine}>{machine}</option>
                ))}
              </select>
            </div>

            {/* Metric Selector */}
            <div>
              <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontSize: "14px" }}>
                Metric
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "4px",
                  color: "#fff",
                  fontSize: "14px"
                }}
              >
                <option value="health">Health Score</option>
                <option value="anomaly_score">Anomaly Score</option>
              </select>
            </div>

            {/* Time Range Selector */}
            <div>
              <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontSize: "14px" }}>
                Time Range
              </label>
              <select
                value={selectedHours}
                onChange={(e) => setSelectedHours(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "4px",
                  color: "#fff",
                  fontSize: "14px"
                }}
              >
                <option value={1}>Last 1 Hour</option>
                <option value={6}>Last 6 Hours</option>
                <option value={24}>Last 24 Hours</option>
                <option value={72}>Last 3 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* B. MAIN TIME-SERIES CHART WITH C. ANOMALY OVERLAY */}
        <div style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #334155",
          marginBottom: "30px"
        }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>
            {selectedMetric === "health" ? "Health Score" : "Anomaly Score"} Trend
            {anomalyPoints.length > 0 && (
              <span style={{ fontSize: "14px", color: "#ef4444", marginLeft: "15px" }}>
                🔴 {anomalyPoints.length} anomalies detected
              </span>
            )}
          </h2>

          {loading ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>
              Loading trend data...
            </p>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#94a3b8"
                  domain={getYAxisDomain()}
                  tickFormatter={(value) => 
                    selectedMetric === "health" ? `${value}%` : value.toFixed(2)
                  }
                />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value, name) => {
                    if (name === "health") return [`${value.toFixed(1)}%`, "Health"]
                    if (name === "anomaly") return [value.toFixed(3), "Anomaly Score"]
                    return [value, name]
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={selectedMetric === "health" ? "health" : "anomaly_score"}
                  name={selectedMetric === "health" ? "health" : "anomaly"}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={300}
                />
                {/* Anomaly Overlay - Red dots */}
                {anomalyPoints.map((point, idx) => (
                  <circle
                    key={idx}
                    cx={`${(chartData.indexOf(point) / (chartData.length - 1)) * 100}%`}
                    cy={`${100 - (getMetricValue(point) / (selectedMetric === "health" ? 100 : 1) * 100)}%`}
                    r="4"
                    fill="#ef4444"
                    stroke="#fff"
                    strokeWidth="1"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>
              No data available. Please ensure the simulator is running and data is being collected.
            </p>
          )}
        </div>

        {/* D. INTERPRETATION PANEL - ENHANCED */}
        <div style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #334155"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "15px" 
          }}>
            <h2 style={{ fontSize: "20px", margin: 0 }}>
              🧠 AI-Powered Interpretation
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              {lastUpdated && (
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Updated {timeSinceUpdate}
                </span>
              )}
              {aiLoading && (
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #334155",
                  borderTop: "2px solid #3b82f6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}>
                </div>
              )}
              <button
                onClick={() => fetchTrendsData()}
                disabled={loading || aiLoading}
                style={{
                  padding: "6px 12px",
                  background: "#3b82f6",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  fontSize: "12px",
                  cursor: loading || aiLoading ? "not-allowed" : "pointer",
                  opacity: loading || aiLoading ? 0.5 : 1
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          
          <div style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "6px",
            border: "1px solid #334155",
            color: "#e2e8f0",
            lineHeight: "1.8",
            whiteSpace: "pre-line",
            fontSize: "14px",
            minHeight: "100px",
            display: "flex",
            alignItems: aiLoading ? "center" : "flex-start",
            justifyContent: aiLoading ? "center" : "flex-start"
          }}>
            {aiLoading ? (
              <div style={{ textAlign: "center", color: "#94a3b8" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #334155",
                  borderTop: "3px solid #3b82f6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 10px"
                }}>
                </div>
                <p>Analyzing trend data with AI...</p>
              </div>
            ) : (
              generateInterpretation()
            )}
          </div>
        </div>
      </div>

      {/* Add CSS animation for spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
