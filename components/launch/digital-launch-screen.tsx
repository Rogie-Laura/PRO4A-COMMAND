"use client"

import { useEffect, useState } from "react"
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
