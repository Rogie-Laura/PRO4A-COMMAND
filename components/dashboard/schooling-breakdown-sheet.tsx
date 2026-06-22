"use client"

import { SchoolingCourseBreakdown } from "@/components/dashboard/schooling-course-breakdown"
import { SchoolingSubUnitBreakdown } from "@/components/dashboard/schooling-subunit-breakdown"
import { SwipeCarousel } from "@/components/dashboard/swipe-carousel"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SchoolingAnalytics } from "@/lib/schooling-types"

type SchoolingBreakdownSheetProps = {
  data: SchoolingAnalytics
  open: boolean
  onOpenChange: (open: boolean) => void
  coursesDotClassName?: string
  subUnitDotClassName?: string
}

export function SchoolingBreakdownSheet({
  data,
  open,
  onOpenChange,
  coursesDotClassName = "bg-indigo-500",
  subUnitDotClassName = "bg-violet-500",
}: SchoolingBreakdownSheetProps) {
  const hasCourses = (data.courseStats?.length ?? 0) > 0
  const hasSubUnits = (data.subUnitStats?.length ?? 0) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{data.title}</DialogTitle>
          <DialogDescription>
            {data.total.toLocaleString()} personnel on schooling · swipe between breakdowns
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {hasCourses || hasSubUnits ? (
            <SwipeCarousel
              swipeHint="Swipe for Courses Enrolled · by Sub-Unit"
              ariaLabel={`${data.title} breakdowns`}
              slides={[
                ...(hasCourses
                  ? [
                      {
                        id: `${data.title}-courses`,
                        label: "Courses Enrolled",
                        dotClassName: coursesDotClassName,
                        content: (
                          <SchoolingCourseBreakdown
                            items={data.courseStats}
                            records={data.records}
                            breakdownTitle="Courses Enrolled"
                          />
                        ),
                      },
                    ]
                  : []),
                ...(hasSubUnits
                  ? [
                      {
                        id: `${data.title}-sub-units`,
                        label: "by Sub-Unit",
                        dotClassName: subUnitDotClassName,
                        content: (
                          <SchoolingSubUnitBreakdown
                            items={data.subUnitStats}
                            records={data.records}
                            breakdownTitle={`${data.title} by Sub-Unit`}
                          />
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Walang breakdown data para sa {data.title.toLowerCase()}.
            </p>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
