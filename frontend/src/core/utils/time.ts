export type FormatDurationHoursMode = 'auto' | 'always' | 'never'

export interface FormatDurationMsOptions {
  fallback?: string
  hours?: FormatDurationHoursMode
}

/**
 * Formats a duration in milliseconds into `MM:SS` or `HH:MM:SS`.
 *
 * - `hours: 'auto'` (default) => shows hours only when >= 1 hour
 * - `hours: 'always'` => always `HH:MM:SS`
 * - `hours: 'never'` => always `MM:SS` (minutes may exceed 59)
 */
export function formatDurationMs(totalMs: unknown, options?: FormatDurationMsOptions): string {
  const fallback = options?.fallback ?? '-'

  const ms = typeof totalMs === 'number' ? totalMs : Number(totalMs)
  if (!Number.isFinite(ms) || ms < 0) return fallback

  const totalSeconds = Math.floor(ms / 1000)
  const seconds = totalSeconds % 60

  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60

  const hours = Math.floor(totalMinutes / 60)

  const hoursMode: FormatDurationHoursMode = options?.hours ?? 'auto'
  const showHours = hoursMode === 'always' || (hoursMode === 'auto' && hours > 0)

  if (showHours) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
