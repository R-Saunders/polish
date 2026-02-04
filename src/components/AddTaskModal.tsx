"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
	choreLibrary,
	getAllCategories,
	getChoresByCategory,
} from "@/lib/choreLibrary";
import type { CleaningLevel, RecurrenceType } from "@/types";

interface AddTaskModalProps {
	roomId: string;
	onClose: () => void;
	onSave: () => void;
}

export function AddTaskModal({ roomId, onClose, onSave }: AddTaskModalProps) {
	const [mode, setMode] = useState<"library" | "custom">("library");
	const [selectedCategory, setSelectedCategory] = useState(
		getAllCategories()[0],
	);
	const [selectedChore, setSelectedChore] = useState<string | null>(null);

	// Custom/edited values
	const [name, setName] = useState("");
	const [cleaningLevel, setCleaningLevel] = useState<CleaningLevel>("surface");
	const [effortPoints, setEffortPoints] = useState(2);
	const [recurrenceType, setRecurrenceType] =
		useState<RecurrenceType>("weekly");
	const [recurrenceDays, setRecurrenceDays] = useState<number[]>([1]); // Monday
	const [loading, setLoading] = useState(false);

	const categories = getAllCategories();
	const chores = getChoresByCategory(selectedCategory);

	const selectedChoreData = choreLibrary.find((c) => c.name === selectedChore);

	const handleChoreSelect = (choreName: string) => {
		setSelectedChore(choreName);
		const chore = choreLibrary.find((c) => c.name === choreName);
		if (chore) {
			setName(chore.name);
			setCleaningLevel(chore.suggested_level);
			// Set recurrence based on suggested frequency
			if (chore.suggested_frequency === "Daily") {
				setRecurrenceType("daily");
			} else if (
				chore.suggested_frequency === "Weekly" ||
				chore.suggested_frequency === "Twice weekly"
			) {
				setRecurrenceType("weekly");
			} else if (
				chore.suggested_frequency === "Monthly" ||
				chore.suggested_frequency === "Fortnightly"
			) {
				setRecurrenceType("monthly");
			}
		}
	};

	const toggleDay = (day: number) => {
		if (recurrenceDays.includes(day)) {
			setRecurrenceDays(recurrenceDays.filter((d) => d !== day));
		} else {
			setRecurrenceDays([...recurrenceDays, day].sort());
		}
	};

	const handleSave = async () => {
		if (!name.trim()) return;

		setLoading(true);
		try {
			await supabase.from("tasks").insert({
				room_id: roomId,
				name: name.trim(),
				cleaning_level: cleaningLevel,
				effort_points: effortPoints,
				suggested_frequency: selectedChoreData?.suggested_frequency || null,
				suggested_level: selectedChoreData?.suggested_level || null,
				recurrence_type: recurrenceType,
				recurrence_days: recurrenceType === "weekly" ? recurrenceDays : null,
				is_from_library: mode === "library",
			});
			onSave();
		} catch (err) {
			console.error("Error creating task:", err);
		} finally {
			setLoading(false);
		}
	};

	const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-bold">Add Chore</h2>
					<button onClick={onClose} className="text-slate-400 hover:text-white">
						✕
					</button>
				</div>

				{/* Mode toggle */}
				<div className="flex gap-2 mb-6">
					<button
						onClick={() => setMode("library")}
						className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
							mode === "library"
								? "bg-indigo-500 text-white"
								: "bg-white/5 text-slate-400 hover:bg-white/10"
						}`}
					>
						From Library
					</button>
					<button
						onClick={() => {
							setMode("custom");
							setSelectedChore(null);
							setName("");
						}}
						className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
							mode === "custom"
								? "bg-indigo-500 text-white"
								: "bg-white/5 text-slate-400 hover:bg-white/10"
						}`}
					>
						Custom
					</button>
				</div>

				{/* Library mode */}
				{mode === "library" && (
					<>
						{/* Category tabs */}
						<div className="flex gap-2 overflow-x-auto pb-2 mb-4">
							{categories.map((cat) => (
								<button
									key={cat}
									onClick={() => {
										setSelectedCategory(cat);
										setSelectedChore(null);
									}}
									className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
										selectedCategory === cat
											? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50"
											: "bg-white/5 text-slate-400 hover:bg-white/10"
									}`}
								>
									{cat}
								</button>
							))}
						</div>

						{/* Chore list */}
						<div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
							{chores.map((chore) => (
								<button
									key={chore.name}
									onClick={() => handleChoreSelect(chore.name)}
									className={`w-full p-3 rounded-lg text-left transition-all ${
										selectedChore === chore.name
											? "bg-indigo-500/20 border border-indigo-500"
											: "bg-white/5 hover:bg-white/10 border border-transparent"
									}`}
								>
									<div className="flex items-center justify-between">
										<span className="font-medium">{chore.name}</span>
										<span
											className={
												chore.suggested_level === "deep"
													? "badge-deep"
													: "badge-surface"
											}
										>
											{chore.suggested_level}
										</span>
									</div>
									<p className="text-sm text-slate-400 mt-1">
										Suggested: {chore.suggested_frequency}
									</p>
								</button>
							))}
						</div>
					</>
				)}

				{/* Custom mode or editing selected chore */}
				{(mode === "custom" || selectedChore) && (
					<div className="space-y-4">
						{/* Name */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								Chore name
							</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g., Clean the windows"
								className="input-field w-full"
							/>
						</div>

						{/* Cleaning level */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								Cleaning level
							</label>
							<div className="flex gap-2">
								<button
									onClick={() => setCleaningLevel("surface")}
									className={`flex-1 py-2 px-4 rounded-lg transition-all ${
										cleaningLevel === "surface"
											? "bg-green-500/30 text-green-300 border border-green-500"
											: "bg-white/5 text-slate-400 hover:bg-white/10"
									}`}
								>
									Surface
								</button>
								<button
									onClick={() => setCleaningLevel("deep")}
									className={`flex-1 py-2 px-4 rounded-lg transition-all ${
										cleaningLevel === "deep"
											? "bg-purple-500/30 text-purple-300 border border-purple-500"
											: "bg-white/5 text-slate-400 hover:bg-white/10"
									}`}
								>
									Deep
								</button>
							</div>
						</div>

						{/* Effort points */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								Effort points: {effortPoints}
							</label>
							<input
								type="range"
								min="1"
								max="5"
								value={effortPoints}
								onChange={(e) => setEffortPoints(parseInt(e.target.value))}
								className="w-full accent-indigo-500"
							/>
							<div className="flex justify-between text-xs text-slate-500">
								<span>Quick</span>
								<span>Moderate</span>
								<span>Intensive</span>
							</div>
						</div>

						{/* Recurrence */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								Repeat
							</label>
							<div className="flex gap-2 mb-3">
								{(["daily", "weekly", "monthly"] as RecurrenceType[]).map(
									(type) => (
										<button
											key={type}
											onClick={() => setRecurrenceType(type)}
											className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
												recurrenceType === type
													? "bg-indigo-500/30 text-indigo-300 border border-indigo-500"
													: "bg-white/5 text-slate-400 hover:bg-white/10"
											}`}
										>
											{type.charAt(0).toUpperCase() + type.slice(1)}
										</button>
									),
								)}
							</div>

							{/* Day selector for weekly */}
							{recurrenceType === "weekly" && (
								<div className="flex gap-1">
									{dayNames.map((day, index) => (
										<button
											key={day}
											onClick={() => toggleDay(index)}
											className={`flex-1 py-2 rounded text-xs font-medium transition-all ${
												recurrenceDays.includes(index)
													? "bg-indigo-500 text-white"
													: "bg-white/5 text-slate-400 hover:bg-white/10"
											}`}
										>
											{day}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				)}

				<div className="flex gap-3 mt-6">
					<button onClick={onClose} className="btn-secondary flex-1">
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={loading || !name.trim()}
						className="btn-primary flex-1 disabled:opacity-50"
					>
						{loading ? "Saving..." : "Add Chore"}
					</button>
				</div>
			</div>
		</div>
	);
}
