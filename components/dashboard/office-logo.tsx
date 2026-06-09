"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

type OfficeLogoProps = {
  src: string
  alt: string
  fallback: string
  colorClass: string
}

export function OfficeLogo({ src, alt, fallback, colorClass }: OfficeLogoProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center text-[10px] font-bold text-white",
          colorClass,
        )}
      >
        {fallback}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={36}
      height={36}
      className="size-9 shrink-0 object-contain"
      onError={() => setHasError(true)}
    />
  )
}
