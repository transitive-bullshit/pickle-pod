/**
 * Pauses the execution of a function for a specified time.
 *
 * @param ms - number of milliseconds to pause
 * @returns promise that resolves after the specified number of milliseconds
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
