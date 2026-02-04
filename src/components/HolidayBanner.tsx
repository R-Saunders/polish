"use client";

interface HolidayBannerProps {
  onDisable: () => void;
}

export function HolidayBanner({ onDisable }: HolidayBannerProps) {
  return (
    <div className="holiday-banner animate-fade-in mb-6">
      <span className="text-2xl">🏖️</span>
      <div className="flex-1">
        <p className="font-semibold">Holiday Mode Active</p>
        <p className="text-sm text-amber-100">Tasks paused, streaks frozen</p>
      </div>
      <button
        onClick={onDisable}
        className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/30"
      >
        End Holiday
      </button>
    </div>
  );
}
