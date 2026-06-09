"use client"

import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  {
    id: "dark",
    label: "Dark Mode",
    description: "Default PRO4A COMMAND theme",
    icon: MoonIcon,
  },
  {
    id: "light",
    label: "Light Mode",
    description: "Bright layout for daytime use",
    icon: SunIcon,
  },
] as const

export function ThemeSettingsCard() {
  const { theme, setTheme } = useTheme()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  const activeTheme = theme === "light" ? "light" : "dark"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Choose how PRO4A COMMAND looks on your device</CardDescription>
      </CardHeader>
      <CardContent>
        {!ready ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-lg bg-muted/50" />
            <div className="h-24 animate-pulse rounded-lg bg-muted/50" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon
              const selected = activeTheme === option.id

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg",
                      selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
