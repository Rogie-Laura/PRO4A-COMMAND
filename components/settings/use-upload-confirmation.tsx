"use client"

import { useCallback, useMemo, useState, useTransition } from "react"

import { UploadConfirmDialog, type UploadConfirmPhase } from "@/components/settings/upload-confirm-dialog"

type UploadConfirmationState = {
  open: boolean
  file: File | null
  phase: UploadConfirmPhase
  error: string | null
  progress: string | null
}

type UseUploadConfirmationOptions = {
  validateFile: (file: File) => string | null
  onUpload: (
    file: File,
    helpers: {
      setProgress: (message: string | null) => void
    },
  ) => Promise<void>
}

const INITIAL_STATE: UploadConfirmationState = {
  open: false,
  file: null,
  phase: "confirm",
  error: null,
  progress: null,
}

export function useUploadConfirmation({
  validateFile,
  onUpload,
}: UseUploadConfirmationOptions) {
  const [state, setState] = useState<UploadConfirmationState>(INITIAL_STATE)
  const [isPending, startTransition] = useTransition()

  const resetDialog = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  const openConfirmation = useCallback((file: File) => {
    setState({
      open: true,
      file,
      phase: "confirm",
      error: null,
      progress: null,
    })
  }, [])

  const handleCancel = useCallback(() => {
    if (isPending) return
    resetDialog()
  }, [isPending, resetDialog])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleCancel()
      }
    },
    [handleCancel],
  )

  const handleConfirm = useCallback(() => {
    if (!state.file || isPending) return

    const validationError = validateFile(state.file)
    if (validationError) {
      setState((current) => ({
        ...current,
        error: validationError,
        phase: "confirm",
        progress: null,
      }))
      return
    }

    const file = state.file
    setState((current) => ({
      ...current,
      phase: "uploading",
      error: null,
      progress: null,
    }))

    startTransition(async () => {
      try {
        await onUpload(file, {
          setProgress: (progress) => {
            setState((current) => ({ ...current, progress }))
          },
        })
        resetDialog()
      } catch (uploadError) {
        setState((current) => ({
          ...current,
          phase: "confirm",
          progress: null,
          error:
            uploadError instanceof Error
              ? uploadError.message
              : "Hindi natapos ang upload. Subukan ulit.",
        }))
      }
    })
  }, [isPending, onUpload, resetDialog, state.file, validateFile])

  const confirmDialog = useMemo(
    () => (
      <UploadConfirmDialog
        open={state.open}
        filename={state.file?.name ?? null}
        phase={state.phase}
        error={state.error}
        progress={state.progress}
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onOpenChange={handleOpenChange}
      />
    ),
    [
      handleCancel,
      handleConfirm,
      handleOpenChange,
      isPending,
      state.error,
      state.file,
      state.open,
      state.phase,
      state.progress,
    ],
  )

  return {
    isPending,
    openConfirmation,
    confirmDialog,
  }
}
