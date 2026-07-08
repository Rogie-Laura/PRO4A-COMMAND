// Minimal service worker for PWA install eligibility only.
// Do NOT intercept fetch — a failed respondWith(fetch) breaks RSC navigation.
const CACHE_NAME = "pro4a-command-v6"

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})
