"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

// ==================== UTILITY HOOKS ====================
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    }, { threshold: 0.1, ...options })

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [options])

  return [ref, isVisible]
}

// ==================== REUSABLE COMPONENTS ====================

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [ref, isVisible] = useIntersectionObserver()

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true)
      let startTime = null
      const startValue = 0

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        setCount(Math.floor(easeOutQuart * (end - startValue) + startValue))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [isVisible, hasAnimated, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

const GradientText = ({ children, className = "" }) => (
  <span className={`gradient-text ${className}`}>
    {children}
  </span>
)

const FeatureCard = ({ icon, title, description, color, index }) => {
  const [ref, isVisible] = useIntersectionObserver()
  
  return (
    <div
      ref={ref}
      className={`feature-card ${isVisible ? 'visible' : ''}`}
      style={{
        animationDelay: `${index * 100}ms`,
        '--card-color': color
      }}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      <div className="feature-card-glow" style={{ background: color }}></div>
    </div>
  )
}

const MetricCard = ({ value, label, description, index }) => {
  const [ref, isVisible] = useIntersectionObserver()
  
  return (
    <div
      ref={ref}
      className={`metric-card ${isVisible ? 'visible' : ''}`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      <div className="metric-description">{description}</div>
    </div>
  )
}

const ProcessStep = ({ number, title, description, index, isLast }) => {
  const [ref, isVisible] = useIntersectionObserver()
  
  return (
    <div className="process-step-wrapper">
      <div
        ref={ref}
        className={`process-step ${isVisible ? 'visible' : ''}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="step-number-wrapper">
          <div className="step-number">{number}</div>
          <div className="step-pulse"></div>
        </div>
        <h3 className="step-title">{title}</h3>
        <p className="step-description">{description}</p>
      </div>
      {!isLast && <div className="step-connector-line"></div>}
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export default function HomePage() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div>
      {/* Navigation */}
      <nav className={`nav-container ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <span>PredictMaint<GradientText>AI</GradientText></span>
          </div>
          <div className="nav-actions">
            <button 
              onClick={() => router.push("/login")}
              className="btn btn-secondary"
            >
              Login
            </button>
            <button 
              onClick={() => router.push("/signup")}
              className="btn btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-grid"></div>
        <div className="hero-glow" style={{ 
          top: `${50 + scrollY * 0.1}%`,
          left: `${mousePosition.x * 0.02}%`
        }}></div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span>⚡</span>
            <span>Industrial IoT • AI-Powered • Real-Time</span>
          </div>

          <h1 className="hero-title">
            Predict Equipment Failures<br />
            <GradientText>Before They Happen</GradientText>
          </h1>

          <p className="hero-subtitle">
            A real-time IoT-powered predictive maintenance system that monitors industrial machines, 
            detects anomalies, and forecasts failures up to 48 hours in advance with unprecedented accuracy.
          </p>

          <div className="hero-cta">
            <button 
              onClick={() => router.push("/signup")}
              className="btn btn-primary"
              style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}
            >
              Get Started Free →
            </button>
            <button 
              onClick={() => router.push("/login")}
              className="btn btn-secondary"
              style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}
            >
              View Dashboard
            </button>
          </div>

          <div className="health-display">
            <div className="health-card">
              <div className="health-label">Live Machine Health Score</div>
              <div className="health-score">
                <AnimatedCounter end={94} suffix="%" />
              </div>
              <div className="health-bar-container">
                <div className="health-bar" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="section" style={{ background: 'var(--dark)' }}>
        <div className="section-header">
          <div className="section-badge">The Problem</div>
          <h2 className="section-title">
            The Hidden Cost of <GradientText>Unexpected Failures</GradientText>
          </h2>
          <p className="section-description">
            Traditional maintenance approaches leave industrial operations vulnerable to catastrophic failures
          </p>
        </div>

        <div className="problem-grid">
          {[
            { 
              icon: "⏱️", 
              title: "Costly Downtime", 
              desc: "Unexpected failures halt production, costing thousands per hour in lost revenue and operational disruption" 
            },
            { 
              icon: "📉", 
              title: "Production Loss", 
              desc: "Unplanned outages lead to missed deadlines, contract penalties, and customer dissatisfaction" 
            },
            { 
              icon: "🔧", 
              title: "Emergency Repairs", 
              desc: "Reactive fixes cost 3x more than planned maintenance due to rush orders and overtime labor" 
            },
            { 
              icon: "📊", 
              title: "Data-Blind Operations", 
              desc: "Traditional methods lack real-time insights, making prediction impossible and decisions reactive" 
            }
          ].map((item, i) => {
            const [ref, isVisible] = useIntersectionObserver()
            return (
              <div 
                key={i}
                ref={ref}
                className={`problem-card ${isVisible ? 'visible' : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="problem-icon">{item.icon}</div>
                <h3 className="problem-title">{item.title}</h3>
                <p className="problem-description">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Solution Overview */}
      <section className="section">
        <div className="section-header">
          <div className="section-badge">The Solution</div>
          <h2 className="section-title">
            Smart, <GradientText>Proactive</GradientText> Maintenance
          </h2>
          <p className="section-description">
            Transform maintenance from reactive to predictive with AI-powered real-time insights
          </p>
        </div>

        <div className="features-grid">
          <FeatureCard
            icon="📡"
            title="Real-Time Monitoring"
            description="Continuous sensor data streaming from all equipment with millisecond-level precision"
            color="#3b82f6"
            index={0}
          />
          <FeatureCard
            icon="🤖"
            title="Anomaly Detection"
            description="AI identifies unusual patterns before they become failures using advanced algorithms"
            color="#8b5cf6"
            index={1}
          />
          <FeatureCard
            icon="🔮"
            title="Failure Prediction"
            description="Forecast equipment failures 2-48 hours in advance with 94% accuracy"
            color="#f59e0b"
            index={2}
          />
          <FeatureCard
            icon="⚡"
            title="Smart Alerts"
            description="Instant notifications when intervention is needed, delivered to the right team"
            color="#10b981"
            index={3}
          />
          <FeatureCard
            icon="📊"
            title="Visual Dashboards"
            description="Interactive health monitoring and analytics with customizable real-time views"
            color="#06b6d4"
            index={4}
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'var(--dark)' }}>
        <div className="section-header">
          <div className="section-badge">Process</div>
          <h2 className="section-title">
            From Sensor to <GradientText>Insight</GradientText>
          </h2>
          <p className="section-description">
            A seamless pipeline that transforms raw data into predictive intelligence
          </p>
        </div>

        <div className="process-container">
          <ProcessStep
            number="1"
            title="Sensor Streaming"
            description="Real-time data from IoT sensors across all equipment"
            index={0}
            isLast={false}
          />
          <ProcessStep
            number="2"
            title="Data Ingestion"
            description="Store time-series data in optimized MongoDB collections"
            index={1}
            isLast={false}
          />
          <ProcessStep
            number="3"
            title="ML Analysis"
            description="Prophet & LSTM models analyze trends and patterns"
            index={2}
            isLast={false}
          />
          <ProcessStep
            number="4"
            title="Risk Detection"
            description="Identify anomalies and predict potential failures"
            index={3}
            isLast={false}
          />
          <ProcessStep
            number="5"
            title="Alert & Display"
            description="Dashboard shows health scores and intelligent warnings"
            index={4}
            isLast={true}
          />
        </div>
      </section>

      {/* Key Features */}
      <section className="section">
        <div className="section-header">
          <div className="section-badge">Features</div>
          <h2 className="section-title">
            Enterprise-Grade <GradientText>Capabilities</GradientText>
          </h2>
          <p className="section-description">
            Everything you need for intelligent predictive maintenance at scale
          </p>
        </div>

        <div className="features-grid">
          <FeatureCard
            icon="📡"
            title="Real-Time Sensor Streaming"
            description="Continuous data flow from industrial IoT sensors with millisecond-level precision and reliability"
            color="#3b82f6"
            index={0}
          />
          <FeatureCard
            icon="📈"
            title="Time-Series Forecasting"
            description="Advanced Prophet and LSTM models predict equipment behavior with industry-leading accuracy"
            color="#8b5cf6"
            index={1}
          />
          <FeatureCard
            icon="⚠️"
            title="Early Failure Alerts"
            description="Get notified 2-48 hours before critical failures occur, preventing costly downtime"
            color="#f59e0b"
            index={2}
          />
          <FeatureCard
            icon="❤️"
            title="Machine Health Scoring"
            description="0-100% health metrics for each machine, updated in real-time based on multiple parameters"
            color="#10b981"
            index={3}
          />
          <FeatureCard
            icon="📊"
            title="Interactive Dashboards"
            description="Beautiful, responsive visualizations showing trends, anomalies, and predictions in real-time"
            color="#06b6d4"
            index={4}
          />
          <FeatureCard
            icon="🔐"
            title="Secure Authentication"
            description="Enterprise-grade JWT-based security with role-based access control and encryption"
            color="#ef4444"
            index={5}
          />
        </div>
      </section>

      {/* Metrics & Impact */}
      <section className="section cta-section">
        <div className="section-header">
          <div className="section-badge">Impact</div>
          <h2 className="section-title">
            Measurable <GradientText>Results</GradientText>
          </h2>
          <p className="section-description">
            Real outcomes that transform industrial operations and drive ROI
          </p>
        </div>

        <div className="metrics-grid">
          <MetricCard
            value={<AnimatedCounter end={48} suffix=" hrs" />}
            label="Early Detection"
            description="Predict issues up to 2 days ahead"
            index={0}
          />
          <MetricCard
            value={<AnimatedCounter end={94} suffix="%" />}
            label="Prediction Accuracy"
            description="High precision, low false alarms"
            index={1}
          />
          <MetricCard
            value={<AnimatedCounter end={60} suffix="%" />}
            label="Downtime Reduction"
            description="Minimize unplanned outages"
            index={2}
          />
          <MetricCard
            value={<><AnimatedCounter end={3} />x</>}
            label="Cost Savings"
            description="Vs reactive maintenance"
            index={3}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="section cta-section">
        <div className="cta-content">
          <h2 className="cta-title">
            Start Monitoring Your <GradientText>Machines</GradientText>
          </h2>
          <p className="cta-description">
            Join the future of industrial maintenance. Predict, prevent, and protect your operations 
            with AI-powered intelligence.
          </p>
          <div className="cta-buttons">
            <button 
              onClick={() => router.push("/signup")}
              className="btn btn-primary"
              style={{ fontSize: '1.15rem', padding: '1.1rem 2.75rem' }}
            >
              Get Started Free
            </button>
            <button 
              onClick={() => router.push("/login")}
              className="btn btn-secondary"
              style={{ fontSize: '1.15rem', padding: '1.1rem 2.75rem' }}
            >
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <GradientText>PredictMaintainAI</GradientText>
          </div>
          <p className="footer-description">
            Intelligent predictive maintenance for the modern industrial era
          </p>
          <div className="footer-divider"></div>
          <div className="footer-copyright">
            © 2025 PredictMaintainAI. Built with precision at Jain University.
          </div>
        </div>
      </footer>
    </div>
  )
}
