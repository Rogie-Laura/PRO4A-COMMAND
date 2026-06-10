export function buildLoginUrl(accessKey: string, origin = "https://pro4a-command.vercel.app") {
  const url = new URL("/login", origin)
  url.searchParams.set("key", accessKey)
  return url.toString()
}
