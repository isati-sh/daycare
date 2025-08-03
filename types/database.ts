export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          site_role: 'parent' | 'teacher' | 'admin'
          phone: string | null
          address: string | null
          emergency_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'parent' | 'teacher' | 'admin'
          phone?: string | null
          address?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'parent' | 'teacher' | 'admin'
          phone?: string | null
          address?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          first_name: string
          last_name: string
          date_of_birth: string
          age_group: 'infant' | 'toddler' | 'preschool'
          parent_id: string
          allergies: string[] | null
          medical_notes: string | null
          emergency_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          date_of_birth: string
          age_group: 'infant' | 'toddler' | 'preschool'
          parent_id: string
          allergies?: string[] | null
          medical_notes?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          age_group?: 'infant' | 'toddler' | 'preschool'
          parent_id?: string
          allergies?: string[] | null
          medical_notes?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_logs: {
        Row: {
          id: string
          child_id: string
          date: string
          meals: Array<{
            type: string // e.g. 'breakfast', 'lunch', 'snack', 'extra', etc.
            food: string
            quantity: string
            unit: string
          }>
          drinks: Array<{
            type: string // e.g. 'water', 'milk', 'juice', 'other'
            quantity: string
            unit: string
          }>
          naps: {
            morning: string | null
            afternoon: string | null
          }
          activities: string[]
          notes: string | null
          mood: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral'
          sickness: string | null
          medications: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          date: string
          meals: Array<{
            type: string
            food: string
            quantity: string
            unit: string
          }>
          drinks: Array<{
            type: string
            quantity: string
            unit: string
          }>
          naps: {
            morning: string | null
            afternoon: string | null
          }
          activities: string[]
          notes?: string | null
          mood: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral'
          sickness?: string | null
          medications?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          date?: string
          meals?: Array<{
            type: string
            food: string
            quantity: string
            unit: string
          }>
          drinks?: Array<{
            type: string
            quantity: string
            unit: string
          }>
          naps?: {
            morning: string | null
            afternoon: string | null
          }
          activities?: string[]
          notes?: string | null
          mood?: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral'
          sickness?: string | null
          medications?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_entries: {
        Row: {
          id: string
          child_id: string
          title: string
          description: string
          category: 'art' | 'learning' | 'physical' | 'social' | 'milestone'
          date: string
          photos: string[] | null
          teacher_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          title: string
          description: string
          category: 'art' | 'learning' | 'physical' | 'social' | 'milestone'
          date: string
          photos?: string[] | null
          teacher_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          title?: string
          description?: string
          category?: 'art' | 'learning' | 'physical' | 'social' | 'milestone'
          date?: string
          photos?: string[] | null
          teacher_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      development_milestones: {
        Row: {
          id: string
          child_id: string
          category: 'physical' | 'cognitive' | 'social' | 'language' | 'emotional'
          milestone: string
          achieved_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          category: 'physical' | 'cognitive' | 'social' | 'language' | 'emotional'
          milestone: string
          achieved_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          category?: 'physical' | 'cognitive' | 'social' | 'language' | 'emotional'
          milestone?: string
          achieved_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      planned_activities: {
        Row: {
          id: string
          name: string
          description: string
          category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical'
          start_time: string
          end_time: string
          age_groups: string[]
          materials_needed: string[]
          learning_objectives: string[]
          teacher_notes: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical'
          start_time: string
          end_time: string
          age_groups: string[]
          materials_needed: string[]
          learning_objectives: string[]
          teacher_notes?: string | null
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical'
          start_time?: string
          end_time?: string
          age_groups?: string[]
          materials_needed?: string[]
          learning_objectives?: string[]
          teacher_notes?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_schedules: {
        Row: {
          id: string
          date: string
          age_group: string
          meals: {
            breakfast_time: string
            lunch_time: string
            snack_time: string
          }
          naps: {
            morning_start: string
            morning_end: string
            afternoon_start: string
            afternoon_end: string
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          age_group: string
          meals: {
            breakfast_time: string
            lunch_time: string
            snack_time: string
          }
          naps: {
            morning_start: string
            morning_end: string
            afternoon_start: string
            afternoon_end: string
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          age_group?: string
          meals?: {
            breakfast_time: string
            lunch_time: string
            snack_time: string
          }
          naps?: {
            morning_start: string
            morning_end: string
            afternoon_start: string
            afternoon_end: string
          }
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          name: string
          description: string
          category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical'
          age_groups: string[]
          materials_needed: string[]
          learning_objectives: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical'
          age_groups: string[]
          materials_needed: string[]
          learning_objectives: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical'
          age_groups?: string[]
          materials_needed?: string[]
          learning_objectives?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: 'general' | 'event' | 'reminder' | 'emergency'
          target_audience: 'all' | 'parents' | 'teachers' | 'specific_age_group'
          age_group: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type: 'general' | 'event' | 'reminder' | 'emergency'
          target_audience: 'all' | 'parents' | 'teachers' | 'specific_age_group'
          age_group?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: 'general' | 'event' | 'reminder' | 'emergency'
          target_audience?: 'all' | 'parents' | 'teachers' | 'specific_age_group'
          age_group?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          subject: string
          content: string
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          subject: string
          content: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          subject?: string
          content?: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          status: 'new' | 'read' | 'replied' | 'resolved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          status?: 'new' | 'read' | 'replied' | 'resolved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          status?: 'new' | 'read' | 'replied' | 'resolved'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 