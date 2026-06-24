import Link from "next/link"
import { ArrowRight } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type OfficeModuleLink = {
  title: string
  href: string
  description: string
}

type OfficeModuleHubProps = {
  title: string
  description: string
  modules: OfficeModuleLink[]
}

export function OfficeModuleHub({ title, description, modules }: OfficeModuleHubProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className="group block h-full">
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/40">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {module.title}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
