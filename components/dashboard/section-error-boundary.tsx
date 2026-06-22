"use client"

import { Component, type ReactNode } from "react"

import { AlertCircle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type Props = {
  children: ReactNode
  label?: string
}

type State = {
  hasError: boolean
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
          <CardContent className="flex items-center gap-3 py-5 text-sm text-muted-foreground">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              {this.props.label
                ? `${this.props.label} section failed to load.`
                : "This section failed to load."}{" "}
              Try refreshing the page.
            </span>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
