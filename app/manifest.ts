import type { MetadataRoute } from "next"

import { COMMAND_BRAND_BG } from "@/lib/brand-config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PRO4A COMMAND",
    short_name: "PRO4A",
    description: "PRO CALABARZON personnel analytics dashboard",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: COMMAND_BRAND_BG,
    theme_color: COMMAND_BRAND_BG,
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
