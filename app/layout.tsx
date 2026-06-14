import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { COMMAND_BRAND_BG, COMMAND_ICON_VERSION } from "@/lib/brand-config"
import { PwaRegister } from "@/components/pwa/pwa-register"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "PRO4A COMMAND",
  description: "Centralized Operations Monitoring and MANagement Dashboard",
  applicationName: "PRO4A COMMAND",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PRO4A COMMAND",
  },
  icons: {
    icon: [
      {
        url: `/icons/icon-192.png?v=${COMMAND_ICON_VERSION}`,
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: `/icons/apple-touch-icon.png?v=${COMMAND_ICON_VERSION}`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: COMMAND_BRAND_BG },
    { media: "(prefers-color-scheme: dark)", color: COMMAND_BRAND_BG },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var standalone=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;if(!standalone)return;document.documentElement.classList.add("show-command-splash");window.setTimeout(function(){document.documentElement.classList.remove("show-command-splash")},2200)}catch(e){}})();`,
          }}
        />
        <div id="command-native-splash" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/command.png?v=2"
            alt=""
            width={677}
            height={368}
            decoding="sync"
            fetchPriority="high"
          />
        </div>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>
            {children}
            <PwaRegister />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
