import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getAge(dateOfBirth: string) {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export function getAgeGroup(dateOfBirth: string) {
  const age = getAge(dateOfBirth)
  
  if (age < 1) return 'infant'
  if (age < 3) return 'toddler'
  return 'preschool'
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
} 

// --- Dashboard / Daily log formatting helpers ---
export function normalizeActivities(activities: any): Array<{ name: string; imageUrls: string[] }> {
  if (!activities) return [];
  if (Array.isArray(activities)) {
    return activities.map((a) => (typeof a === 'string' ? { name: a, imageUrls: [] } : { name: a.name ?? String(a), imageUrls: a.imageUrls ?? [] }));
  }
  return [];
}

export function formatNaps(naps: any) {
  if (!naps) return { morning: null, afternoon: null };
  return {
    morning: naps.morning_start && naps.morning_end ? `${naps.morning_start} - ${naps.morning_end}` : null,
    afternoon: naps.afternoon_start && naps.afternoon_end ? `${naps.afternoon_start} - ${naps.afternoon_end}` : null,
  };
}

export function parseMedications(medications: any) {
  if (!medications) return [];
  if (typeof medications === 'string') {
    try {
      return JSON.parse(medications);
    } catch (e) {
      return [];
    }
  }
  if (Array.isArray(medications)) return medications;
  return [];
}

export function transformDailyLogs(logs: any[]) {
  return (logs || []).map((log: any) => ({
    ...log,
    activities: normalizeActivities(log.activities),
    naps: formatNaps(log.naps),
    medications: parseMedications(log.medications),
  }));
}