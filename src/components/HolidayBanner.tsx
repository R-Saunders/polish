"use client";

interface HolidayBannerProps {
	onDisable: () => void;
}

export function HolidayBanner({ onDisable }: HolidayBannerProps) {
	return (
		<div className="holiday-banner mb-6 animate-fade-in">
			<span className="text-2xl">🏖️</span>
			<div className="flex-1">
				<p className="font-semibold">Holiday Mode Active</p>
				<p className="text-sm text-amber-100">Tasks paused, streaks frozen</p>
			</div>
			<button
				onClick={onDisable}
				className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
			>
				End Holiday
			</button>
		</div>
	);
}
