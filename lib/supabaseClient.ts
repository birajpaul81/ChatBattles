import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Chat = {
  id: string;
  user_id: string;
  prompt: string;
  responses: {
    model: string;
    text: string;
  }[];
  created_at: string;
};

