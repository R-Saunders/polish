"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AddRoomModalProps {
  householdId: string;
  onClose: () => void;
  onSave: () => void;
}

const ROOM_PRESETS = [
  { name: "Kitchen", icon: "🍳", color: "#f59e0b" },
  { name: "Bathroom", icon: "🚿", color: "#06b6d4" },
  { name: "Living Room", icon: "🛋️", color: "#8b5cf6" },
  { name: "Bedroom", icon: "🛏️", color: "#ec4899" },
  { name: "Laundry", icon: "🧺", color: "#14b8a6" },
  { name: "Office", icon: "💼", color: "#6366f1" },
  { name: "Dining Room", icon: "🍽️", color: "#f97316" },
  { name: "Garden", icon: "🌱", color: "#22c55e" },
  { name: "Garage", icon: "🚗", color: "#64748b" },
];

export function AddRoomModal({
  householdId,
  onClose,
  onSave,
}: AddRoomModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🏠");
  const [color, setColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);

  const handlePresetSelect = (preset: (typeof ROOM_PRESETS)[0]) => {
    setName(preset.name);
    setIcon(preset.icon);
    setColor(preset.color);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await supabase.from("rooms").insert({
        household_id: householdId,
        name: name.trim(),
        icon,
        color,
      });
      onSave();
    } catch (err) {
      console.error("Error creating room:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass-card animate-slide-up w-full max-w-md p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Room</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Quick select
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ROOM_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className={`rounded-lg p-3 text-center transition-all ${
                  name === preset.name
                    ? "border border-indigo-500 bg-indigo-500/30"
                    : "border border-transparent bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="mb-1 block text-xl">{preset.icon}</span>
                <span className="text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom name */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Room name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Master Bedroom"
            className="input-field w-full"
          />
        </div>

        {/* Icon and color */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Icon
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="input-field w-full text-center text-2xl"
              maxLength={2}
            />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Colour
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-12 w-full cursor-pointer rounded-xl border-0"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
