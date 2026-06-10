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

export const BMI_CATEGORY_GLASS: Record<BmiCategoryId, string> = {
  underweight:
    "border-sky-400/35 bg-sky-500/15 backdrop-blur-md shadow-sm dark:border-sky-400/25 dark:bg-sky-500/10",
  normal:
    "border-emerald-400/35 bg-emerald-500/15 backdrop-blur-md shadow-sm dark:border-emerald-400/25 dark:bg-emerald-500/10",
  acceptable:
    "border-teal-400/35 bg-teal-500/15 backdrop-blur-md shadow-sm dark:border-teal-400/25 dark:bg-teal-500/10",
  overweight:
    "border-amber-400/35 bg-amber-500/15 backdrop-blur-md shadow-sm dark:border-amber-400/25 dark:bg-amber-500/10",
  "obese-1":
    "border-orange-400/35 bg-orange-500/15 backdrop-blur-md shadow-sm dark:border-orange-400/25 dark:bg-orange-500/10",
  "obese-2":
    "border-rose-400/35 bg-rose-500/15 backdrop-blur-md shadow-sm dark:border-rose-400/25 dark:bg-rose-500/10",
  "obese-3":
    "border-red-500/35 bg-red-500/15 backdrop-blur-md shadow-sm dark:border-red-500/25 dark:bg-red-500/10",
}

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
  if (!normalized || normalized.startsWith("#")) return null

  if (/^UW$/.test(normalized)) return "underweight"
  if (/^N$/.test(normalized)) return "normal"
  if (/^AC$/.test(normalized)) return "acceptable"
  if (/^OW$/.test(normalized)) return "overweight"
  if (/^OB\s*3$/.test(normalized)) return "obese-3"
  if (/^OB\s*2$/.test(normalized)) return "obese-2"
  if (/^OB\s*1$/.test(normalized)) return "obese-1"

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
