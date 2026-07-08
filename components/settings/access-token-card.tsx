"use client"

import { useMemo, useState, useTransition } from "react"
import { CheckIcon, CopyIcon, KeyRoundIcon, QrCodeIcon, ShieldOffIcon } from "lucide-react"
import QRCode from "react-qr-code"

import {
  createAccessTokenAction,
  getAccessTokenQrUrlAction,
  revokeAccessTokenAction,
} from "@/app/(dashboard)/settings/actions"
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
import {
  ACCESS_KEY_ROLES,
  OFFICER_EXPIRATION_OPTIONS,
  roleRequiresExpiration,
  type AccessKeyRole,
} from "@/lib/auth/roles"
import { DIVISION_UPLOAD_OPTIONS } from "@/lib/division-scope"
import type { DivisionId } from "@/lib/division-scope"
import { formatPhilippinesDateTime } from "@/lib/format-datetime"
import type { AccessTokenListItem } from "@/lib/access-tokens"
import { cn } from "@/lib/utils"

type AccessTokenCardProps = {
  initialTokens: AccessTokenListItem[]
}

function roleLabel(role: AccessKeyRole, divisionScope?: DivisionId | null) {
  if (role === "super_admin") return "Super Admin"
  if (role === "division_uploader") {
    const division = DIVISION_UPLOAD_OPTIONS.find((item) => item.id === divisionScope)
    return division ? `Focal · ${division.label}` : "Focal Person"
  }
  return "Officer"
}

function expiryLabel(token: AccessTokenListItem) {
  if (token.role === "super_admin") {
    return "Lifetime"
  }

  if (!token.expires_at) {
    return "No expiry set"
  }

  return `Expires ${formatPhilippinesDateTime(token.expires_at)}`
}

