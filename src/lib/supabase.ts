import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.\n' +
    'Required variables:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n\n' +
    'See SUPABASE_SETUP_GUIDE.md for setup instructions.'
  );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're not using authentication yet
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'upesacm-performance-tracker',
    },
  },
});

// Helper function to check if Supabase is configured correctly
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('members').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
};

// Type definitions for our database tables
export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string;
          role: string;
          contact: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          contact: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          contact?: string;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          status: 'not-started' | 'in-progress' | 'review' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          status: 'not-started' | 'in-progress' | 'review' | 'completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          status?: 'not-started' | 'in-progress' | 'review' | 'completed';
          created_at?: string;
        };
      };
      task_assignments: {
        Row: {
          task_id: string;
          member_id: string;
        };
        Insert: {
          task_id: string;
          member_id: string;
        };
        Update: {
          task_id?: string;
          member_id?: string;
        };
      };
      subtasks: {
        Row: {
          id: string;
          task_id: string;
          title: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          title: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          title?: string;
          completed?: boolean;
          created_at?: string;
        };
      };
      task_attachments: {
        Row: {
          id: string;
          task_id: string;
          name: string;
          type: string;
          base64_data: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          name: string;
          type: string;
          base64_data: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          name?: string;
          type?: string;
          base64_data?: string;
          uploaded_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          task_id: string;
          member_id: string;
          quality: number;
          timeliness: number;
          communication: number;
          initiative: number;
          comments: string;
          mode: 'daily' | 'final';
          timestamp: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          member_id: string;
          quality: number;
          timeliness: number;
          communication: number;
          initiative: number;
          comments: string;
          mode: 'daily' | 'final';
          timestamp?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          member_id?: string;
          quality?: number;
          timeliness?: number;
          communication?: number;
          initiative?: number;
          comments?: string;
          mode?: 'daily' | 'final';
          timestamp?: string;
        };
      };
    };
  };
}
