"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar"

export default function PredictionsPage() {
  const router = useRouter()
  const [machines, setMachines] = useState([])
  const [selectedMachine, setSelectedMachine] = useState("Machine_A")
  const [predicting, setPredicting] = useState(false)
  const [prediction, setPrediction] = useState(null)
  
  // Form inputs with default realistic values
  const [inputs, setInputs] = useState({
    air_temp: 300,
    process_temp: 310,
    rpm: 1500,
    torque: 45,
    tool_wear: 100
  })

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

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }))
  }

  const handlePredict = async () => {
    // ✅ 1. Show loading state
    setPredicting(true)
    
    try {
      // ✅ 2. Validate inputs (ranges enforced by sliders)
      // ✅ 3. Call /api/predict
      const res = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...inputs,
          machine_id: selectedMachine
        })
      })

      // ✅ 4. Render results
      const data = await res.json()
      setPrediction(data)
      console.log("Prediction result:", data)
    } catch (error) {
      console.error("Error making prediction:", error)
      alert("Failed to get prediction. Please try again.")
    } finally {
      setPredicting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "HEALTHY": return "#4ade80"
      case "AT RISK": return "#fbbf24"
      case "FAILURE LIKELY": return "#ef4444"
      default: return "#6b7280"
    }
  }

  const inputRanges = {
    air_temp: { min: 295, max: 305, label: "Air Temperature (K)", unit: "K" },
    process_temp: { min: 305, max: 315, label: "Process Temperature (K)", unit: "K" },
    rpm: { min: 1200, max: 1800, label: "Rotational Speed (RPM)", unit: "RPM" },
    torque: { min: 30, max: 60, label: "Torque (Nm)", unit: "Nm" },
    tool_wear: { min: 0, max: 250, label: "Tool Wear (min)", unit: "min" }
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: "30px", paddingTop: "80px", color: "#fff", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>Failure Predictions</h1>
          <p style={{ color: "#aaa" }}>AI-powered predictive analytics using machine learning</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          {/* LEFT: Input Form */}
          <div style={{
            background: "#1e293b",
            padding: "30px",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}>
            <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Input Parameters</h2>

            {/* Machine Selector */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontSize: "14px" }}>
                Machine ID
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

            {/* Input Sliders */}
            {Object.entries(inputRanges).map(([key, config]) => (
              <div key={key} style={{ marginBottom: "25px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label style={{ color: "#94a3b8", fontSize: "14px" }}>
                    {config.label}
                  </label>
                  <span style={{ color: "#fff", fontWeight: "bold" }}>
                    {inputs[key]} {config.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={config.min}
                  max={config.max}
                  value={inputs[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  style={{
                    width: "100%",
                    height: "6px",
                    background: "#334155",
                    borderRadius: "3px",
                    outline: "none"
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                  <span>{config.min} {config.unit}</span>
                  <span>{config.max} {config.unit}</span>
                </div>
              </div>
            ))}

            {/* Predict Button */}
            <button
              onClick={handlePredict}
              disabled={predicting}
              style={{
                width: "100%",
                padding: "14px",
                background: predicting ? "#64748b" : "#3b82f6",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: predicting ? "not-allowed" : "pointer",
                marginTop: "10px"
              }}
            >
              {predicting ? "⏳ Analyzing..." : "🔮 Predict Failure"}
            </button>
          </div>

          {/* RIGHT: Prediction Results */}
          <div style={{
            background: "#1e293b",
            padding: "30px",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}>
            <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Prediction Results</h2>

            {!prediction ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                <p style={{ fontSize: "48px", marginBottom: "10px" }}>🔮</p>
                <p>Enter parameters and click "Predict Failure" to see results</p>
              </div>
            ) : (
              <div>
                {/* Status Badge - Judge-facing, color-coded */}
                <div style={{
                  textAlign: "center",
                  padding: "30px",
                  background: "#0f172a",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: `2px solid ${getStatusColor(prediction.status)}`
                }}>
                  <div style={{
                    display: "inline-block",
                    padding: "12px 30px",
                    borderRadius: "50px",
                    background: getStatusColor(prediction.status),
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#000",
                    marginBottom: "15px"
                  }}>
                    {prediction.status}
                  </div>
                  <p style={{ fontSize: "14px", color: "#94a3b8" }}>
                    Machine: {selectedMachine}
                  </p>
                </div>

                {/* ✅ Required Cards - Judge-Facing Metrics */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: "20px"
                }}>
                  {/* ✅ 1. Failure Probability - Big %, Color-coded */}
                  <div style={{
                    background: "#0f172a",
                    padding: "20px",
                    borderRadius: "6px"
                  }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>Failure Probability</p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#ef4444" }}>
                      {(prediction.failure_probability * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* Health Score (inverse of failure probability) */}
                  <div style={{
                    background: "#0f172a",
                    padding: "20px",
                    borderRadius: "6px"
                  }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>Health Score</p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#4ade80" }}>
                      {(prediction.health_score * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* ✅ 2. Estimated Time to Failure - Countdown-style */}
                  <div style={{
                    background: "#0f172a",
                    padding: "20px",
                    borderRadius: "6px"
                  }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>Time to Failure</p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#fbbf24" }}>
                      ~{prediction.time_to_failure_hours}h
                    </p>
                  </div>

                  {/* ✅ 3. Confidence - Badge style */}
                  <div style={{
                    background: "#0f172a",
                    padding: "20px",
                    borderRadius: "6px"
                  }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>Confidence</p>
                    <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                      {prediction.confidence}%
                    </p>
                  </div>
                </div>

                {/* ✅ Recommendation - Actionable insights */}
                <div style={{
                  background: "#0f172a",
                  padding: "20px",
                  borderRadius: "6px",
                  border: "1px solid #334155"
                }}>
                  <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "15px", color: "#94a3b8" }}>
                    🤖 AI-Powered Maintenance Recommendations
                  </p>
                  {prediction.ai_recommendations && prediction.ai_recommendations.length > 0 ? (
                    <div style={{ 
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}>
                      {prediction.ai_recommendations.map((rec, idx) => (
                        <div 
                          key={idx}
                          style={{
                            padding: "12px",
                            background: "#1e293b",
                            borderRadius: "4px",
                            borderLeft: `3px solid ${
                              idx === 0 ? "#ef4444" : 
                              idx === 1 ? "#f59e0b" : 
                              idx === 2 ? "#3b82f6" : "#4ade80"
                            }`,
                            fontSize: "14px",
                            lineHeight: "1.6"
                          }}
                        >
                          <span style={{ 
                            fontWeight: "600", 
                            marginRight: "8px",
                            color: "#94a3b8" 
                          }}>
                            {idx + 1}.
                          </span>
                          {rec}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
                      {prediction.status === "HEALTHY" && 
                        "Machine is operating normally. Continue regular monitoring schedule."}
                      {prediction.status === "AT RISK" && 
                        "Machine shows signs of degradation. Schedule maintenance check within 24-48 hours."}
                      {prediction.status === "FAILURE LIKELY" && 
                        "⚠️ High failure risk detected. Immediate inspection and maintenance required to prevent unplanned downtime."}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Slider Styling */}
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </>
  )
}
