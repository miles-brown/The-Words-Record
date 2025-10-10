import crypto from 'crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export interface MfaSecret {
  secret: string
  otpauthUrl: string
}

export function generateMfaSecret(label: string, issuer: string): MfaSecret {
  const random = crypto.randomBytes(20)
  const secret = base32Encode(random)
  const otpauthUrl = buildOtpAuthUrl({ secret, label, issuer })
  return { secret, otpauthUrl }
}

export function verifyTotp(secret: string, token: string, window = 1, digits = 6): boolean {
  if (!token) return false
  const sanitized = token.replace(/\s+/g, '')
  if (!/^\d+$/.test(sanitized)) return false

  const currentTime = Math.floor(Date.now() / 1000)
  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const counter = Math.floor(currentTime / 30) + errorWindow
    const code = generateTotp(secret, counter, digits)
    if (timingSafeEquals(code, sanitized.padStart(digits, '0'))) {
      return true
    }
  }
  return false
}

export function generateRecoveryCodes(count = 8): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(5).toString('hex').toUpperCase()
  )
}

function generateTotp(secret: string, counter: number, digits: number): string {
  const key = base32Decode(secret)
  const buffer = Buffer.alloc(8)
  for (let i = 7; i >= 0; i--) {
    buffer[i] = counter & 0xff
    counter = counter >> 8
  }

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  const otp = binary % 10 ** digits
  return otp.toString().padStart(digits, '0')
}

function buildOtpAuthUrl({ secret, label, issuer }: { secret: string; label: string; issuer: string }) {
  const encodedLabel = encodeURIComponent(label)
  const encodedIssuer = encodeURIComponent(issuer)
  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`
}

function base32Encode(buffer: Buffer): string {
  let output = ''
  let bits = 0
  let value = 0

  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }

  while (output.length % 8 !== 0) {
    output += '='
  }

  return output
}

function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, '')
  let bits = 0
  let value = 0
  const bytes: number[] = []

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char)
    if (index === -1) {
      throw new Error('Invalid base32 character')
    }

    value = (value << 5) | index
    bits += 5

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Buffer.from(bytes)
}

function timingSafeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)

  if (bufferA.length !== bufferB.length) {
    return false
  }

  return crypto.timingSafeEqual(bufferA, bufferB)
}
