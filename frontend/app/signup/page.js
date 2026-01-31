"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

// ==================== UTILITY COMPONENTS ====================

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" }
    
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z\d]/.test(pwd)) score++
    
    const levels = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Weak", color: "#ef4444" },
      { score: 2, label: "Fair", color: "#f59e0b" },
      { score: 3, label: "Good", color: "#3b82f6" },
      { score: 4, label: "Strong", color: "#10b981" },
      { score: 5, label: "Very Strong", color: "#059669" }
    ]
    
    return levels[score]
  }
  
  const strength = getStrength(password)
  
  if (!password) return null
  
  return (
    <div className="password-strength">
      <div className="strength-bar-container">
        <div 
          className="strength-bar" 
          style={{ 
            width: `${(strength.score / 5) * 100}%`,
            background: strength.color
          }}
        />
      </div>
      <span className="strength-label" style={{ color: strength.color }}>
        {strength.label}
      </span>
    </div>
  )
}

const InputField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  error, 
  icon,
  placeholder,
  showPasswordToggle = false,
  onTogglePassword
}) => {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field ${error ? 'error' : ''} ${icon ? 'with-icon' : ''}`}
        />
        {showPasswordToggle && (
          <button 
            type="button"
            onClick={onTogglePassword}
            className="password-toggle"
          >
            {type === "password" ? "👁️" : "👁️‍🗨️"}
          </button>
        )}
      </div>
      {error && (
        <span className="input-error">
          <span className="error-icon">⚠️</span>
          {error}
        </span>
      )}
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export default function SignupPage() {
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    role: "",
    acceptTerms: false
  })
  
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [currentBenefit, setCurrentBenefit] = useState(0)

  // Rotate benefits
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit(prev => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const benefits = [
    {
      icon: "📡",
      title: "Real-Time Monitoring",
      description: "Track all your equipment 24/7 with millisecond precision"
    },
    {
      icon: "🤖",
      title: "AI-Powered Predictions",
      description: "Forecast failures up to 48 hours in advance"
    },
    {
      icon: "📉",
      title: "Reduce Downtime by 60%",
      description: "Prevent costly unexpected equipment failures"
    },
    {
      icon: "🔐",
      title: "Enterprise Security",
      description: "Bank-level encryption and role-based access control"
    }
  ]

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
const handleSubmit = async (e) => {
  e.preventDefault()

  if (!validateForm()) {
    const form = document.querySelector(".signup-form")
    form.classList.add("shake")
    setTimeout(() => form.classList.remove("shake"), 500)
    return
  }

  setIsSubmitting(true)

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.fullName,     // backend expects "name"
          email: formData.email,
          password: formData.password
        })
      }
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.detail || "Signup failed")
    }

    // ✅ Save JWT token
    localStorage.setItem("authToken", data.access_token)

    // ✅ Success state (for animation)
    setIsSuccess(true)

    // ✅ Redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 1200)

  } catch (error) {
    setErrors({
      general: error.message
    })
  } finally {
    setIsSubmitting(false)
  }
}

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <>
      <div className="signup-container">
        <div className="background-grid"></div>
        <div className="background-glow glow-1"></div>
        <div className="background-glow glow-2"></div>

        {/* Navigation */}
        <nav className="nav-container">
          <div className="nav-content">
            <div className="logo" onClick={() => router.push("/")}>
              <div className="logo-icon">⚡</div>
              <span>PredictMaint<span className="gradient-text">AI</span></span>
            </div>
            <a href="/login" className="nav-link">
              Already have an account? <strong>Login</strong>
            </a>
          </div>
        </nav>

        <div className="signup-content">
          {/* Form Section */}
          <div className="form-section">
            <div className="form-header">
              <h1 className="form-title">
                Create Your <span className="gradient-text">Account</span>
              </h1>
              <p className="form-subtitle">
                Start predicting equipment failures and reducing downtime today
              </p>
            </div>

            <div className="signup-form">
              {/* Social Signup */}
              <div className="social-buttons">
                <button className="social-button">
                  <span>🔵</span>
                  <span>Google</span>
                </button>
                <button className="social-button">
                  <span>🟦</span>
                  <span>Microsoft</span>
                </button>
              </div>

              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">or continue with email</span>
                <div className="divider-line"></div>
              </div>

              <form onSubmit={handleSubmit}>
                <InputField
                  label="Full Name"
                  icon="👤"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="John Doe"
                  error={errors.fullName}
                />

                <InputField
                  label="Email Address"
                  type="email"
                  icon="📧"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john@company.com"
                  error={errors.email}
                />

                <InputField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  icon="🔒"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  error={errors.password}
                  showPasswordToggle
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />
                
                <PasswordStrengthMeter password={formData.password} />

                <InputField
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  icon="🔒"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  showPasswordToggle
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />


                <div className="input-group">
                  <label className="input-label">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="select-field"
                  >
                    <option value="">Select your role</option>
                    <option value="engineer">Maintenance Engineer</option>
                    <option value="manager">Operations Manager</option>
                    <option value="technician">Technician</option>
                    <option value="executive">Executive</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                    className="checkbox-input"
                  />
                  <label htmlFor="terms" className="checkbox-label">
                    I agree to the <a href="/terms">Terms of Service</a> and{' '}
                    <a href="/privacy">Privacy Policy</a>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <span className="input-error" style={{ marginTop: '-1rem', marginBottom: '1rem' }}>
                    <span className="error-icon">⚠️</span>
                    {errors.acceptTerms}
                  </span>
                )}

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting || isSuccess}
                >
                  <div className="button-content">
                    {isSubmitting && <div className="spinner"></div>}
                    {isSuccess && <span className="success-icon">✓</span>}
                    <span>
                      {isSuccess ? 'Account Created!' : isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </span>
                  </div>
                </button>
              </form>

              <div className="login-link">
                Already have an account?{' '}
                <a href="/login">Login here</a>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="benefits-section">
            <div className="benefits-header">
              <div className="benefits-badge">Why Choose Us</div>
              <h2 className="benefits-title">
                Everything You Need for <span className="gradient-text">Predictive Maintenance</span>
              </h2>
              <p className="benefits-description">
                Join thousands of companies reducing downtime and saving costs with AI-powered predictions
              </p>
            </div>

            <div className="benefits-list">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className={`benefit-card ${index === currentBenefit ? 'active' : ''}`}
                  style={{
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <div className="benefit-icon">{benefit.icon}</div>
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-description">{benefit.description}</p>
                  {index === 2 && (
                    <div className="stat-highlight">
                      <span>📊</span>
                      <span>Average 60% reduction in unplanned downtime</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
