"use client"

import { useState } from 'react'

export default function ProButton() {
  const [showModal, setShowModal] = useState(false)

  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/mo",
      features: ["5 machines", "Basic alerts", "Email support", "7-day data"],
      color: "#3b82f6",
      popular: false
    },
    {
      name: "Pro",
      price: "$149",
      period: "/mo",
      features: ["25 machines", "AI predictions", "Priority support", "90-day data"],
      color: "#8b5cf6",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$499",
      period: "/mo",
      features: ["Unlimited", "Custom AI", "24/7 support", "Unlimited data"],
      color: "#f59e0b",
      popular: false
    }
  ]

  return (
    <>
      <style jsx>{`
        .pro-floating-button {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          padding: 8px 18px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border: none;
          border-radius: 50px;
          color: #000;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 12px rgba(251, 191, 36, 0.4);
          transition: all 0.3s;
        }

        .pro-floating-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(251, 191, 36, 0.6);
        }

        .pro-star {
          font-size: 14px;
        }

        .pro-text {
          letter-spacing: 0.5px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-content {
          background: #0a0e17;
          border-radius: 20px;
          max-width: 950px;
          width: 100%;
          height: 85vh;
          max-height: 700px;
          position: relative;
          border: 1px solid #1e293b;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          padding: 20px 30px;
          text-align: center;
          flex-shrink: 0;
        }

        .close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.3);
          border: none;
          color: #000;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .close-button:hover {
          background: rgba(0, 0, 0, 0.5);
          transform: rotate(90deg);
        }

        .modal-title {
          font-size: 24px;
          font-weight: 900;
          color: #000;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .modal-subtitle {
          color: rgba(0, 0, 0, 0.7);
          font-size: 13px;
          font-weight: 600;
        }

        .plans-container {
          padding: 25px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          flex: 1;
          overflow: hidden;
        }

        .plan-card {
          background: rgba(30, 41, 59, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          position: relative;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
        }

        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
        }

        .plan-card.popular {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 1px #8b5cf6;
        }

        .popular-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          padding: 4px 16px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .plan-name {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
        }

        .plan-price {
          display: flex;
          align-items: baseline;
          margin-bottom: 15px;
        }

        .price {
          font-size: 32px;
          font-weight: 900;
          color: #fff;
        }

        .period {
          font-size: 14px;
          color: #94a3b8;
          margin-left: 4px;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 15px 0;
          flex: 1;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          color: #e2e8f0;
          font-size: 13px;
        }

        .feature-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        .subscribe-button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .subscribe-button:hover {
          transform: translateY(-2px);
        }

        .subscribe-button.starter {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
        }

        .subscribe-button.pro {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: #fff;
        }

        .subscribe-button.enterprise {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #000;
        }

        .guarantee-badge {
          text-align: center;
          padding: 15px;
          background: rgba(16, 185, 129, 0.1);
          border-top: 1px solid rgba(16, 185, 129, 0.3);
          flex-shrink: 0;
        }

        .guarantee-text {
          color: #10b981;
          font-size: 12px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .plans-container {
            grid-template-columns: 1fr;
            overflow-y: auto;
          }

          .modal-content {
            height: 90vh;
          }
        }
      `}</style>

      {/* Compact Floating Pro Button */}
      <button className="pro-floating-button" onClick={() => setShowModal(true)}>
        <span className="pro-star">⭐</span>
        <span className="pro-text">PRO</span>
      </button>

      {/* Compact Subscription Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-button" onClick={() => setShowModal(false)}>
                ×
              </button>
              <h2 className="modal-title">⭐ Upgrade to Pro</h2>
              <p className="modal-subtitle">
                Unlock advanced features for predictive maintenance
              </p>
            </div>

            <div className="plans-container">
              {plans.map((plan, index) => (
                <div key={index} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                  {plan.popular && <div className="popular-badge">Most Popular</div>}
                  
                  <h3 className="plan-name">{plan.name}</h3>
                  
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>

                  <ul className="features-list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`subscribe-button ${plan.name.toLowerCase()}`}
                    onClick={() => alert(`Selected ${plan.name} plan!`)}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </button>
                </div>
              ))}
            </div>

            <div className="guarantee-badge">
              <p className="guarantee-text">
                🛡️ 30-Day Money-Back • Cancel Anytime • No Hidden Fees
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
