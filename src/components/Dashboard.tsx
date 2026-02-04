"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import type { Household, Room, Task, User } from "@/types";
import { RoomCard } from "./RoomCard";
import { AddRoomModal } from "./AddRoomModal";
import { AddTaskModal } from "./AddTaskModal";
import { HolidayBanner } from "./HolidayBanner";
import { Leaderboard } from "./Leaderboard";

export function Dashboard() {
	const { user: clerkUser } = useUser();
	const [household, setHousehold] = useState<Household | null>(null);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [members, setMembers] = useState<User[]>([]);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [showAddRoom, setShowAddRoom] = useState(false);
	const [showAddTask, setShowAddTask] = useState(false);
	const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"today" | "rooms" | "leaderboard">(
		"today",
	);
	const [loading, setLoading] = useState(true);

	const loadData = useCallback(async () => {
		if (!clerkUser) return;

		try {
			// Get current user
			const { data: userData } = await supabase
				.from("users")
				.select("*")
				.eq("clerk_id", clerkUser.id)
				.single();

			if (!userData) return;
			setCurrentUser(userData as User);

			// Get household
			const { data: householdData } = await supabase
				.from("households")
				.select("*")
				.eq("id", userData.household_id)
				.single();

			if (householdData) {
				setHousehold(householdData as unknown as Household);

				// Get rooms
				const { data: roomsData } = await supabase
					.from("rooms")
					.select("*")
					.eq("household_id", householdData.id);

				setRooms((roomsData || []) as Room[]);

				// Get tasks for all rooms
				if (roomsData && roomsData.length > 0) {
					const roomIds = roomsData.map((r) => r.id);
					const { data: tasksData } = await supabase
						.from("tasks")
						.select("*")
						.in("room_id", roomIds);

					setTasks((tasksData || []) as Task[]);
				}

				// Get household members
				const { data: membersData } = await supabase
					.from("users")
					.select("*")
					.eq("household_id", householdData.id);

				setMembers((membersData || []) as User[]);
			}
		} catch (err) {
			console.error("Error loading data:", err);
		} finally {
			setLoading(false);
		}
	}, [clerkUser]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const toggleHolidayMode = async () => {
		if (!household) return;

		const newHolidayMode = !household.holiday_mode;

		await supabase
			.from("households")
			.update({
				holiday_mode: newHolidayMode,
				streak_paused_at: newHolidayMode ? new Date().toISOString() : null,
			})
			.eq("id", household.id);

		setHousehold({ ...household, holiday_mode: newHolidayMode });
	};

	const completeTask = async (taskId: string) => {
		if (!currentUser) return;

		const task = tasks.find((t) => t.id === taskId);
		if (!task) return;

		// Add completion record
		await supabase.from("completions").insert({
			task_id: taskId,
			completed_by: currentUser.id,
			points_earned: task.effort_points,
		});

		// Update task last_completed
		await supabase
			.from("tasks")
			.update({ last_completed: new Date().toISOString() })
			.eq("id", taskId);

		// Update user points
		await supabase
			.from("users")
			.update({ total_points: currentUser.total_points + task.effort_points })
			.eq("id", currentUser.id);

		// Refresh data
		loadData();
	};

	const getTodaysTasks = () => {
		const today = new Date();
		const dayOfWeek = today.getDay(); // 0 = Sunday

		return tasks.filter((task) => {
			if (!task.recurrence_type) return false;

			if (task.recurrence_type === "daily") return true;

			if (task.recurrence_type === "weekly" && task.recurrence_days) {
				return task.recurrence_days.includes(dayOfWeek);
			}

			if (task.recurrence_type === "monthly") {
				return today.getDate() === 1; // First of month
			}

			return false;
		});
	};

	const isTaskCompletedToday = (task: Task) => {
		if (!task.last_completed) return false;
		const lastCompleted = new Date(task.last_completed);
		const today = new Date();
		return lastCompleted.toDateString() === today.toDateString();
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-pulse text-xl text-slate-400">
					Loading your chores...
				</div>
			</div>
		);
	}

	const todaysTasks = getTodaysTasks();
	const pendingTasks = todaysTasks.filter((t) => !isTaskCompletedToday(t));
	const completedTasks = todaysTasks.filter((t) => isTaskCompletedToday(t));

	return (
		<div className="pb-20 animate-fade-in">
			{/* Holiday Banner */}
			{household?.holiday_mode && (
				<HolidayBanner onDisable={toggleHolidayMode} />
			)}

			{/* Stats header */}
			<div className="glass-card p-6 mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold">{household?.name}</h2>
						<p className="text-slate-400">
							{pendingTasks.length} tasks remaining today
						</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-center">
							<p className="text-2xl font-bold text-indigo-400">
								{currentUser?.total_points || 0}
							</p>
							<p className="text-xs text-slate-400">points</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-green-400">
								{currentUser?.current_streak || 0}
							</p>
							<p className="text-xs text-slate-400">streak</p>
						</div>
						{!household?.holiday_mode && (
							<button
								onClick={toggleHolidayMode}
								className="btn-secondary text-sm"
								title="Enable holiday mode"
							>
								🏖️ Holiday
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 mb-6">
				{(["today", "rooms", "leaderboard"] as const).map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							activeTab === tab
								? "bg-indigo-500 text-white"
								: "bg-white/5 text-slate-400 hover:bg-white/10"
						}`}
					>
						{tab === "today"
							? "Today's Tasks"
							: tab.charAt(0).toUpperCase() + tab.slice(1)}
					</button>
				))}
			</div>

			{/* Today's Tasks Tab */}
			{activeTab === "today" && (
				<div className="space-y-4">
					{household?.holiday_mode ? (
						<div className="text-center py-12 text-slate-400">
							<p className="text-6xl mb-4">🏖️</p>
							<p className="text-xl">Holiday mode is on</p>
							<p className="text-sm">Enjoy your break! Tasks are paused.</p>
						</div>
					) : todaysTasks.length === 0 ? (
						<div className="text-center py-12 text-slate-400">
							<p className="text-6xl mb-4">🎉</p>
							<p className="text-xl">No tasks scheduled for today!</p>
							<p className="text-sm">Add some chores to get started.</p>
						</div>
					) : (
						<>
							{/* Pending tasks */}
							{pendingTasks.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-slate-400 mb-3">
										TO DO
									</h3>
									<div className="space-y-2">
										{pendingTasks.map((task) => (
											<div
												key={task.id}
												className="task-card flex items-center gap-4"
											>
												<button
													onClick={() => completeTask(task.id)}
													className="task-checkbox"
												></button>
												<div className="flex-1">
													<p className="font-medium">{task.name}</p>
													<p className="text-sm text-slate-400">
														{rooms.find((r) => r.id === task.room_id)?.name}
													</p>
												</div>
												<span
													className={
														task.cleaning_level === "deep"
															? "badge-deep"
															: "badge-surface"
													}
												>
													{task.cleaning_level}
												</span>
												<span className="text-indigo-400 font-medium">
													+{task.effort_points}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Completed tasks */}
							{completedTasks.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-slate-400 mb-3">
										COMPLETED
									</h3>
									<div className="space-y-2">
										{completedTasks.map((task) => (
											<div
												key={task.id}
												className="task-card flex items-center gap-4 opacity-60"
											>
												<div className="task-checkbox checked">
													<svg
														className="w-4 h-4 text-white"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={3}
															d="M5 13l4 4L19 7"
														/>
													</svg>
												</div>
												<div className="flex-1">
													<p className="font-medium line-through">
														{task.name}
													</p>
													<p className="text-sm text-slate-400">
														{rooms.find((r) => r.id === task.room_id)?.name}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</>
					)}
				</div>
			)}

			{/* Rooms Tab */}
			{activeTab === "rooms" && (
				<div>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold">Your Rooms</h3>
						<button
							onClick={() => setShowAddRoom(true)}
							className="btn-primary text-sm"
						>
							+ Add Room
						</button>
					</div>

					{rooms.length === 0 ? (
						<div className="text-center py-12 text-slate-400 glass-card">
							<p className="text-4xl mb-4">🏠</p>
							<p>No rooms yet. Add your first room to get started!</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{rooms.map((room) => (
								<RoomCard
									key={room.id}
									room={room}
									tasks={tasks.filter((t) => t.room_id === room.id)}
									onAddTask={() => {
										setSelectedRoomId(room.id);
										setShowAddTask(true);
									}}
									onTaskComplete={completeTask}
								/>
							))}
						</div>
					)}
				</div>
			)}

			{/* Leaderboard Tab */}
			{activeTab === "leaderboard" && (
				<Leaderboard members={members} currentUserId={currentUser?.id} />
			)}

			{/* Modals */}
			{showAddRoom && (
				<AddRoomModal
					householdId={household?.id || ""}
					onClose={() => setShowAddRoom(false)}
					onSave={() => {
						setShowAddRoom(false);
						loadData();
					}}
				/>
			)}

			{showAddTask && selectedRoomId && (
				<AddTaskModal
					roomId={selectedRoomId}
					roomName={rooms.find((r) => r.id === selectedRoomId)?.name || ""}
					onClose={() => {
						setShowAddTask(false);
						setSelectedRoomId(null);
					}}
					onSave={() => {
						setShowAddTask(false);
						setSelectedRoomId(null);
						loadData();
					}}
				/>
			)}
		</div>
	);
}
