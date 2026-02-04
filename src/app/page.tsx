"use client";

import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const { userId, isLoaded } = useAuth();
  const [hasHousehold, setHasHousehold] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserHousehold() {
      if (!userId) return;

      try {
        const { data: user } = await supabase
          .from("users")
          .select("household_id")
          .eq("clerk_id", userId)
          .single();

        setHasHousehold(
          !!(user as { household_id: string | null } | null)?.household_id
        );
      } catch {
        // User doesn't exist yet
        setHasHousehold(false);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && userId) {
      checkUserHousehold();
    }
  }, [userId, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-xl text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
              ChoreShare
            </h1>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        {hasHousehold ? (
          <Dashboard />
        ) : (
          <OnboardingFlow onComplete={() => setHasHousehold(true)} />
        )}
      </div>
    </main>
  );
}
