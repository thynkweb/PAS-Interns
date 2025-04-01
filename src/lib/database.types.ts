export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          days_left: number;
          referral_code: string;
          created_at: string;
          updated_at: string;
          deadline_date: string;
          whatsapp_number: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          days_left?: number;
          referral_code?: string;
          created_at?: string;
          updated_at?: string;
          deadline_date?: string;
          whatsapp_number?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          days_left?: number;
          referral_code?: string;
          created_at?: string;
          updated_at?: string;
          deadline_date?: string;
          whatsapp_number?: string | null;
        };
      };
      children: {
        Row: {
          id: string;
          name: string;
          age: number;
          location: string;
          image_url: string;
          description: string | null;
          priority: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          age: number;
          location: string;
          image_url: string;
          description?: string | null;
          priority?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          age?: number;
          location?: string;
          image_url?: string;
          description?: string | null;
          priority?: string;
          created_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          donor_id: string | null;
          user_id: string;
          amount: number;
          display_name: string;
          message: string | null;
          is_anonymous: boolean;
          created_at: string;
        };
      };
      user_ranks: {
        Row: {
          id: string;
          user_id: string;
          rank_position: number;
          total_amount: number;
          total_donors: number;
          avg_donation: number;
          rank_title: string;
          created_at: string;
          updated_at: string;
        };
      };
      donation_stats: {
        Row: {
          id: string;
          total_donations: number;
          avg_donation: number;
          total_donors: number;
          highest_donation: number;
          highest_donor_id: string | null;
          updated_at: string;
        };
      };
    };
  };
}