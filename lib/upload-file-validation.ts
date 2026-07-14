export const UPLOAD_FORMAT_ERROR = "Error! Please upload the correct format."

export function validateXlsxFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return UPLOAD_FORMAT_ERROR
  }

  return null
}

export function validateXlsxOrXlsmFile(file: File): string | null {
  const lower = file.name.toLowerCase()
  if (!lower.endsWith(".xlsx") && !lower.endsWith(".xlsm")) {
    return UPLOAD_FORMAT_ERROR
  }

  return null
}
