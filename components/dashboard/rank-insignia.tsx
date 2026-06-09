"use client"

import Image from "next/image"
import { useState } from "react"

import { getRankInsigniaPath } from "@/lib/leadership-config"
import { getRankInsigniaScale, getRankInsigniaTint } from "@/lib/rank-config"
import { cn } from "@/lib/utils"

type RankInsigniaProps = {
  rank: string
  className?: string
}

const INSIGNIA_SIZE = 48

export function RankInsignia({ rank, className }: RankInsigniaProps) {
  const [hasError, setHasError] = useState(false)
  const src = getRankInsigniaPath(rank)
  const scale = getRankInsigniaScale(rank)
  const tint = getRankInsigniaTint(rank)

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
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center",
        className,
      )}
    >
      <Image
        src={src}
        alt={`${rank} insignia`}
        width={INSIGNIA_SIZE}
        height={INSIGNIA_SIZE}
        className={cn(
          "rank-insignia-image object-contain",
          tint === "colonel" && "rank-insignia-image--colonel",
          tint === "general" && "rank-insignia-image--general",
        )}
        style={{
          width: INSIGNIA_SIZE,
          height: INSIGNIA_SIZE,
          transform: `scale(${scale})`,
        }}
        onError={() => setHasError(true)}
      />
    </span>
  )
}
