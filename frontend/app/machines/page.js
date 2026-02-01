"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"

export default function MachinesPage() {
  const router = useRouter()
  const [machines, setMachines] = useState([])
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("")
  const [loading, setLoading] = useState(true)

  // Machine data with full specifications
  const machineDetails = {
    "PUMP_01": {
      name: "Hydraulic Pump 01",
      type: "Centrifugal Pump",
      mfgDate: "2022-03-15",
      expiryDate: "2032-03-15",
      lastMaintenance: "2024-11-20",
      nextMaintenance: "2025-03-20",
      maintenanceInterval: "120 days",
      specifications: {
        "Model": "CP-5000X",
        "Manufacturer": "FlowTech Industries",
        "Flow Rate": "500 GPM",
        "Pressure Rating": "150 PSI",
        "Power": "75 HP",
        "RPM": "1750",
        "Voltage": "480V 3-Phase",
        "Temperature Range": "-10°C to 80°C"
      },
      icon: "💧"
    },
    "PUMP_02": {
      name: "Hydraulic Pump 02",
      type: "Positive Displacement Pump",
      mfgDate: "2022-06-22",
      expiryDate: "2032-06-22",
      lastMaintenance: "2024-12-01",
      nextMaintenance: "2025-04-01",
      maintenanceInterval: "120 days",
      specifications: {
        "Model": "PD-3500",
        "Manufacturer": "FlowTech Industries",
        "Flow Rate": "350 GPM",
        "Pressure Rating": "200 PSI",
        "Power": "60 HP",
        "RPM": "1450",
        "Voltage": "480V 3-Phase",
        "Temperature Range": "0°C to 90°C"
      },
      icon: "💧"
    },
    "HVAC_01": {
      name: "HVAC System 01",
      type: "Central Air Conditioning",
      mfgDate: "2021-08-10",
      expiryDate: "2031-08-10",
      lastMaintenance: "2024-10-15",
      nextMaintenance: "2025-01-15",
      maintenanceInterval: "90 days",
      specifications: {
        "Model": "CAC-10000",
        "Manufacturer": "CoolAir Systems",
        "Cooling Capacity": "10 Tons",
        "BTU Rating": "120,000 BTU/hr",
        "Refrigerant": "R-410A",
        "Power": "40 HP",
        "Voltage": "460V 3-Phase",
        "SEER Rating": "16"
      },
      icon: "🌡️"
    },
    "HVAC_02": {
      name: "HVAC System 02",
      type: "Rooftop Unit",
      mfgDate: "2021-11-05",
      expiryDate: "2031-11-05",
      lastMaintenance: "2024-11-10",
      nextMaintenance: "2025-02-10",
      maintenanceInterval: "90 days",
      specifications: {
        "Model": "RTU-8000",
        "Manufacturer": "CoolAir Systems",
        "Cooling Capacity": "8 Tons",
        "BTU Rating": "96,000 BTU/hr",
        "Refrigerant": "R-410A",
        "Power": "32 HP",
        "Voltage": "460V 3-Phase",
        "SEER Rating": "15"
      },
      icon: "🌡️"
    },
    "MOTOR_01": {
      name: "Industrial Motor 01",
      type: "AC Induction Motor",
      mfgDate: "2022-01-20",
      expiryDate: "2037-01-20",
      lastMaintenance: "2024-12-05",
      nextMaintenance: "2025-06-05",
      maintenanceInterval: "180 days",
      specifications: {
        "Model": "IND-M500",
        "Manufacturer": "PowerDrive Inc",
        "Power": "500 HP",
        "RPM": "1800",
        "Voltage": "4160V 3-Phase",
        "Frame": "5810",
        "Efficiency": "96.2%",
        "Service Factor": "1.15"
      },
      icon: "⚙️"
    },
    "MOTOR_02": {
      name: "Industrial Motor 02",
      type: "AC Synchronous Motor",
      mfgDate: "2022-04-18",
      expiryDate: "2037-04-18",
      lastMaintenance: "2024-11-28",
      nextMaintenance: "2025-05-28",
      maintenanceInterval: "180 days",
      specifications: {
        "Model": "SYNC-M350",
        "Manufacturer": "PowerDrive Inc",
        "Power": "350 HP",
        "RPM": "1200",
        "Voltage": "2300V 3-Phase",
        "Frame": "5010",
        "Efficiency": "95.8%",
        "Power Factor": "1.0"
      },
      icon: "⚙️"
    },
    "BEARING_01": {
      name: "Main Bearing Assembly 01",
      type: "Roller Bearing",
      mfgDate: "2023-02-10",
      expiryDate: "2028-02-10",
      lastMaintenance: "2024-12-10",
      nextMaintenance: "2025-03-10",
      maintenanceInterval: "90 days",
      specifications: {
        "Model": "RB-2250",
        "Manufacturer": "BearingTech Pro",
        "Bore Diameter": "250mm",
        "Outside Diameter": "380mm",
        "Width": "75mm",
        "Load Rating": "450 kN",
        "Max Speed": "3600 RPM",
        "Lubrication": "Grease NLGI-2"
      },
      icon: "⚙️"
    },
    "COMPRESSOR_01": {
      name: "Air Compressor 01",
      type: "Rotary Screw Compressor",
      mfgDate: "2021-09-12",
      expiryDate: "2031-09-12",
      lastMaintenance: "2024-11-25",
      nextMaintenance: "2025-02-25",
      maintenanceInterval: "90 days",
      specifications: {
        "Model": "RSC-250",
        "Manufacturer": "AirPro Systems",
        "CFM": "250 CFM",
        "Pressure": "125 PSI",
        "Power": "75 HP",
        "Tank Size": "240 Gallons",
        "Voltage": "460V 3-Phase",
        "Cooling": "Air Cooled"
      },
      icon: "🔧"
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
      return
    }
    
    // Fetch machines from backend
    fetchMachines()
  }, [router])

  const fetchMachines = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/health")
      const data = await res.json()
      
      // Combine backend data with local machine details
      const enrichedMachines = data.machines.map(m => ({
        ...m,
        ...machineDetails[m.machine_id],
        machine_id: m.machine_id
      }))
      
      setMachines(enrichedMachines)
    } catch (error) {
      console.error("Error fetching machines:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleMaintenance = () => {
    if (!nextMaintenanceDate) {
      alert("Please select a date")
      return
    }
    
    // Update the machine's next maintenance date
    const updatedMachines = machines.map(m => 
      m.machine_id === selectedMachine.machine_id 
        ? { ...m, nextMaintenance: nextMaintenanceDate }
        : m
    )
    
    setMachines(updatedMachines)
    setShowScheduleModal(false)
    setNextMaintenanceDate("")
    alert(`Maintenance scheduled for ${new Date(nextMaintenanceDate).toLocaleDateString()}`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "CRITICAL": return "#ef4444"
      case "WARNING": return "#f59e0b"
      case "HEALTHY": return "#10b981"
      default: return "#6b7280"
    }
  }

  const getDaysUntilMaintenance = (nextDate) => {
    const today = new Date()
    const next = new Date(nextDate)
    const diffTime = next - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{
              width: "50px",
              height: "50px",
              border: "4px solid #334155",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }}></div>
            <p>Loading machines...</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: "100vh",
        background: "#0a0e17",
        paddingTop: "100px",
        padding: "100px 2rem 2rem"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#fff", marginBottom: "10px" }}>
            Machine Management
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
            View and manage all industrial equipment
          </p>

          {/* Machine Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px"
          }}>
            {machines.map((machine) => {
              const daysUntil = getDaysUntilMaintenance(machine.nextMaintenance)
              
              return (
                <div
                  key={machine.machine_id}
                  onClick={() => setSelectedMachine(machine)}
                  style={{
                    background: "rgba(21, 27, 43, 0.6)",
                    border: `2px solid ${getStatusColor(machine.status)}`,
                    borderRadius: "16px",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)"
                    e.currentTarget.style.boxShadow = `0 8px 24px ${getStatusColor(machine.status)}40`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  {/* Status Indicator */}
                  <div style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    padding: "4px 12px",
                    background: `${getStatusColor(machine.status)}20`,
                    color: getStatusColor(machine.status),
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "700"
                  }}>
                    {machine.status}
                  </div>

                  {/* Machine Icon & Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
                    <div style={{
                      width: "50px",
                      height: "50px",
                      background: `${getStatusColor(machine.status)}20`,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px"
                    }}>
                      {machine.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
                        {machine.name || machine.machine_id}
                      </h3>
                      <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {machine.type}
                      </p>
                    </div>
                  </div>

                  {/* Health Score */}
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>Health Score</span>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: getStatusColor(machine.status) }}>
                        {machine.health_score}%
                      </span>
                    </div>
                    <div style={{
                      height: "6px",
                      background: "#0f172a",
                      borderRadius: "3px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${machine.health_score}%`,
                        background: getStatusColor(machine.status),
                        transition: "width 0.5s"
                      }}></div>
                    </div>
                  </div>

                  {/* Maintenance Info */}
                  <div style={{
                    background: "#0f172a",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "#94a3b8" }}>Next Maintenance:</span>
                      <span style={{
                        color: daysUntil < 7 ? "#ef4444" : daysUntil < 30 ? "#f59e0b" : "#10b981",
                        fontWeight: "600"
                      }}>
                        {daysUntil} days
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Date:</span>
                      <span style={{ color: "#fff", fontWeight: "600" }}>
                        {new Date(machine.nextMaintenance).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Machine Details Modal */}
      {selectedMachine && (
        <>
          <div
            onClick={() => setSelectedMachine(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              zIndex: 999,
              backdropFilter: "blur(4px)"
            }}
          />
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#1e293b",
            borderRadius: "16px",
            padding: "2rem",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflowY: "auto",
            zIndex: 1000,
            border: `2px solid ${getStatusColor(selectedMachine.status)}`
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  background: `${getStatusColor(selectedMachine.status)}20`,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px"
                }}>
                  {selectedMachine.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "5px" }}>
                    {selectedMachine.name || selectedMachine.machine_id}
                  </h2>
                  <p style={{ color: "#94a3b8" }}>{selectedMachine.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMachine(null)}
                style={{
                  background: "#334155",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "18px"
                }}
              >
                ✕
              </button>
            </div>

            {/* Status & Health */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "15px",
              marginBottom: "25px"
            }}>
              <div style={{ background: "#0f172a", padding: "15px", borderRadius: "8px" }}>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>Status</p>
                <p style={{ fontSize: "18px", fontWeight: "700", color: getStatusColor(selectedMachine.status) }}>
                  {selectedMachine.status}
                </p>
              </div>
              <div style={{ background: "#0f172a", padding: "15px", borderRadius: "8px" }}>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>Health Score</p>
                <p style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>
                  {selectedMachine.health_score}%
                </p>
              </div>
              <div style={{ background: "#0f172a", padding: "15px", borderRadius: "8px" }}>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>Active Alerts</p>
                <p style={{ fontSize: "18px", fontWeight: "700", color: "#f59e0b" }}>
                  {selectedMachine.unacknowledged_alerts}
                </p>
              </div>
            </div>

            {/* Dates Section */}
            <div style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "15px" }}>
                📅 Important Dates
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>Manufacturing Date</p>
                  <p style={{ fontSize: "14px", color: "#fff", fontWeight: "600" }}>
                    {new Date(selectedMachine.mfgDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>Expiry Date</p>
                  <p style={{ fontSize: "14px", color: "#fff", fontWeight: "600" }}>
                    {new Date(selectedMachine.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>Last Maintenance</p>
                  <p style={{ fontSize: "14px", color: "#10b981", fontWeight: "600" }}>
                    {new Date(selectedMachine.lastMaintenance).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>Next Maintenance</p>
                  <p style={{ fontSize: "14px", color: "#f59e0b", fontWeight: "600" }}>
                    {new Date(selectedMachine.nextMaintenance).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                style={{
                  marginTop: "15px",
                  width: "100%",
                  padding: "12px",
                  background: "#3b82f6",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                📆 Schedule Next Maintenance
              </button>
            </div>

            {/* Specifications */}
            <div style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "15px" }}>
                🔧 Technical Specifications
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {Object.entries(selectedMachine.specifications || {}).map(([key, value]) => (
                  <div key={key} style={{ fontSize: "13px" }}>
                    <span style={{ color: "#94a3b8" }}>{key}:</span>
                    <span style={{ color: "#fff", fontWeight: "600", marginLeft: "8px" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Machine History */}
            <div style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "12px"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "15px" }}>
                📊 Machine History
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ padding: "12px", background: "#1e293b", borderRadius: "8px", borderLeft: "3px solid #10b981" }}>
                  <p style={{ fontSize: "13px", color: "#fff", fontWeight: "600", marginBottom: "4px" }}>
                    Maintenance Completed
                  </p>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {new Date(selectedMachine.lastMaintenance).toLocaleDateString()} - Routine inspection and lubrication completed
                  </p>
                </div>
                <div style={{ padding: "12px", background: "#1e293b", borderRadius: "8px", borderLeft: "3px solid #3b82f6" }}>
                  <p style={{ fontSize: "13px", color: "#fff", fontWeight: "600", marginBottom: "4px" }}>
                    Health Check Passed
                  </p>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Current health score: {selectedMachine.health_score}% - Operating within normal parameters
                  </p>
                </div>
                <div style={{ padding: "12px", background: "#1e293b", borderRadius: "8px", borderLeft: "3px solid #f59e0b" }}>
                  <p style={{ fontSize: "13px", color: "#fff", fontWeight: "600", marginBottom: "4px" }}>
                    Maintenance Interval
                  </p>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Scheduled every {selectedMachine.maintenanceInterval}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Schedule Maintenance Modal */}
      {showScheduleModal && (
        <>
          <div
            onClick={() => setShowScheduleModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              zIndex: 1001
            }}
          />
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#1e293b",
            borderRadius: "16px",
            padding: "2rem",
            width: "90%",
            maxWidth: "400px",
            zIndex: 1002
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "20px" }}>
              Schedule Maintenance
            </h3>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
              Select Date
            </label>
            <input
              type="date"
              value={nextMaintenanceDate}
              onChange={(e) => setNextMaintenanceDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                marginBottom: "20px"
              }}
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleScheduleMaintenance}
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
                Schedule
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
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
        </>
      )}
    </>
  )
}
