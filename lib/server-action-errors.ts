const SERVER_ACTION_NOT_FOUND_PATTERNS = [
  /failed to find server action/i,
  /server action .* was not found/i,
  /might be from an older or newer deployment/i,
]

export function isServerActionNotFoundError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "")
  return SERVER_ACTION_NOT_FOUND_PATTERNS.some((pattern) => pattern.test(message))
}

export function formatServerActionError(error: unknown, fallback: string) {
  if (isServerActionNotFoundError(error)) {
    return "May bagong update ang app. I-hard refresh ang page (Ctrl+Shift+R) o mag-logout/login ulit, tapos subukan muli."
  }

  return error instanceof Error ? error.message : fallback
}
