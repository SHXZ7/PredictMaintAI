import "./globals.css"

export const metadata = {
  title: "PredictMaintAI - Predictive Maintenance Platform",
  description: "AI-powered predictive maintenance for industrial equipment",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
