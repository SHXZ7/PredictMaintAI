"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"
import ProButton from "../components/ProButton"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [fleetData, setFleetData] = useState(null)
  const [alertsData, setAlertsData] = useState(null)

  // 🔐 Auth protection
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    } else {
      fetchDashboardData()
    }
  }, [router])

  const fetchDashboardData = async () => {
    try {
      // Fetch fleet health data
      const fleetRes = await fetch("http://localhost:8000/api/health")
      const fleetResult = await fleetRes.json()
      setFleetData(fleetResult)

      // Fetch alerts summary
      const alertsRes = await fetch("http://localhost:8000/api/alerts/summary")
      const alertsResult = await alertsRes.json()
      setAlertsData(alertsResult)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !fleetData) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading dashboard...</p>
        </div>
        <style jsx>{`
          .loading-container {
            min-height: calc(100vh - 80px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }
          .spinner-large {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(59, 130, 246, 0.1);
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    )
  }

  // Get top 3 critical/warning machines
  const topRiskMachines = fleetData.machines
    .filter(m => m.status === "CRITICAL" || m.status === "WARNING")
    .sort((a, b) => a.health_score - b.health_score)
    .slice(0, 3)
    .map(m => ({
      id: m.machine_id,
      status: m.status,
      health: m.health_score,
      predictedFailure: m.latest_prediction 
        ? `${m.latest_prediction.time_to_failure_hours}h` 
        : "N/A",
      alerts: m.unacknowledged_alerts,
      icon: getMachineIcon(m.machine_id)
    }))

  function getMachineIcon(machineId) {
    if (machineId.includes("MOTOR")) return "⚙️"
    if (machineId.includes("PUMP")) return "💧"
    if (machineId.includes("HVAC")) return "🌡️"
    return "🏭"
  }

  return (
    <>
      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #0a0e17;
          padding-top: 100px;
        }

        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-header {
          margin-bottom: 3rem;
          animation: fadeInUp 0.6s ease-out;
        }

        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #60a5fa 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-subtitle {
          color: #94a3b8;
          font-size: 1.1rem;
        }

        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 50px;
          font-size: 0.875rem;
          color: #10b981;
          margin-top: 1rem;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: rgba(21, 27, 43, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }

        .stat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
        }

        .stat-card.critical:hover {
          border-color: rgba(239, 68, 68, 0.3);
          box-shadow: 0 12px 40px rgba(239, 68, 68, 0.2);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .stat-card.critical .stat-icon {
          background: rgba(239, 68, 68, 0.1);
        }

        .stat-label {
          font-size: 0.875rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #e2e8f0;
          line-height: 1;
        }

        .stat-value.critical {
          color: #ef4444;
        }

        .stat-trend {
          font-size: 0.875rem;
          color: #10b981;
          margin-top: 0.5rem;
        }

        .section {
          margin-bottom: 3rem;
          animation: fadeInUp 0.6s ease-out 0.5s both;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #e2e8f0;
        }

        .health-distribution {
          background: rgba(21, 27, 43, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
        }

        .health-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .health-row:last-child {
          border-bottom: none;
        }

        .health-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .health-badge {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .health-badge.healthy {
          background: #10b981;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
        }

        .health-badge.warning {
          background: #f59e0b;
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
        }

        .health-badge.critical {
          background: #ef4444;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
        }

        .health-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: #e2e8f0;
        }

        .machines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .machine-card {
          background: rgba(21, 27, 43, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .machine-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
        }

        .machine-card.critical::before {
          background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
        }

        .machine-card:hover {
          transform: translateY(-4px);
          border-color: rgba(239, 68, 68, 0.3);
          box-shadow: 0 12px 40px rgba(239, 68, 68, 0.2);
        }

        .machine-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .machine-id {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: #e2e8f0;
        }

        .machine-status {
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .machine-status.critical {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .machine-status.warning {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .machine-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #e2e8f0;
        }

        .health-bar-wrapper {
          margin-top: 1rem;
        }

        .health-bar-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .health-bar-bg {
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }

        .health-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .health-bar-fill.critical {
          background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
        }

        .health-bar-fill.warning {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }

        .health-bar-fill.healthy {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .action-button {
          width: 100%;
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          color: #3b82f6;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .action-button:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 1.5rem;
          }

          .dashboard-title {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .machines-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <Navbar />
        <ProButton />
        
        <div className="dashboard-content">
          {/* Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">System Overview</h1>
            <p className="dashboard-subtitle">
              Real-time monitoring of your industrial equipment fleet
            </p>
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span>Live • Updated just now</span>
            </div>
          </div>

          {/* Stats Grid - REAL DATA */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏭</div>
              <div className="stat-label">Total Machines</div>
              <div className="stat-value">{fleetData.total_machines}</div>
              <div className="stat-trend">↑ All systems monitored</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔔</div>
              <div className="stat-label">Active Alerts</div>
              <div className="stat-value">
                {fleetData.total_unacknowledged_alerts}
              </div>
              <div className="stat-trend">
                {fleetData.total_critical_alerts > 0 ? "⚠️ Requires attention" : "✅ All clear"}
              </div>
            </div>

            <div className="stat-card critical">
              <div className="stat-icon">⚠️</div>
              <div className="stat-label">Critical Machines</div>
              <div className="stat-value critical">
                {fleetData.critical_machines}
              </div>
              <div className="stat-trend">
                {fleetData.critical_machines > 0 ? "🔴 Immediate action needed" : "✅ None"}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-label">Fleet Health</div>
              <div className="stat-value">{fleetData.fleet_health}%</div>
              <div className="stat-trend">
                {fleetData.fleet_health > 70 ? "↑ Good condition" : 
                 fleetData.fleet_health > 50 ? "➡️ Monitor closely" : 
                 "↓ Requires attention"}
              </div>
            </div>
          </div>

          {/* Fleet Health Distribution - REAL DATA */}
          <div className="section">
            <h2 className="section-title">Fleet Health Distribution</h2>
            <div className="health-distribution">
              <div className="health-row">
                <div className="health-label">
                  <span className="health-badge healthy"></span>
                  <span>Healthy</span>
                </div>
                <span className="health-count">{fleetData.healthy_machines}</span>
              </div>

              <div className="health-row">
                <div className="health-label">
                  <span className="health-badge warning"></span>
                  <span>Warning</span>
                </div>
                <span className="health-count">{fleetData.warning_machines}</span>
              </div>

              <div className="health-row">
                <div className="health-label">
                  <span className="health-badge critical"></span>
                  <span>Critical</span>
                </div>
                <span className="health-count">{fleetData.critical_machines}</span>
              </div>
            </div>
          </div>

          {/* Top At-Risk Machines - REAL DATA */}
          <div className="section">
            <h2 className="section-title">
              {topRiskMachines.length > 0 ? "Top At-Risk Machines" : "All Machines Healthy"}
            </h2>
            {topRiskMachines.length > 0 ? (
              <div className="machines-grid">
                {topRiskMachines.map((machine) => (
                  <div 
                    key={machine.id} 
                    className={`machine-card ${machine.status.toLowerCase()}`}
                    onClick={() => router.push("/dashboard/health")}
                  >
                    <div className="machine-header">
                      <div className="machine-id">
                        <span>{machine.icon}</span>
                        <span>{machine.id}</span>
                      </div>
                      <span className={`machine-status ${machine.status.toLowerCase()}`}>
                        {machine.status}
                      </span>
                    </div>

                    <div className="health-bar-wrapper">
                      <div className="health-bar-label">
                        <span>Health Score</span>
                        <span>{machine.health}%</span>
                      </div>
                      <div className="health-bar-bg">
                        <div 
                          className={`health-bar-fill ${
                            machine.health < 50 ? 'critical' : 
                            machine.health < 70 ? 'warning' : 'healthy'
                          }`}
                          style={{ width: `${machine.health}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="machine-metrics">
                      <div className="metric">
                        <span className="metric-label">Time to Failure</span>
                        <span className="metric-value">{machine.predictedFailure}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Active Alerts</span>
                        <span className="metric-value">{machine.alerts}</span>
                      </div>
                    </div>

                    <button className="action-button">
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: "rgba(21, 27, 43, 0.6)",
                padding: "40px",
                borderRadius: "16px",
                textAlign: "center",
                color: "#10b981"
              }}>
                <p style={{ fontSize: "48px", marginBottom: "10px" }}>✅</p>
                <p style={{ fontSize: "18px", fontWeight: "600" }}>
                  All machines are operating normally
                </p>
                <p style={{ color: "#94a3b8", marginTop: "10px" }}>
                  No critical or warning conditions detected
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="section">
            <h2 className="section-title">Quick Actions</h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem"
            }}>
              <button
                onClick={() => router.push("/dashboard/health")}
                style={{
                  padding: "1.5rem",
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "12px",
                  color: "#3b82f6",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                🏥 View Fleet Health
              </button>

              <button
                onClick={() => router.push("/dashboard/alerts")}
                style={{
                  padding: "1.5rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "12px",
                  color: "#ef4444",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                🚨 Manage Alerts ({fleetData.total_unacknowledged_alerts})
              </button>

              <button
                onClick={() => router.push("/dashboard/predictions")}
                style={{
                  padding: "1.5rem",
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "12px",
                  color: "#8b5cf6",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                🔮 Make Predictions
              </button>

              <button
                onClick={() => router.push("/dashboard/trends")}
                style={{
                  padding: "1.5rem",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "12px",
                  color: "#10b981",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                📈 View Trends
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
