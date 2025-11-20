export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const isValidUrl = (value: string): boolean => {
  try {
    if (!value) return false
    const url = new URL(value)
    return Boolean(url.protocol?.startsWith('http'))
  } catch {
    return false
  }
}

export const required = (value: string): boolean => value.trim().length > 0

