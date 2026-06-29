"use client"

import { useCallback, useRef, useState, type ReactNode } from "react"

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
}

export function SwipeCarousel({
  slides,
  swipeHint,
  ariaLabel = "Swipe carousel",
  className,
  navigation = "dots",
}: SwipeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
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

  if (slides.length === 0) return null

  return (
    <div className={cn("space-y-3", className)}>
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
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label={ariaLabel}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            data-slide
            className="w-full shrink-0 snap-center snap-always px-0.5"
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
