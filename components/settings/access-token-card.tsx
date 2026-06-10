"use client"

import { useMemo, useState, useTransition } from "react"
import { CheckIcon, CopyIcon, KeyRoundIcon, QrCodeIcon, ShieldOffIcon } from "lucide-react"
import QRCode from "react-qr-code"

import {
  createAccessTokenAction,
  revokeAccessTokenAction,
} from "@/app/settings/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { buildLoginUrl } from "@/lib/auth/login-url"
import { formatPhilippinesDateTime } from "@/lib/format-datetime"
import type { AccessTokenListItem } from "@/lib/access-tokens"

type AccessTokenCardProps = {
  initialTokens: AccessTokenListItem[]
}

export function AccessTokenCard({ initialTokens }: AccessTokenCardProps) {
  const [tokens, setTokens] = useState(initialTokens)
  const [label, setLabel] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const loginQrUrl = useMemo(() => {
    if (!newToken) return null
    return buildLoginUrl(newToken, window.location.origin)
  }, [newToken])

  function handleCreate() {
    setError(null)

    startTransition(async () => {
      try {
        const result = await createAccessTokenAction(label)
        setTokens((current) => [result.record, ...current])
        setLabel("")
        setNewToken(result.token)
        setCopied(false)
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : "Failed to create token.")
      }
    })
  }

  function handleRevoke(id: string) {
    setError(null)

    startTransition(async () => {
      try {
        await revokeAccessTokenAction(id)
        setTokens((current) =>
          current.map((token) =>
            token.id === id ? { ...token, is_active: false } : token,
          ),
        )
      } catch (revokeError) {
        setError(revokeError instanceof Error ? revokeError.message : "Failed to revoke token.")
      }
    })
  }

  async function handleCopy() {
    if (!newToken) return

    await navigator.clipboard.writeText(newToken)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRoundIcon className="size-5 text-primary" />
            Access Tokens
          </CardTitle>
          <CardDescription>
            Create access keys for users. Save your own admin key and QR when created — you will
            need them again if your session expires.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Token label (e.g. Command Analytics)"
              disabled={isPending}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleCreate()
                }
              }}
            />
            <Button onClick={handleCreate} disabled={isPending || !label.trim()}>
              {isPending ? "Creating..." : "Create Token"}
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="space-y-3">
            {tokens.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                Walang access token pa. Gumawa ng bago gamit ang label sa taas.
              </p>
            ) : (
              tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex flex-col gap-3 rounded-lg border bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{token.label}</p>
                      <Badge variant={token.is_active ? "default" : "secondary"}>
                        {token.is_active ? "Active" : "Revoked"}
                      </Badge>
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">
                      {token.key_prefix}••••••••
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatPhilippinesDateTime(token.created_at)}
                      {token.last_used_at
                        ? ` · Last used ${formatPhilippinesDateTime(token.last_used_at)}`
                        : ""}
                    </p>
                  </div>

                  {token.is_active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(token.id)}
                      disabled={isPending}
                      className="shrink-0"
                    >
                      <ShieldOffIcon />
                      Revoke
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(newToken)}
        onOpenChange={(open) => {
          if (!open) setNewToken(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Para sa boss — i-save o i-print ang QR</DialogTitle>
            <DialogDescription>
              Makikita mo lang ang buong key ng isang beses. Pinakamadali para sa boss: i-scan ang
              QR sa login page, o i-print at ilagay sa desk.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {loginQrUrl ? (
              <div className="mx-auto flex w-fit flex-col items-center gap-3 rounded-xl border bg-white p-4">
                <QRCode value={loginQrUrl} size={180} />
                <div className="flex items-center gap-2 text-xs font-medium text-black">
                  <QrCodeIcon className="size-4" />
                  Boss Login QR
                </div>
              </div>
            ) : null}
            <div className="rounded-lg border bg-muted/30 p-3 font-mono text-sm break-all">
              {newToken}
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: I-install ang PRO4A app sa home screen pagkatapos mag-login. Sunod, click icon na
              lang — hindi na kailangan mag-scan ulit.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewToken(null)}>
              Done
            </Button>
            <Button onClick={handleCopy}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy Token"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
