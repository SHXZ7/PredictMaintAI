"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"
import ProButton from "../components/ProButton"

export default function ManageWorkersPage() {
  const router = useRouter()
  const [workers, setWorkers] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@company.com", role: "Operator", access: "Full", status: "Active" },
    { id: 2, name: "Bob Smith", email: "bob@company.com", role: "Technician", access: "Limited", status: "Active" },
    { id: 3, name: "Carol Davis", email: "carol@company.com", role: "Supervisor", access: "Full", status: "Inactive" }
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWorker, setNewWorker] = useState({ name: "", email: "", role: "Operator", access: "Limited" })

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleAddWorker = () => {
    setWorkers([...workers, { ...newWorker, id: workers.length + 1, status: "Active" }])
    setNewWorker({ name: "", email: "", role: "Operator", access: "Limited" })
    setShowAddModal(false)
    alert("Worker added successfully!")
  }

  const handleToggleStatus = (id) => {
    setWorkers(workers.map(w => 
      w.id === id ? { ...w, status: w.status === "Active" ? "Inactive" : "Active" } : w
    ))
  }

  const handleDeleteWorker = (id) => {
    if (confirm("Are you sure you want to remove this worker?")) {
      setWorkers(workers.filter(w => w.id !== id))
    }
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
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#fff", marginBottom: "10px" }}>
                Manage Workers Access
              </h1>
              <p style={{ color: "#94a3b8" }}>
                Control team member permissions and access levels
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: "12px 24px",
                background: "#10b981",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              + Add Worker
            </button>
          </div>

          {/* Workers Table */}
          <div style={{
            background: "rgba(21, 27, 43, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            overflow: "hidden"
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0f172a" }}>
                    <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>Name</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>Email</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>Role</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>Access</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>Status</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker.id} style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "16px", color: "#fff", fontSize: "14px" }}>{worker.name}</td>
                      <td style={{ padding: "16px", color: "#94a3b8", fontSize: "14px" }}>{worker.email}</td>
                      <td style={{ padding: "16px", color: "#fff", fontSize: "14px" }}>{worker.role}</td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          padding: "4px 12px",
                          background: worker.access === "Full" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                          color: worker.access === "Full" ? "#10b981" : "#f59e0b",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {worker.access}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          padding: "4px 12px",
                          background: worker.status === "Active" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          color: worker.status === "Active" ? "#10b981" : "#ef4444",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {worker.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => handleToggleStatus(worker.id)}
                          style={{
                            padding: "6px 12px",
                            background: "#334155",
                            border: "none",
                            borderRadius: "6px",
                            color: "#fff",
                            fontSize: "12px",
                            cursor: "pointer",
                            marginRight: "8px"
                          }}
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleDeleteWorker(worker.id)}
                          style={{
                            padding: "6px 12px",
                            background: "rgba(239, 68, 68, 0.2)",
                            border: "none",
                            borderRadius: "6px",
                            color: "#ef4444",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Worker Modal */}
      {showAddModal && (
        <>
          <div
            onClick={() => setShowAddModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.7)",
              zIndex: 999
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
            maxWidth: "500px",
            zIndex: 1000
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "20px" }}>
              Add New Worker
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
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
                  value={newWorker.email}
                  onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
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
                <select
                  value={newWorker.role}
                  onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
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
                  <option value="Operator">Operator</option>
                  <option value="Technician">Technician</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
                  Access Level
                </label>
                <select
                  value={newWorker.access}
                  onChange={(e) => setNewWorker({ ...newWorker, access: e.target.value })}
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
                  <option value="Limited">Limited</option>
                  <option value="Full">Full</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  onClick={handleAddWorker}
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
                  Add Worker
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
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
          </div>
        </>
      )}
    </>
  )
}
