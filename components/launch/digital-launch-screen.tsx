"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Cinzel, Source_Sans_3 } from "next/font/google"

import {
  COMMAND_BRAND,
  COMMAND_BRAND_VERSION,
  COMMAND_ICON_VERSION,
  PNP_LOGO,
  PRO4A_APP_TAGLINE,
  PRO4A_APP_TITLE,
  PRO4A_LOGO,
} from "@/lib/brand-config"
import { cn } from "@/lib/utils"

const displayFont = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-launch-display",
})

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-launch-body",
})

type LaunchPhase = "ready" | "charging" | "live"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  /** 0..1 — mostly gold, some blue accents */
  hueMix: number
  twinklePhase: number
}

const LINK_DISTANCE = 150
const POINTER_LINK_DISTANCE = 220

function ParticleField({ phase }: { phase: LaunchPhase }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef<LaunchPhase>(phase)
  const burstRef = useRef(0)

  useEffect(() => {
    if (phase === "live" && phaseRef.current !== "live") {
      burstRef.current = 1
    }
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    const context2d = canvasEl.getContext("2d")
    if (!context2d) return

    const canvas: HTMLCanvasElement = canvasEl
    const context: CanvasRenderingContext2D = context2d

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let animationFrame = 0
    const pointer = { x: -9999, y: -9999, active: false }

    function resize() {
      const parent = canvas.parentElement
      if (!parent) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent.clientWidth
      height = parent.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      const targetCount = Math.min(110, Math.max(40, Math.round((width * height) / 16000)))
      particles = Array.from({ length: targetCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 1 + Math.random() * 1.8,
        hueMix: Math.random(),
        twinklePhase: Math.random() * Math.PI * 2,
      }))
    }

    function step(time: number) {
      context.clearRect(0, 0, width, height)

      const charging = phaseRef.current === "charging"
      const speed = charging ? 2.4 : 1
      const centerX = width / 2
      const centerY = height * 0.42
      const burst = burstRef.current

      if (burst > 0) {
        burstRef.current = Math.max(0, burst - 0.02)
      }

      for (const particle of particles) {
        if (charging) {
          // Drift slightly toward the center while charging.
          particle.vx += (centerX - particle.x) * 0.00002
          particle.vy += (centerY - particle.y) * 0.00002
        }

        if (burst > 0) {
          const dx = particle.x - centerX
          const dy = particle.y - centerY
          const dist = Math.max(40, Math.hypot(dx, dy))
          particle.vx += (dx / dist) * burst * 0.6
          particle.vy += (dy / dist) * burst * 0.6
        }

        particle.x += particle.vx * speed
        particle.y += particle.vy * speed

        // Gentle friction keeps burst velocities from persisting.
        particle.vx *= 0.995
        particle.vy *= 0.995

        if (particle.x < -20) particle.x = width + 20
        if (particle.x > width + 20) particle.x = -20
        if (particle.y < -20) particle.y = height + 20
        if (particle.y > height + 20) particle.y = -20
      }

      context.lineWidth = 1

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i]!

        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j]!
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distSq = dx * dx + dy * dy

          if (distSq > LINK_DISTANCE * LINK_DISTANCE) continue

          const dist = Math.sqrt(distSq)
          const alpha = (1 - dist / LINK_DISTANCE) * (charging ? 0.4 : 0.22)
          const blue = (a.hueMix + b.hueMix) / 2 > 0.82

          context.strokeStyle = blue
            ? `rgba(96, 165, 250, ${alpha})`
            : `rgba(201, 162, 39, ${alpha})`
          context.beginPath()
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.stroke()
        }

        if (pointer.active) {
          const dx = a.x - pointer.x
          const dy = a.y - pointer.y
          const dist = Math.hypot(dx, dy)

          if (dist < POINTER_LINK_DISTANCE) {
            const alpha = (1 - dist / POINTER_LINK_DISTANCE) * 0.35
            context.strokeStyle = `rgba(232, 213, 163, ${alpha})`
            context.beginPath()
            context.moveTo(a.x, a.y)
            context.lineTo(pointer.x, pointer.y)
            context.stroke()
          }
        }
      }

      for (const particle of particles) {
        const twinkle = 0.55 + 0.45 * Math.sin(time * 0.0012 + particle.twinklePhase)
        const blue = particle.hueMix > 0.82

        context.fillStyle = blue
          ? `rgba(147, 197, 253, ${0.5 * twinkle})`
          : `rgba(232, 213, 163, ${0.65 * twinkle})`
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      }

      animationFrame = window.requestAnimationFrame(step)
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active = true
    }

    function handlePointerLeave() {
      pointer.active = false
    }

    resize()
    window.addEventListener("resize", resize)

    if (reducedMotion) {
      // Draw a single static frame for reduced-motion users.
      step(0)
      window.cancelAnimationFrame(animationFrame)
    } else {
      animationFrame = window.requestAnimationFrame(step)
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerleave", handlePointerLeave)
    }

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerleave", handlePointerLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    />
  )
}

