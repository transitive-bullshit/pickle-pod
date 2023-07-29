import { customAlphabet, urlAlphabet } from 'nanoid'

/**
 * Pauses the execution of a function for a specified time.
 *
 * @param ms - number of milliseconds to pause
 * @returns promise that resolves after the specified number of milliseconds
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function sha256(text: string) {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  )

  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return hash
}

/**
 * A default ID generator function that uses a custom alphabet based on URL safe symbols.
 */
export const generateId: () => string = customAlphabet(urlAlphabet)
