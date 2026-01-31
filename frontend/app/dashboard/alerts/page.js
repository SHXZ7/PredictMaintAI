"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar"

export default function AlertsPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px', textAlign: 'center' }}>
        <h1>Alerts & Notifications</h1>
        <p>System alerts and warnings</p>
      </div>
    </>
  )
}
