import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto"

const SALT = "pro4a-access-key-v1"

function getEncryptionKey() {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable.")
  }

  return scryptSync(secret, SALT, 32)
}

export function encryptAccessToken(token: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`
}

export function decryptAccessToken(payload: string) {
  const [ivPart, tagPart, dataPart] = payload.split(".")

  if (!ivPart || !tagPart || !dataPart) {
    throw new Error("Invalid encrypted access token payload.")
  }

  const iv = Buffer.from(ivPart, "base64url")
  const tag = Buffer.from(tagPart, "base64url")
  const encrypted = Buffer.from(dataPart, "base64url")
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv)

  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")
}
