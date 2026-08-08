// PIN is hashed with SHA-256 (Web Crypto) before it ever touches storage.
export async function hashPin(pin) {
  const data = new TextEncoder().encode(pin)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPin(pin, storedHash) {
  return (await hashPin(pin)) === storedHash
}
