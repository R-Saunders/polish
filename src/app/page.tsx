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
					!!(user as { household_id: string | null } | null)?.household_id,
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-pulse text-xl text-slate-400">Loading...</div>
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
			{/* Header */}
			<header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
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
			<div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
				{hasHousehold ? (
					<Dashboard />
				) : (
					<OnboardingFlow onComplete={() => setHasHousehold(true)} />
				)}
			</div>
		</main>
	);
}
