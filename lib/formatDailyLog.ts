import { normalizeActivities, formatNaps, parseMedications } from '@/lib/utils'

export function formatDailyLogsForClient(logs: any[]) {
  return (logs || []).map((log) => ({
    ...log,
    activities: normalizeActivities(log.activities),
    naps: formatNaps(log.naps),
    medications: parseMedications(log.medications),
  }))
}
