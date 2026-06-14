import type { MetadataRoute } from "next"

import { COMMAND_BRAND_BG, COMMAND_ICON_VERSION } from "@/lib/brand-config"

const icon192 = `/icons/icon-192.png?v=${COMMAND_ICON_VERSION}`
const icon512 = `/icons/icon-512.png?v=${COMMAND_ICON_VERSION}`

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PRO4A COMMAND",
    short_name: "PRO4A",
    id: "/?source=pwa",
    description: "PRO CALABARZON personnel analytics dashboard",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: COMMAND_BRAND_BG,
    theme_color: COMMAND_BRAND_BG,
    orientation: "any",
    icons: [
      {
        src: icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
