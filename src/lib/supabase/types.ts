export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
};

export type Encouragement = {
  id: string;
  from_id: string;
  to_id: string;
  created_at: string;
};

export type Challenge = {
  id: string;
  created_by: string;
  invited_user: string;
  habit_name: string;
  duration_days: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  started_at: string | null;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  color: string;
  icon: string;
  user_id: string | null;
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category_id: number | null;
  color: string | null;
  is_public: boolean;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type HabitRecord = {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type DayRating = {
  id: string;
  user_id: string;
  date: string;
  rating: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WeeklySummary = {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  avg_rating: number | null;
  total_habits: number;
  completed_habits: number;
  completion_rate: number | null;
  notes: string | null;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: number | null;
  type: 'mensual' | 'trimestral' | 'anual';
  target_value: number;
  current_value: number;
  unit: string | null;
  start_date: string;
  end_date: string;
  is_public: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type GoalProgressEntry = {
  id: string;
  goal_id: string;
  user_id: string;
  value: number;
  note: string | null;
  recorded_at: string;
  created_at: string;
};

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type EmailReportLog = {
  id: string;
  user_id: string;
  report_type: 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  sent_at: string;
  status: 'sent' | 'failed';
  error_message: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
        Relationships: [];
      };
      user_badges: {
        Row: UserBadge;
        Insert: Omit<UserBadge, 'id' | 'earned_at'> & { id?: string; earned_at?: string };
        Update: Partial<Omit<UserBadge, 'id'>>;
        Relationships: [];
      };
      encouragements: {
        Row: Encouragement;
        Insert: Omit<Encouragement, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Encouragement, 'id'>>;
        Relationships: [];
      };
      challenges: {
        Row: Challenge;
        Insert: Omit<Challenge, 'id' | 'created_at' | 'started_at'> & { id?: string; created_at?: string; started_at?: string | null };
        Update: Partial<Omit<Challenge, 'id'>>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'> & { id?: number; created_at?: string };
        Update: Partial<Omit<Category, 'id'>>;
        Relationships: [];
      };
      habits: {
        Row: Habit;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          category_id?: number | null;
          color?: string | null;
          is_public?: boolean;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Habit, 'id' | 'user_id'>>;
        Relationships: [];
      };
      habit_records: {
        Row: HabitRecord;
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          date: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<HabitRecord, 'id' | 'user_id' | 'habit_id'>>;
        Relationships: [];
      };
      day_ratings: {
        Row: DayRating;
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          rating: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DayRating, 'id' | 'user_id'>>;
        Relationships: [];
      };
      weekly_summaries: {
        Row: WeeklySummary;
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          week_end: string;
          avg_rating?: number | null;
          total_habits?: number;
          completed_habits?: number;
          completion_rate?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<WeeklySummary, 'id' | 'user_id'>>;
        Relationships: [];
      };
      goals: {
        Row: Goal;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category_id?: number | null;
          type: 'mensual' | 'trimestral' | 'anual';
          target_value: number;
          current_value?: number;
          unit?: string | null;
          start_date: string;
          end_date: string;
          is_public?: boolean;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Goal, 'id' | 'user_id'>>;
        Relationships: [];
      };
      goal_progress_entries: {
        Row: GoalProgressEntry;
        Insert: Omit<GoalProgressEntry, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<GoalProgressEntry, 'id'>>;
        Relationships: [];
      };
      friendships: {
        Row: Friendship;
        Insert: Omit<Friendship, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Friendship, 'id'>>;
        Relationships: [];
      };
      email_report_logs: {
        Row: EmailReportLog;
        Insert: {
          id?: string;
          user_id: string;
          report_type: 'weekly' | 'monthly';
          period_start: string;
          period_end: string;
          sent_at?: string;
          status: 'sent' | 'failed';
          error_message?: string | null;
        };
        Update: Partial<Omit<EmailReportLog, 'id'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      update_goal_progress: {
        Args: { p_goal_id: string; p_value: number; p_note?: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
