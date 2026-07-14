"use client"

import { AlertCircleIcon, FileSpreadsheetIcon, Loader2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type UploadConfirmPhase = "confirm" | "uploading"

export type UploadConfirmDialogProps = {
  open: boolean
  filename: string | null
  phase: UploadConfirmPhase
  error: string | null
  progress: string | null
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
  onOpenChange: (open: boolean) => void
}

export function UploadConfirmDialog({
  open,
  filename,
  phase,
  error,
  progress,
  isPending,
  onConfirm,
  onCancel,
  onOpenChange,
}: UploadConfirmDialogProps) {
  const isUploading = phase === "uploading" && isPending

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isUploading) {
      return
    }

    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isUploading} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUploading ? "Uploading to Supabase" : "Confirm Upload"}
          </DialogTitle>
          <DialogDescription>
            {isUploading
              ? "Huwag isara ang page habang ina-upload ang data."
              : "Siguraduhin na tama ang file bago magpatuloy."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {filename ? (
            <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3">
              <FileSpreadsheetIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">Selected file</p>
                <Badge variant="outline" className="max-w-full truncate">
                  {filename}
                </Badge>
              </div>
            </div>
          ) : null}

          {isUploading ? (
            <div className="flex items-center gap-3 rounded-lg border border-sky-500/25 bg-sky-500/10 p-4 text-sm">
              <Loader2Icon className="size-5 shrink-0 animate-spin text-primary" aria-hidden />
              <p className="text-foreground">{progress ?? "Ina-upload ang data..."}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              I-upload ang file na ito sa Supabase? Maaaring pumalit ang kasalukuyang dashboard data
              kapag matagumpay ang upload.
            </p>
          )}

          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>{error}</p>
            </div>
          ) : null}
        </DialogBody>

        <DialogFooter className="sm:flex-row sm:justify-end">
          {isUploading ? (
            <Button type="button" variant="outline" disabled>
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
              Uploading...
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onCancel}>
                No, Cancel
              </Button>
              <Button type="button" onClick={onConfirm}>
                Yes, Upload
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
