"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar"

export default function PredictionsPage() {
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
        <h1>Failure Predictions</h1>
        <p>AI-powered predictive analytics</p>
      </div>
    </>
  )
}
