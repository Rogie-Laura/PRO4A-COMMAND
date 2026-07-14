"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export type SwipeCarouselSlide = {
  id: string
  label: string
  content: ReactNode
  dotClassName?: string
}

type SwipeCarouselProps = {
  slides: SwipeCarouselSlide[]
  swipeHint?: string
  ariaLabel?: string
  className?: string
  navigation?: "dots" | "toggle"
  /** Scroll the carousel into view when the active slide changes (fixes blank mid-page after swipe). */
  scrollToTopOnChange?: boolean
  /** Clip each slide so sticky/shadow content does not bleed into the next slide. */
  clipSlides?: boolean
}

export function SwipeCarousel({
  slides,
  swipeHint,
  ariaLabel = "Swipe carousel",
  className,
  navigation = "dots",
  scrollToTopOnChange = false,
  clipSlides = false,
}: SwipeCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const previousIndexRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)

  const updateActiveIndex = useCallback(() => {
    const container = scrollRef.current
    if (!container || container.clientWidth === 0) return

    const index = Math.round(container.scrollLeft / container.clientWidth)
    setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1))
  }, [slides.length])

  function scrollToIndex(index: number) {
    const container = scrollRef.current
    if (!container) return

    container.scrollTo({
      left: index * container.clientWidth,
      behavior: "smooth",
    })
    setActiveIndex(index)
  }

  useEffect(() => {
    if (!scrollToTopOnChange) return
    if (activeIndex === previousIndexRef.current) return

    previousIndexRef.current = activeIndex
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [activeIndex, scrollToTopOnChange])

  if (slides.length === 0) return null

  return (
    <div ref={rootRef} className={cn("scroll-mt-2 space-y-3", className)}>
      {navigation === "toggle" ? (
        <div
          className="flex rounded-lg border bg-muted/40 p-1"
          role="tablist"
          aria-label="Module selection"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              onClick={() => scrollToIndex(index)}
              className={cn(
                "min-w-0 flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                activeIndex === index
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {slide.label}
            </button>
          ))}
        </div>
      ) : null}

      {swipeHint ? (
        <p className="text-center text-xs text-muted-foreground">{swipeHint}</p>
      ) : null}

      <div
        ref={scrollRef}
        onScroll={updateActiveIndex}
        className="flex snap-x snap-mandatory items-start overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label={ariaLabel}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            data-slide
            aria-hidden={index !== activeIndex}
            className={cn(
              // `min-w-full basis-full` keeps each slide exactly one viewport wide inside the scroller
              "min-w-full shrink-0 grow-0 basis-full snap-start snap-always px-0.5",
              clipSlides && "overflow-hidden",
              index !== activeIndex && "pointer-events-none",
            )}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {navigation === "dots" ? (
        <div
          className="flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Carousel slides"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={slide.label}
              onClick={() => scrollToIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                activeIndex === index
                  ? cn("w-6", slide.dotClassName ?? "bg-primary")
                  : "w-2 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
