export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          site_role: 'parent' | 'teacher' | 'admin' | null
          phone: string | null
          address: string | null
          emergency_contact: string | null
          active_status: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          site_role?: 'parent' | 'teacher' | 'admin'
          phone?: string | null
          address?: string | null
          emergency_contact?: string | null
          active_status?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          site_role?: 'parent' | 'teacher' | 'admin'
          phone?: string | null
          address?: string | null
          emergency_contact?: string | null
          active_status?: boolean
          last_login?: string | null
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
          teacher_id: string | null
          status: 'active' | 'inactive' | 'waitlist'
          enrollment_date: string
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
          teacher_id?: string | null
          status?: 'active' | 'inactive' | 'waitlist'
          enrollment_date?: string
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
          teacher_id?: string | null
          status?: 'active' | 'inactive' | 'waitlist'
          enrollment_date?: string
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
          teacher_id: string
          meals: Array<{
            type: string // e.g. 'breakfast', 'lunch', 'snack', 'extra', etc.
            food: string
            quantity: string
            unit: string
            time: string
          }>
          drinks: Array<{
            type: string // e.g. 'water', 'milk', 'juice', 'other'
            quantity: string
            unit: string
            time: string
          }>
          naps: {
            morning_start: string | null
            morning_end: string | null
            afternoon_start: string | null
            afternoon_end: string | null
          }
          activities: string[]
          notes: string | null
          mood: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral' | 'fussy' | 'excited'
          behavior: 'excellent' | 'good' | 'fair' | 'needs_attention' | null
          sickness: string | null
          medications: string | null
          bathroom_visits: number
          diaper_changes: number | null
          photos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          date: string
          teacher_id: string
          meals?: Array<{
            type: string
            food: string
            quantity: string
            unit: string
            time: string
          }>
          drinks?: Array<{
            type: string
            quantity: string
            unit: string
            time: string
          }>
          naps?: {
            morning_start: string | null
            morning_end: string | null
            afternoon_start: string | null
            afternoon_end: string | null
          }
          activities?: string[]
          notes?: string | null
          mood?: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral' | 'fussy' | 'excited'
          behavior?: 'excellent' | 'good' | 'fair' | 'needs_attention' | null
          sickness?: string | null
          medications?: string | null
          bathroom_visits?: number
          diaper_changes?: number | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          date?: string
          teacher_id?: string
          meals?: Array<{
            type: string
            food: string
            quantity: string
            unit: string
            time: string
          }>
          drinks?: Array<{
            type: string
            quantity: string
            unit: string
            time: string
          }>
          naps?: {
            morning_start: string | null
            morning_end: string | null
            afternoon_start: string | null
            afternoon_end: string | null
          }
          activities?: string[]
          notes?: string | null
          mood?: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral' | 'fussy' | 'excited'
          behavior?: 'excellent' | 'good' | 'fair' | 'needs_attention' | null
          sickness?: string | null
          medications?: string | null
          bathroom_visits?: number
          diaper_changes?: number | null
          photos?: string[] | null
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
          category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical' | 'dramatic_play' | 'science'
          start_time: string
          end_time: string
          age_groups: string[]
          max_participants: number | null
          materials_needed: string[]
          learning_objectives: string[]
          teacher_notes: string | null
          date: string
          status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          weather_dependent: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical' | 'dramatic_play' | 'science'
          start_time: string
          end_time: string
          age_groups: string[]
          max_participants?: number | null
          materials_needed: string[]
          learning_objectives: string[]
          teacher_notes?: string | null
          date: string
          status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          weather_dependent?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical' | 'dramatic_play' | 'science'
          start_time?: string
          end_time?: string
          age_groups?: string[]
          max_participants?: number | null
          materials_needed?: string[]
          learning_objectives?: string[]
          teacher_notes?: string | null
          date?: string
          status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          weather_dependent?: boolean
          created_by?: string
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
      teacher_assignments: {
        Row: {
          id: string
          teacher_id: string
          child_id: string
          assigned_date: string
          status: 'active' | 'inactive'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          child_id: string
          assigned_date: string
          status?: 'active' | 'inactive'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          child_id?: string
          assigned_date?: string
          status?: 'active' | 'inactive'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          child_id: string
          date: string
          check_in_time: string | null
          check_out_time: string | null
          status: 'present' | 'absent' | 'late' | 'early_pickup'
          notes: string | null
          recorded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          date: string
          check_in_time?: string | null
          check_out_time?: string | null
          status: 'present' | 'absent' | 'late' | 'early_pickup'
          notes?: string | null
          recorded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          status?: 'present' | 'absent' | 'late' | 'early_pickup'
          notes?: string | null
          recorded_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      incident_reports: {
        Row: {
          id: string
          child_id: string
          date: string
          time: string
          type: 'injury' | 'behavioral' | 'medical' | 'accident' | 'other'
          description: string
          action_taken: string
          parent_notified: boolean
          parent_notification_time: string | null
          reported_by: string
          severity: 'low' | 'medium' | 'high'
          follow_up_required: boolean
          photos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          date: string
          time: string
          type: 'injury' | 'behavioral' | 'medical' | 'accident' | 'other'
          description: string
          action_taken: string
          parent_notified?: boolean
          parent_notification_time?: string | null
          reported_by: string
          severity: 'low' | 'medium' | 'high'
          follow_up_required?: boolean
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          date?: string
          time?: string
          type?: 'injury' | 'behavioral' | 'medical' | 'accident' | 'other'
          description?: string
          action_taken?: string
          parent_notified?: boolean
          parent_notification_time?: string | null
          reported_by?: string
          severity?: 'low' | 'medium' | 'high'
          follow_up_required?: boolean
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollment_applications: {
        Row: {
          id: string
          parent_id: string
          child_first_name: string
          child_last_name: string
          child_date_of_birth: string
          preferred_start_date: string
          age_group: 'infant' | 'toddler' | 'preschool'
          status: 'pending' | 'approved' | 'rejected' | 'waitlisted'
          application_date: string
          reviewed_by: string | null
          review_date: string | null
          review_notes: string | null
          priority_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          child_first_name: string
          child_last_name: string
          child_date_of_birth: string
          preferred_start_date: string
          age_group: 'infant' | 'toddler' | 'preschool'
          status?: 'pending' | 'approved' | 'rejected' | 'waitlisted'
          application_date: string
          reviewed_by?: string | null
          review_date?: string | null
          review_notes?: string | null
          priority_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          child_first_name?: string
          child_last_name?: string
          child_date_of_birth?: string
          preferred_start_date?: string
          age_group?: 'infant' | 'toddler' | 'preschool'
          status?: 'pending' | 'approved' | 'rejected' | 'waitlisted'
          application_date?: string
          reviewed_by?: string | null
          review_date?: string | null
          review_notes?: string | null
          priority_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      billing: {
        Row: {
          id: string
          parent_id: string
          child_id: string
          billing_period_start: string
          billing_period_end: string
          amount: number
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          due_date: string
          paid_date: string | null
          payment_method: 'cash' | 'check' | 'card' | 'bank_transfer' | null
          late_fees: number
          discounts: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          child_id: string
          billing_period_start: string
          billing_period_end: string
          amount: number
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          due_date: string
          paid_date?: string | null
          payment_method?: 'cash' | 'check' | 'card' | 'bank_transfer' | null
          late_fees?: number
          discounts?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          child_id?: string
          billing_period_start?: string
          billing_period_end?: string
          amount?: number
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          due_date?: string
          paid_date?: string | null
          payment_method?: 'cash' | 'check' | 'card' | 'bank_transfer' | null
          late_fees?: number
          discounts?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      children_with_parents: {
        Row: {
          child_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          age_group: 'infant' | 'toddler' | 'preschool'
          status: 'active' | 'inactive' | 'waitlist'
          enrollment_date: string
          parent_id: string
          parent_name: string | null
          parent_email: string
          parent_phone: string | null
          teacher_id: string | null
          teacher_name: string | null
          allergies: string[] | null
          medical_notes: string | null
        }
      }
      teacher_assignments_view: {
        Row: {
          teacher_id: string
          teacher_name: string | null
          teacher_email: string
          teacher_active: boolean
          assigned_children: number
          child_names: string[]
          age_groups: string[]
        }
      }
      daily_attendance_summary: {
        Row: {
          date: string
          total_enrolled: number
          present: number
          absent: number
          late: number
          attendance_rate: number
        }
      }
      billing_summary: {
        Row: {
          parent_id: string
          parent_name: string | null
          parent_email: string
          total_outstanding: number
          overdue_amount: number
          children_count: number
          last_payment_date: string | null
        }
      }
    }
    Functions: {
      get_child_age_in_months: {
        Args: {
          date_of_birth: string
        }
        Returns: number
      }
      get_teacher_workload: {
        Args: {
          teacher_id: string
        }
        Returns: {
          teacher_id: string
          assigned_children: number
          age_groups: string[]
          workload_score: number
        }
      }
      calculate_attendance_rate: {
        Args: {
          child_id: string
          start_date: string
          end_date: string
        }
        Returns: {
          total_days: number
          present_days: number
          attendance_rate: number
        }
      }
      get_billing_summary: {
        Args: {
          parent_id: string
          year: number
        }
        Returns: {
          total_billed: number
          total_paid: number
          outstanding: number
          overdue: number
        }
      }
      search_children: {
        Args: {
          search_term: string
        }
        Returns: {
          id: string
          first_name: string
          last_name: string
          parent_name: string | null
          parent_email: string
          age_group: string
          status: string
        }[]
      }
    }
    Enums: {
      user_role: 'parent' | 'teacher' | 'admin'
      child_age_group: 'infant' | 'toddler' | 'preschool'
      child_status: 'active' | 'inactive' | 'waitlist'
      attendance_status: 'present' | 'absent' | 'late' | 'early_pickup'
      mood_type: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral' | 'fussy' | 'excited'
      behavior_type: 'excellent' | 'good' | 'fair' | 'needs_attention'
      activity_category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical' | 'dramatic_play' | 'science'
      incident_type: 'injury' | 'behavioral' | 'medical' | 'accident' | 'other'
      severity_level: 'low' | 'medium' | 'high'
      billing_status: 'pending' | 'paid' | 'overdue' | 'cancelled'
      payment_method: 'cash' | 'check' | 'card' | 'bank_transfer'
      announcement_type: 'general' | 'event' | 'reminder' | 'emergency'
      target_audience: 'all' | 'parents' | 'teachers' | 'specific_age_group'
      application_status: 'pending' | 'approved' | 'rejected' | 'waitlisted'
      contact_status: 'new' | 'read' | 'replied' | 'resolved'
      portfolio_category: 'art' | 'learning' | 'physical' | 'social' | 'milestone'
      milestone_category: 'physical' | 'cognitive' | 'social' | 'language' | 'emotional'
    }
  }
} 