export const formatDateRange = (start?: string, end?: string): string => {
  if (!start && !end) return 'Present'
  const startLabel = start ? new Date(start).toLocaleDateString() : 'N/A'
  const endLabel = end ? new Date(end).toLocaleDateString() : 'Present'
  return `${startLabel} – ${endLabel}`
}

export const truncate = (text: string, length = 160): string =>
  text.length > length ? `${text.slice(0, length)}…` : text

