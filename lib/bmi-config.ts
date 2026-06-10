export const BMI_CATEGORIES = [
  { id: "underweight", label: "Underweight" },
  { id: "normal", label: "Normal BMI" },
  { id: "acceptable", label: "Acceptable BMI" },
  { id: "overweight", label: "Overweight" },
  { id: "obese-1", label: "Obese Class 1" },
  { id: "obese-2", label: "Obese Class 2" },
  { id: "obese-3", label: "Obese Class 3" },
] as const

export type BmiCategoryId = (typeof BMI_CATEGORIES)[number]["id"]

/** PNP-style BMI brackets when only numeric BMI is available. */
export function getBmiCategoryFromValue(bmi: number): BmiCategoryId | null {
  if (!Number.isFinite(bmi) || bmi <= 0) return null
  if (bmi < 18.5) return "underweight"
  if (bmi < 23) return "normal"
  if (bmi < 25) return "acceptable"
  if (bmi < 30) return "overweight"
  if (bmi < 35) return "obese-1"
  if (bmi < 40) return "obese-2"
  return "obese-3"
}

export function getBmiCategoryFromLabel(value: string): BmiCategoryId | null {
  const normalized = value.trim().toUpperCase()
  if (!normalized) return null

  if (/UNDER/.test(normalized)) return "underweight"
  if (/NORMAL/.test(normalized)) return "normal"
  if (/ACCEPT/.test(normalized)) return "acceptable"
  if (/OVER/.test(normalized) && !/OBESE/.test(normalized)) return "overweight"
  if (/OBESE.*(3|III)|CLASS\s*3/.test(normalized)) return "obese-3"
  if (/OBESE.*(2|II)|CLASS\s*2/.test(normalized)) return "obese-2"
  if (/OBESE|CLASS\s*1/.test(normalized)) return "obese-1"

  return null
}

export function calculateBmi(weightKg: number, heightInput: number) {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightInput) || weightKg <= 0 || heightInput <= 0) {
    return null
  }

  const heightM = heightInput > 3 ? heightInput / 100 : heightInput
  if (heightM <= 0) return null

  return weightKg / (heightM * heightM)
}
