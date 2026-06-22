export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function isStandalonePwa() {
  if (typeof window === "undefined") return false

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

export function isIosDevice() {
  if (typeof window === "undefined") return false

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      Promise.all(
        registrations.map((registration) => {
          if (registration.active?.scriptURL.endsWith("/sw.js")) {
            return registration.update()
          }
          return undefined
        }),
      ),
    )
    .then(() => navigator.serviceWorker.register("/sw.js"))
    .catch(() => {
      // Install may still work on some browsers without a registered worker.
    })
}
