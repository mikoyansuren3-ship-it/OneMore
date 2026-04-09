import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

console.log("🔍 [SUPABASE INIT] URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log("🔍 [SUPABASE INIT] Key exists:", !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
console.log("🔍 [SUPABASE INIT] Key first 20 chars:", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20));
console.log("🔍 [SUPABASE INIT] isSupabaseConfigured:", Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY));

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/** No-op-safe client when env is missing (calls will fail until configured). */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
