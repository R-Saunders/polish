"use client";

import { useState } from "react";
import type { Household } from "@/types";

interface HouseholdSettingsModalProps {
  household: Household;
  onClose: () => void;
  onToggleHolidayMode: () => void;
}

export function HouseholdSettingsModal({
  household,
  onClose,
  onToggleHolidayMode,
}: HouseholdSettingsModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      if (household.invite_code) {
        await navigator.clipboard.writeText(household.invite_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass-card animate-slide-up w-full max-w-md p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Household Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Invite Code Section */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-300">
              Invite Code
            </h3>
            <p className="mb-3 text-xs text-slate-400">
              Share this code with family members so they can join your
              household.
            </p>
            <div className="flex gap-2">
              <div className="input-field flex-1 text-center font-mono text-lg font-bold tracking-widest text-indigo-400 select-all">
                {household.invite_code || "ERROR"}
              </div>
              <button
                onClick={handleCopyCode}
                className={`rounded-xl px-4 font-medium transition-all ${
                  copied
                    ? "bg-green-500/20 text-green-400"
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Holiday Mode Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-300">
                  Holiday Mode
                </h3>
                <p className="text-xs text-slate-400">
                  Pause streaks while you are away
                </p>
              </div>
            </div>

            <button
              onClick={onToggleHolidayMode}
              className={`w-full rounded-xl p-4 text-center font-medium transition-all ${
                household.holiday_mode
                  ? "border border-amber-500/50 bg-amber-500/20 text-amber-300"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {household.holiday_mode
                ? "🌴 Holiday Mode is ON"
                : "Turn On Holiday Mode"}
            </button>

            {household.holiday_mode && (
              <p className="mt-2 text-center text-xs text-amber-400/80">
                Chores won&apos;t be marked overdue and streaks are paused.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button onClick={onClose} className="btn-secondary w-full">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
