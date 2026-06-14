import Image from "next/image"

import { COMMAND_BRAND } from "@/lib/brand-config"
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
      src={COMMAND_BRAND.src}
      alt={COMMAND_BRAND.alt}
      width={COMMAND_BRAND.width}
      height={COMMAND_BRAND.height}
      priority={priority}
      className={cn("h-auto w-full", className)}
    />
  )
}
