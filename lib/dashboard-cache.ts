import { revalidatePath, updateTag as nextUpdateTag } from "next/cache"
import { after } from "next/server"

import { bumpDashboardRevision } from "@/lib/dashboard-revision"

export { revalidatePath }

/**
 * Same as next/cache updateTag, but also bumps the shared dashboard revision
 * so open viewers can auto-refresh without a manual click.
 */
export function updateTag(tag: string) {
  nextUpdateTag(tag)
  after(() => {
    void bumpDashboardRevision(`tag:${tag}`)
  })
}
