import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  'https://idbsjcrdkexuluermruh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkYnNqY3Jka2V4dWx1ZXJtcnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODgzNjIsImV4cCI6MjA3NjQ2NDM2Mn0.JmPVISnr8gfDYU4ZKjNzGK87LrO3wz2sBXpnqZNq_dY',
  {
    auth: {
      persistSession: true,   // ✅ ensures session is stored
      autoRefreshToken: true, // ✅ refreshes tokens automatically
      detectSessionInUrl: true,
    },
  }
);

export default supabase;

