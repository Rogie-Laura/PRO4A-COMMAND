import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { COMMAND_BRAND, COMMAND_BRAND_BG, COMMAND_BRAND_VERSION, COMMAND_ICON_VERSION } from "@/lib/brand-config"
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
            __html: `(function(){try{var standalone=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;if(!standalone)return;var nav=window.performance&&window.performance.getEntriesByType?window.performance.getEntriesByType("navigation")[0]:null;if(nav&&nav.type==="reload")return;if(window.localStorage.getItem("command-splash-shown")==="1")return;window.localStorage.setItem("command-splash-shown","1");document.documentElement.classList.add("show-command-splash");window.setTimeout(function(){document.documentElement.classList.remove("show-command-splash")},2800)}catch(e){}})();`,
          }}
        />
        <div id="command-native-splash" aria-hidden="true">
          <div className="command-splash-content">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${COMMAND_BRAND.src}?v=${COMMAND_BRAND_VERSION}`}
              alt=""
              width={COMMAND_BRAND.width}
              height={COMMAND_BRAND.height}
              decoding="sync"
              fetchPriority="high"
            />
            <p className="command-splash-tagline">One Command. One Picture. One Mission.</p>
            <p className="command-splash-motto">Assess. Adapt. Active. Achieve.</p>
          </div>
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
