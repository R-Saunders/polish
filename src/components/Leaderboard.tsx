"use client";

import type { User } from "@/types";

interface LeaderboardProps {
  members: User[];
  currentUserId?: string;
}

export function Leaderboard({ members, currentUserId }: LeaderboardProps) {
  const sortedMembers = [...members].sort(
    (a, b) => b.total_points - a.total_points
  );

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${rank + 1}`;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Household Rankings</h3>

      {sortedMembers.length === 0 ? (
        <div className="glass-card py-12 text-center text-slate-400">
          <p className="mb-4 text-4xl">🏆</p>
          <p>No members yet. Invite your household!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMembers.map((member, index) => (
            <div
              key={member.id}
              className={`glass-card flex items-center gap-4 p-4 ${
                member.id === currentUserId ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <span className="w-10 text-center text-2xl">
                {getMedalEmoji(index)}
              </span>

              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.name || "User"}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-lg font-bold">
                  {member.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}

              <div className="flex-1">
                <p className="font-medium">
                  {member.name || "Anonymous"}
                  {member.id === currentUserId && (
                    <span className="ml-2 text-sm text-indigo-400">(you)</span>
                  )}
                </p>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span>🔥 {member.current_streak} day streak</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-400">
                  {member.total_points}
                </p>
                <p className="text-xs text-slate-400">points</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
