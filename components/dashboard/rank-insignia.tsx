"use client"

import Image from "next/image"
import { useState } from "react"

import { getRankInsigniaPath } from "@/lib/leadership-config"
import { cn } from "@/lib/utils"

type RankInsigniaProps = {
  rank: string
  className?: string
}

export function RankInsignia({ rank, className }: RankInsigniaProps) {
  const [hasError, setHasError] = useState(false)
  const src = getRankInsigniaPath(rank)

  if (hasError) {
    return (
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[10px] font-bold",
          className,
        )}
      >
        {rank}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={`${rank} insignia`}
      width={48}
      height={48}
      className={cn("size-12 shrink-0 object-contain", className)}
      onError={() => setHasError(true)}
    />
  )
}
