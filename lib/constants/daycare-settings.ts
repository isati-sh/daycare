import type { Database } from '@/types/database';

export type DaycareSettings =
  Database['public']['Tables']['daycare_settings']['Row'];

export const FALLBACK_DAYCARE_SETTINGS: DaycareSettings = {
  id: 'local-fallback',
  name: 'Little Learners Daycare',
  timezone: 'America/New_York',
  check_in_window_start: '07:30',
  check_in_window_end: '09:30',
  contact_email: 'support@littlelearners.local',
  contact_phone: '(555) 010-0101',
  address: '123 Learning Lane, Hometown, USA',
  updated_at: new Date().toISOString(),
};
