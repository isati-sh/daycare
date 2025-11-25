import { Database } from '@/types/database';

type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];

/**
 * Calculate hours attended from check-in and check-out times
 */
export function calculateHours(
  checkIn: string | null,
  checkOut: string | null
): number {
  if (!checkIn || !checkOut) return 0;

  const [inHour, inMin] = checkIn.split(':').map(Number);
  const [outHour, outMin] = checkOut.split(':').map(Number);

  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;

  const diffMinutes = outMinutes - inMinutes;
  return diffMinutes / 60;
}

/**
 * Format time string (HH:MM) to readable format
 */
export function formatTimeString(time: string | null): string {
  if (!time) return 'N/A';
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour, 10);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
}

/**
 * Calculate total hours from attendance records
 */
export function getTotalHours(attendance: AttendanceRecord[]): number {
  return attendance.reduce((total, record) => {
    if (record.check_in_time && record.check_out_time) {
      return total + calculateHours(record.check_in_time, record.check_out_time);
    }
    return total;
  }, 0);
}

/**
 * Calculate on-time arrival rate
 */
export function getOnTimeRate(attendance: AttendanceRecord[]): number {
  if (attendance.length === 0) return 0;
  const onTime = attendance.filter(
    (record) => record.status === 'present' || record.status === 'late'
  ).length;
  return Math.round((onTime / attendance.length) * 100);
}