export function DigitalLaunchScreen() {
  const [phase, setPhase] = useState<LaunchPhase>("ready")
  const [burstKey, setBurstKey] = useState(0)

  useEffect(() => {
    if (phase !== "charging") return

    const timer = window.setTimeout(() => {
      setPhase("live")
    }, 2200)

    return () => window.clearTimeout(timer)
  }, [phase])

  function handleLaunch() {
    if (phase !== "ready") return
    setBurstKey((value) => value + 1)
    setPhase("charging")
  }

  function handleReset() {
    setPhase("ready")
  }

  return (
    <div
      className={cn(
        displayFont.variable,
        bodyFont.variable,
        "relative min-h-dvh overflow-hidden text-[#f4efe2]",
        bodyFont.className,
      )}
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% -10%, rgba(201,162,39,0.18), transparent 55%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(30,64,175,0.25), transparent 50%), linear-gradient(165deg, #020617 0%, #07111f 42%, #0a1628 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,213,163,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(232,213,163,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      <ParticleField phase={phase} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent"
      />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-[42%] size-[min(90vw,40rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a227]/20",
          phase === "charging" && "animate-launch-pulse",
          phase === "live" && "scale-150 opacity-0 transition-all duration-[1600ms] ease-out",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-[42%] size-[min(70vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a227]/25",
          phase === "charging" && "animate-launch-pulse-delayed",
          phase === "live" && "scale-[1.8] opacity-0 transition-all duration-[1800ms] ease-out",
        )}
      />

      {burstKey > 0 ? (
        <div
          key={burstKey}
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-launch-flash bg-[radial-gradient(circle_at_center,rgba(232,213,163,0.45),transparent_55%)]"
        />
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src={`${PNP_LOGO.src}?v=${COMMAND_ICON_VERSION}`}
              alt={PNP_LOGO.alt}
              width={48}
              height={66}
              unoptimized
              priority
              className="h-12 w-auto object-contain drop-shadow-[0_0_18px_rgba(201,162,39,0.25)]"
            />
            <Image
              src={`${PRO4A_LOGO.src}?v=${COMMAND_ICON_VERSION}`}
              alt={PRO4A_LOGO.alt}
              width={48}
              height={54}
              unoptimized
              priority
              className="h-11 w-auto object-contain"
            />
          </div>
          <p className="hidden text-right text-[11px] uppercase tracking-[0.28em] text-[#e8d5a3]/70 sm:block">
            Police Regional Office 4A
            <br />
            <span className="text-[#e8d5a3]/45">CALABARZON</span>
          </p>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center pb-8 pt-6 text-center">
          <div
            className={cn(
              "mb-6 w-full max-w-xl transition-all duration-700",
              phase === "live" && "scale-[1.04]",
            )}
          >
            <Image
              src={`${COMMAND_BRAND.src}?v=${COMMAND_BRAND_VERSION}`}
              alt={COMMAND_BRAND.alt}
              width={COMMAND_BRAND.width}
              height={COMMAND_BRAND.height}
              unoptimized
              priority
              className="mx-auto h-auto w-full max-w-[22rem] drop-shadow-[0_20px_60px_rgba(201,162,39,0.22)] sm:max-w-[28rem]"
            />
          </div>

          <p
            className={cn(
              displayFont.className,
              "text-[11px] font-semibold uppercase tracking-[0.42em] text-[#c9a227] sm:text-xs",
            )}
          >
            Official Digital Launching
          </p>

          <h1
            className={cn(
              displayFont.className,
              "mt-3 max-w-3xl text-3xl font-semibold tracking-wide text-[#f7f1e4] sm:text-5xl",
            )}
          >
            {PRO4A_APP_TITLE}
          </h1>

          <p className="mt-3 max-w-xl text-sm text-[#d7d0c0]/80 sm:text-base">
            {PRO4A_APP_TAGLINE}. One Command. One Picture. One Mission.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col items-center gap-4">
            {phase === "ready" ? (
              <>
                <button
                  type="button"
                  onClick={handleLaunch}
                  className={cn(
                    displayFont.className,
                    "group relative isolate flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full",
                    "bg-gradient-to-b from-[#e8d5a3] via-[#c9a227] to-[#8a6b12]",
                    "text-sm font-bold tracking-[0.18em] text-[#1a1408]",
                    "shadow-[0_0_0_8px_rgba(201,162,39,0.12),0_0_40px_rgba(201,162,39,0.35)]",
                    "transition-transform duration-300 hover:scale-105 active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8d5a3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]",
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute inset-[-14px] rounded-full border border-[#c9a227]/40 group-hover:animate-launch-ring"
                  />
                  LAUNCH
                </button>
                <p className="text-xs uppercase tracking-[0.28em] text-[#e8d5a3]/55">
                  For the Regional Director
                </p>
              </>
            ) : null}

            {phase === "charging" ? (
              <div className="space-y-3">
                <p
                  className={cn(
                    displayFont.className,
                    "animate-pulse text-lg tracking-[0.3em] text-[#e8d5a3]",
                  )}
                >
                  LAUNCHING
                </p>
                <p className="text-sm text-[#d7d0c0]/70">Activating PRO4A COMMAND systems…</p>
              </div>
            ) : null}

            {phase === "live" ? (
              <div className="animate-launch-rise space-y-5">
                <p
                  className={cn(
                    displayFont.className,
                    "text-xl tracking-[0.2em] text-[#e8d5a3] sm:text-2xl",
                  )}
                >
                  NOW LIVE
                </p>
                <p className="text-sm text-[#d7d0c0]/80">
                  PRO4A COMMAND is officially launched.
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/pro4a-status"
                    className={cn(
                      displayFont.className,
                      "inline-flex h-12 items-center justify-center rounded-full px-8 text-xs font-semibold tracking-[0.22em]",
                      "bg-[#c9a227] text-[#1a1408] transition-opacity hover:opacity-90",
                    )}
                  >
                    ENTER DASHBOARD
                  </Link>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs uppercase tracking-[0.22em] text-[#e8d5a3]/55 underline-offset-4 hover:text-[#e8d5a3] hover:underline"
                  >
                    Launch again
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </main>

        <footer className="flex flex-col items-center gap-1 text-center text-[10px] uppercase tracking-[0.24em] text-[#e8d5a3]/35 sm:flex-row sm:justify-between sm:text-left">
          <span>Assess · Adapt · Active · Achieve</span>
          <span>PRO CALABARZON</span>
        </footer>
      </div>
    </div>
  )
}
