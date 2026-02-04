// Core types for ChoreShare

export interface Pet {
	type: "dog" | "cat" | "other";
	size: "small" | "medium" | "large";
	count: number;
}

export interface Household {
	id: string;
	name: string;
	invite_code: string;
	member_count: number;
	pets: Pet[];
	holiday_mode: boolean;
	holiday_until: string | null;
	streak_paused_at: string | null;
	created_at: string;
}

export interface User {
	id: string;
	clerk_id: string;
	name: string | null;
	avatar_url: string | null;
	household_id: string | null;
	total_points: number;
	current_streak: number;
}

export interface Room {
	id: string;
	household_id: string;
	name: string;
	icon: string;
	color: string;
}

export type CleaningLevel = "surface" | "deep";
export type RecurrenceType = "daily" | "weekly" | "monthly" | "custom";

export interface Task {
	id: string;
	room_id: string;
	name: string;
	cleaning_level: CleaningLevel;
	effort_points: number;
	suggested_frequency: string | null;
	suggested_level: CleaningLevel | null;
	recurrence_type: RecurrenceType | null;
	recurrence_days: number[] | null;
	recurrence_interval: number;
	last_completed: string | null;
	assigned_to: string | null;
	is_from_library: boolean;
}

export interface Completion {
	id: string;
	task_id: string;
	completed_by: string;
	completed_at: string;
	points_earned: number;
}

// Chore library item
export interface ChoreLibraryItem {
	name: string;
	suggested_level: CleaningLevel;
	suggested_frequency: string;
	room_category: string;
}
