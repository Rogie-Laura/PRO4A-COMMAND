import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA,
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