export function AccessTokenCard({ initialTokens }: AccessTokenCardProps) {
  const [tokens, setTokens] = useState(initialTokens)
  const [label, setLabel] = useState("")
  const [role, setRole] = useState<AccessKeyRole>("officer")
  const [divisionScope, setDivisionScope] = useState<DivisionId>("rlrdd")
  const [officerExpirationDays, setOfficerExpirationDays] = useState<number>(
    OFFICER_EXPIRATION_OPTIONS[1].days,
  )
  const [error, setError] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [newTokenRole, setNewTokenRole] = useState<AccessKeyRole>("officer")
  const [copied, setCopied] = useState(false)
  const [viewQrLabel, setViewQrLabel] = useState<string | null>(null)
  const [viewQrUrl, setViewQrUrl] = useState<string | null>(null)
  const [viewQrError, setViewQrError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const loginQrUrl = useMemo(() => {
    if (!newToken) return null
    return buildLoginUrl(newToken, window.location.origin)
  }, [newToken])

  function handleCreate() {
    setError(null)

    startTransition(async () => {
      try {
        const result = await createAccessTokenAction(
          label,
          role,
          roleRequiresExpiration(role) ? officerExpirationDays : undefined,
          role === "division_uploader" ? divisionScope : undefined,
        )
        setTokens((current) => [result.record, ...current])
        setLabel("")
        setNewToken(result.token)
        setNewTokenRole(result.record.role)
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

  function handleViewQr(token: AccessTokenListItem) {
    setViewQrError(null)
    setViewQrLabel(token.label)
    setViewQrUrl(null)

    startTransition(async () => {
      try {
        const result = await getAccessTokenQrUrlAction(token.id)
        setViewQrUrl(result.loginUrl)
      } catch (qrError) {
        setViewQrError(
          qrError instanceof Error ? qrError.message : "Unable to load login QR.",
        )
      }
    })
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
            Super Admin keys are lifetime with Settings access. Officer keys expire and cannot open
            Settings. Division focal tokens are scoped to one R-staff division with upload access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3">
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Label (e.g. Boss Office, Admin - Rogie)"
              disabled={isPending}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium">Key Type</span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as AccessKeyRole)}
                  disabled={isPending}
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {ACCESS_KEY_ROLES.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="block text-xs text-muted-foreground">
                  {ACCESS_KEY_ROLES.find((option) => option.id === role)?.description}
                </span>
              </label>

              {roleRequiresExpiration(role) ? (
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Expiration</span>
                  <select
                    value={officerExpirationDays}
                    onChange={(event) => setOfficerExpirationDays(Number(event.target.value))}
                    disabled={isPending}
                    className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    {OFFICER_EXPIRATION_OPTIONS.map((option) => (
                      <option key={option.days} value={option.days}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="flex items-center rounded-lg border border-dashed bg-muted/15 px-3 text-sm text-muted-foreground">
                  Lifetime · no expiration
                </div>
              )}
            </div>

            {role === "division_uploader" ? (
              <label className="space-y-2 text-sm">
                <span className="font-medium">Division Scope</span>
                <select
                  value={divisionScope}
                  onChange={(event) => setDivisionScope(event.target.value as DivisionId)}
                  disabled={isPending}
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {DIVISION_UPLOAD_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="block text-xs text-muted-foreground">
                  Focal person can access this division only, plus Upload File and theme settings.
                </span>
              </label>
            ) : null}

            <Button onClick={handleCreate} disabled={isPending || !label.trim()}>
              {isPending ? "Creating..." : "Create Token"}
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="space-y-3">
            {tokens.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                No access tokens yet.
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
                      <Badge
                        variant={token.role === "super_admin" ? "default" : "secondary"}
                      >
                        {roleLabel(token.role, token.division_scope)}
                      </Badge>
                      <Badge variant={token.is_active ? "outline" : "secondary"}>
                        {token.is_active ? "Active" : "Revoked"}
                      </Badge>
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">
                      {token.key_prefix}••••••••
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expiryLabel(token)}
                      {" · "}
                      Created {formatPhilippinesDateTime(token.created_at)}
                      {token.last_used_at
                        ? ` · Last used ${formatPhilippinesDateTime(token.last_used_at)}`
                        : ""}
                    </p>
                  </div>

                  {token.is_active ? (
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewQr(token)}
                        disabled={isPending || !token.has_qr}
                        title={
                          token.has_qr
                            ? "View login QR"
                            : "QR available only for newly created keys"
                        }
                      >
                        <QrCodeIcon />
                        View QR
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(token.id)}
                        disabled={isPending}
                      >
                        <ShieldOffIcon />
                        Revoke
                      </Button>
                    </div>
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
            <DialogTitle>
              {newTokenRole === "super_admin"
                ? "Super Admin Key Created"
                : newTokenRole === "division_uploader"
                  ? "Division Focal Token Created"
                  : "Officer Key Created"}
            </DialogTitle>
            <DialogDescription>
              Save this key now. You can open the login QR again anytime from Settings.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {loginQrUrl ? (
              <div className="mx-auto flex w-fit flex-col items-center gap-3 rounded-xl border bg-white p-4">
                <QRCode value={loginQrUrl} size={180} />
                <div className="flex items-center gap-2 text-xs font-medium text-black">
                  <QrCodeIcon className="size-4" />
                  Login QR
                </div>
              </div>
            ) : null}
            <div
              className={cn(
                "rounded-lg border bg-muted/30 p-3 font-mono text-sm break-all",
                newTokenRole === "officer" && "select-all",
              )}
            >
              {newToken}
            </div>
            <p className="text-xs text-muted-foreground">
              {newTokenRole === "super_admin"
                ? "Lifetime key · Settings access · save in a secure note."
                : newTokenRole === "division_uploader"
                  ? "Division focal key · scoped upload access · theme settings only · expires based on selected duration."
                  : "Officer key · dashboard only · Settings hidden · expires based on selected duration."}
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

      <Dialog
        open={Boolean(viewQrLabel)}
        onOpenChange={(open) => {
          if (!open) {
            setViewQrLabel(null)
            setViewQrUrl(null)
            setViewQrError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{viewQrLabel ? `${viewQrLabel} — Login QR` : "Login QR"}</DialogTitle>
            <DialogDescription>
              I-scan o i-print ang QR para sa mabilis na login.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {viewQrError ? <p className="text-sm text-destructive">{viewQrError}</p> : null}
            {viewQrUrl ? (
              <div className="mx-auto flex w-fit flex-col items-center gap-3 rounded-xl border bg-white p-4">
                <QRCode value={viewQrUrl} size={200} />
                <p className="max-w-[220px] text-center text-xs text-black/70 break-all">
                  {viewQrUrl}
                </p>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">Loading QR...</p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewQrLabel(null)
                setViewQrUrl(null)
                setViewQrError(null)
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
