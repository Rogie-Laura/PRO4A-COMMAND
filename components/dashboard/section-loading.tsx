import { Skeleton } from "@/components/ui/skeleton"

type SectionLoadingProps = {
  label: string
}

export function SectionLoading({ label }: SectionLoadingProps) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={`Loading ${label}`}>
      <Skeleton className="h-5 w-48 rounded-md" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  )
}
