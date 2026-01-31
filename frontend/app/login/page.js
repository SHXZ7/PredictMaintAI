"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

// ==================== UTILITY COMPONENTS ====================

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

export default function LoginPage() {
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })
  
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      const form = document.querySelector(".login-form")
      form.classList.add("shake")
      setTimeout(() => form.classList.remove("shake"), 500)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Login failed")
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
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: "" }))
    }
  }

  return (
    <div className="login-container">
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
          <a href="/signup" className="nav-link">
            Don't have an account? <strong>Sign Up</strong>
          </a>
        </div>
      </nav>

      <div className="login-content">
        <div className="form-header">
          <div className="form-badge">
            <span>🔐</span>
            <span>Secure Login</span>
          </div>
          <h1 className="form-title">
            Welcome <span className="gradient-text">Back</span>
          </h1>
          <p className="form-subtitle">
            Login to access your predictive maintenance dashboard
          </p>
        </div>

        <div className="login-form">
          {/* Social Login */}
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
            {errors.general && (
              <div className="general-error">
                <span className="error-icon">⚠️</span>
                <span>{errors.general}</span>
              </div>
            )}

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

            <div className="form-options">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="remember"
                  checked={formData.rememberMe}
                  onChange={(e) => handleChange('rememberMe', e.target.checked)}
                  className="checkbox-input"
                />
                <label htmlFor="remember" className="checkbox-label">
                  Remember me
                </label>
              </div>
              <a href="/forgot-password" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting || isSuccess}
            >
              <div className="button-content">
                {isSubmitting && <div className="spinner"></div>}
                {isSuccess && <span className="success-icon">✓</span>}
                <span>
                  {isSuccess ? 'Login Successful!' : isSubmitting ? 'Logging In...' : 'Login'}
                </span>
              </div>
            </button>
          </form>

          <div className="signup-link">
            Don't have an account?{' '}
            <a href="/signup">Sign up for free</a>
          </div>
        </div>
      </div>
    </div>
  )
}
