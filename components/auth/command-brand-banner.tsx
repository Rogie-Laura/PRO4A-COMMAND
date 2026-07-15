import Image from "next/image"

import { COMMAND_BRAND, COMMAND_BRAND_VERSION } from "@/lib/brand-config"
import { cn } from "@/lib/utils"

type CommandBrandBannerProps = {
  className?: string
  priority?: boolean
}

export function CommandBrandBanner({
  className,
  priority = false,
}: CommandBrandBannerProps) {
  return (
    <Image
      src={`${COMMAND_BRAND.src}?v=${COMMAND_BRAND_VERSION}`}
      alt={COMMAND_BRAND.alt}
      width={COMMAND_BRAND.width}
      height={COMMAND_BRAND.height}
      priority={priority}
      unoptimized
      className={cn("h-auto w-full", className)}
    />
  )
}
