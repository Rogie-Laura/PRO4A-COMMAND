import {
  COMMAND_ICON_VERSION,
  PRO4A_APP_TAGLINE,
  PRO4A_APP_TITLE,
  PRO4A_LOGO,
} from "@/lib/brand-config"
import { cn } from "@/lib/utils"

type AppBrandMarkProps = {
  className?: string
  showText?: boolean
  priority?: boolean
}

export function AppBrandMark({
  className,
  showText = true,
  priority = false,
}: AppBrandMarkProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      {/* Plain img so desktop always loads PRO4A.png without Next/Image caching issues. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${PRO4A_LOGO.src}?v=${COMMAND_ICON_VERSION}`}
        alt={PRO4A_LOGO.alt}
        width={36}
        height={40}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className="size-9 shrink-0 object-contain"
      />
      {showText ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">{PRO4A_APP_TITLE}</p>
          <p className="truncate text-xs text-muted-foreground">{PRO4A_APP_TAGLINE}</p>
        </div>
      ) : null}
    </div>
  )
}
