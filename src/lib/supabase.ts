import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Using untyped client for flexibility - types are enforced in application code
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authenticated client that forwards the Clerk token
// https://clerk.com/docs/integrations/databases/supabase
export const createClerkSupabaseClient = (clerkToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
};

// Server-side client for use in Server Components
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
