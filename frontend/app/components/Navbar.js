"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { gsap } from 'gsap'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const circleRefs = useRef([])
  const tlRefs = useRef([])
  const activeTweenRefs = useRef([])
  const logoImgRef = useRef(null)
  const hamburgerRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const navItemsRef = useRef(null)
  const logoRef = useRef(null)

  const navItems = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Live', href: '/dashboard/live' },
    { label: 'Trends', href: '/dashboard/trends' },
    { label: 'Alerts', href: '/dashboard/alerts' },
    { label: 'Predictions', href: '/dashboard/predictions' },
    { label: 'Health', href: '/dashboard/health' }
  ]

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return

        const pill = circle.parentElement
        const rect = pill.getBoundingClientRect()
        const { width: w, height: h } = rect
        const R = ((w * w) / 4 + h * h) / (2 * h)
        const D = Math.ceil(2 * R) + 2
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
        const originY = D - delta

        circle.style.width = `${D}px`
        circle.style.height = `${D}px`
        circle.style.bottom = `-${delta}px`

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        })

        const label = pill.querySelector('.pill-label')
        const hover = pill.querySelector('.pill-label-hover')

        if (label) gsap.set(label, { y: 0 })
        if (hover) gsap.set(hover, { y: h + 12, opacity: 0 })

        const index = circleRefs.current.indexOf(circle)
        if (index === -1) return

        tlRefs.current[index]?.kill()
        const tl = gsap.timeline({ paused: true })

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.5, ease: 'power3.easeOut' }, 0)

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.5, ease: 'power3.easeOut' }, 0)
        }

        if (hover) {
          gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 })
          tl.to(hover, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.easeOut' }, 0)
        }

        tlRefs.current[index] = tl
      })
    }

    layout()

    const onResize = () => layout()
    window.addEventListener('resize', onResize)

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {})
    }

    const menu = mobileMenuRef.current
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0 })
    }

    // Initial animation
    const logo = logoRef.current
    const navItemsEl = navItemsRef.current

    if (logo) {
      gsap.set(logo, { scale: 0 })
      gsap.to(logo, { scale: 1, duration: 0.6, ease: 'power3.easeOut' })
    }

    if (navItemsEl) {
      gsap.set(navItemsEl, { width: 0, overflow: 'hidden' })
      gsap.to(navItemsEl, { width: 'auto', duration: 0.6, ease: 'power3.easeOut' })
    }

    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleEnter = i => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: 'power3.easeOut'
    })
  }

  const handleLeave = i => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease: 'power3.easeOut'
    })
  }

  const handleLogoEnter = () => {
    const img = logoImgRef.current
    if (!img) return
    gsap.to(img, { rotate: 360, duration: 0.4, ease: 'power3.easeOut' })
  }

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen
    setIsMobileMenuOpen(newState)

    const hamburger = hamburgerRef.current
    const menu = mobileMenuRef.current

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line')
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3 })
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3 })
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3 })
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3 })
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' })
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3 }
        )
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          onComplete: () => gsap.set(menu, { visibility: 'hidden' })
        })
      }
    }
  }

  const handleNavigation = (href) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <style jsx>{`
        .dashboard-nav-container {
          position: fixed;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999;
          width: max-content;
        }

        @media (max-width: 968px) {
          .dashboard-nav-container {
            width: calc(100% - 2rem);
            left: 1rem;
            transform: none;
          }
        }

        .dashboard-pill-nav {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        @media (max-width: 968px) {
          .dashboard-pill-nav {
            width: 100%;
            justify-content: space-between;
          }
        }

        .dashboard-pill-logo {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #0a0e17;
          padding: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .dashboard-pill-logo:hover {
          transform: scale(1.05);
        }

        .dashboard-logo-icon {
          font-size: 1.5rem;
        }

        .dashboard-pill-nav-items {
          display: flex;
          align-items: center;
          height: 42px;
          background: #0a0e17;
          border-radius: 9999px;
          overflow: hidden;
        }

        .dashboard-pill-list {
          list-style: none;
          display: flex;
          align-items: stretch;
          gap: 3px;
          margin: 0;
          padding: 3px;
          height: 100%;
        }

        .dashboard-pill-list > li {
          display: flex;
          height: 100%;
        }

        .dashboard-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0 18px;
          background: #151b2b;
          color: #e2e8f0;
          border: none;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          white-space: nowrap;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .dashboard-pill:hover {
          background: #1e293b;
        }

        .dashboard-pill .hover-circle {
          position: absolute;
          left: 50%;
          bottom: 0;
          border-radius: 50%;
          background: #0a0e17;
          z-index: 1;
          pointer-events: none;
        }

        .dashboard-pill .label-stack {
          position: relative;
          display: inline-block;
          z-index: 2;
        }

        .dashboard-pill .pill-label {
          position: relative;
          z-index: 2;
          display: inline-block;
        }

        .dashboard-pill .pill-label-hover {
          position: absolute;
          left: 0;
          top: 0;
          color: #3b82f6;
          z-index: 3;
          display: inline-block;
        }

        .dashboard-pill.is-active {
          background: #1e293b;
          color: #3b82f6;
        }

        .dashboard-pill.is-active::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          z-index: 4;
        }

        .desktop-only {
          display: block;
        }

        .mobile-only {
          display: none;
        }

        @media (max-width: 968px) {
          .desktop-only {
            display: none;
          }

          .mobile-only {
            display: block;
          }
        }

        .mobile-menu-button {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #0a0e17;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          padding: 0;
        }

        .hamburger-line {
          width: 16px;
          height: 2px;
          background: #e2e8f0;
          border-radius: 1px;
          transform-origin: center;
        }

        .mobile-menu-popover {
          position: absolute;
          top: 3.5rem;
          left: 0;
          right: 0;
          background: #0a0e17;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 998;
          opacity: 0;
          visibility: hidden;
        }

        .mobile-menu-list {
          list-style: none;
          margin: 0;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mobile-menu-link {
          display: block;
          padding: 0.875rem 1rem;
          color: #e2e8f0;
          background: #151b2b;
          border: none;
          width: 100%;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mobile-menu-link:hover {
          background: #1e293b;
        }

        .mobile-menu-link.is-active {
          background: #1e293b;
          color: #3b82f6;
        }
      `}</style>

      <div className="dashboard-nav-container">
        <nav className="dashboard-pill-nav">
          <div
            className="dashboard-pill-logo"
            onClick={() => router.push('/dashboard')}
            onMouseEnter={handleLogoEnter}
            ref={logoRef}
          >
            <div className="dashboard-logo-icon" ref={logoImgRef}>⚡</div>
          </div>

          <div className="dashboard-pill-nav-items desktop-only" ref={navItemsRef}>
            <ul className="dashboard-pill-list">
              {navItems.map((item, i) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={`dashboard-pill${pathname === item.href ? ' is-active' : ''}`}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      ref={el => {
                        circleRefs.current[i] = el
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover">
                        {item.label}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            className="mobile-menu-button mobile-only"
            onClick={toggleMobileMenu}
            ref={hamburgerRef}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </nav>

        <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef}>
          <ul className="mobile-menu-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={`mobile-menu-link${pathname === item.href ? ' is-active' : ''}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
