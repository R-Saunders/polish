"use client";

import type { Room, Task } from "@/types";
import { getNextDueDate, getTaskStatus, formatDate } from "@/lib/scheduling";

interface RoomCardProps {
	room: Room;
	tasks: Task[];
	onAddTask: () => void;
	onTaskComplete: (taskId: string) => void;
	variant?: "daily" | "overview";
}

export function RoomCard({
	room,
	tasks,
	onAddTask,
	onTaskComplete,
	variant = "daily",
}: RoomCardProps) {
	// Logic for "Daily" mode (Progress based on today's tasks)
	// Logic for "Overview" mode (Split lists)

	// Filter tasks
	const completedToday = tasks.filter((t) => {
		if (!t.last_completed) return false;
		return (
			new Date(t.last_completed).toDateString() === new Date().toDateString()
		);
	});

	// For Overview mode, we separate into:
	// 1. Outstanding (Not completed today, sorted by due date/overdue)
	// 2. Recently Completed (Completed today or past, sorted by date desc)

	// BUT per request "split by last completed and next due".
	// "Next Due" = Outstanding tasks.
	// "Last Completed" = Completed tasks.

	const outstandingTasks = tasks
		.filter((t) => {
			// If completed today, it's not outstanding for "now" context usually?
			// Actually user wants "Next due... if today or future".
			// If completed TODAY, it's done for today.
			// If completed yesterday, it might be due today.
			if (
				t.last_completed &&
				new Date(t.last_completed).toDateString() === new Date().toDateString()
			)
				return false;
			return true;
		})
		.sort((a, b) => {
			const statusA = getTaskStatus(a);
			const statusB = getTaskStatus(b);
			return statusA.daysDiff - statusB.daysDiff; // Most overdue first
		});

	const completedTasks = tasks
		.filter((t) => t.last_completed)
		.sort((a, b) => {
			return (
				new Date(b.last_completed!).getTime() -
				new Date(a.last_completed!).getTime()
			);
		});

	// Calculation for ring depends on mode?
	// Daily: % of today's tasks done.
	// Overview: Maybe % of TOTAL tasks that are not overdue?
	// Let's stick to "Today's compliance" for consistency or just hide ring in overview?
	// User said "same design", so ring usually stays.
	// Let's make ring reflect "Current Health" -> % of tasks NOT overdue.

	const overdueCount = tasks.filter(
		(t) => getTaskStatus(t).status === "overdue",
	).length;

	// If variant is daily, we might pass pre-filtered "today's tasks" only into the component.
	// Check completion rate logic below.

	const validTasks = variant === "daily" ? tasks : tasks; // potentially redundant but clear
	const pendingCount = validTasks.filter(
		(t) => !completedToday.includes(t),
	).length;

	const completionRate =
		validTasks.length > 0
			? Math.round(
					((validTasks.length - pendingCount) / validTasks.length) * 100,
				)
			: 0;

	return (
		<div className="glass-card p-5 flex flex-col h-full">
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<span
						className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl"
						style={{ backgroundColor: `${room.color}20` }}
					>
						{room.icon}
					</span>
					<div>
						<h3 className="font-semibold text-lg">{room.name}</h3>
						<p className="text-sm text-slate-400">{tasks.length} chores</p>
					</div>
				</div>

				{/* Progress ring - Visualization of "Health" */}
				<div className="relative w-12 h-12">
					<svg className="progress-ring w-12 h-12" viewBox="0 0 40 40">
						<circle
							className="text-white/10"
							strokeWidth="4"
							stroke="currentColor"
							fill="transparent"
							r="16"
							cx="20"
							cy="20"
						/>
						<circle
							className={`progress-ring__circle ${variant === "overview" && overdueCount > 0 ? "text-amber-500" : "text-green-400"}`}
							strokeWidth="4"
							stroke="currentColor"
							fill="transparent"
							r="16"
							cx="20"
							cy="20"
							strokeDasharray={`${completionRate} ${100 - completionRate}`}
							strokeLinecap="round"
						/>
					</svg>
					<span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
						{completionRate}%
					</span>
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
				{variant === "daily" && (
					<div className="space-y-2">
						{tasks.length === 0 ? (
							<p className="text-slate-500 text-sm text-center py-4">
								No chores today
							</p>
						) : (
							tasks.map((task) => {
								const isCompleted = completedToday.includes(task);
								return (
									<TaskItem
										key={task.id}
										task={task}
										isCompleted={isCompleted}
										onComplete={() => onTaskComplete(task.id)}
									/>
								);
							})
						)}
					</div>
				)}

				{variant === "overview" && (
					<>
						{/* Outstanding Section */}
						<div>
							<h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
								Next Due
							</h4>
							{outstandingTasks.length === 0 ? (
								<p className="text-slate-500 text-xs italic">Nothing pending</p>
							) : (
								<div className="space-y-2">
									{outstandingTasks.slice(0, 5).map((task) => {
										const status = getTaskStatus(task);
										const nextDue = getNextDueDate(task);

										return (
											<div
												key={task.id}
												className="flex items-center justify-between p-2 rounded-lg bg-white/5"
											>
												<div className="flex items-center gap-2 overflow-hidden">
													<button
														onClick={() => onTaskComplete(task.id)}
														className="task-checkbox w-4 h-4 min-w-[1rem] min-h-[1rem]"
													></button>
													<span className="text-sm truncate">{task.name}</span>
												</div>
												<div className="flex flex-col items-end min-w-[60px]">
													<span
														className={`text-[10px] font-medium ${
															status.status === "overdue"
																? "text-red-400"
																: status.status === "due_today"
																	? "text-green-400"
																	: "text-slate-400"
														}`}
													>
														{status.status === "overdue"
															? `${Math.abs(status.daysDiff)}d Late`
															: status.status === "due_today"
																? "Today"
																: formatDate(nextDue.toISOString())}
													</span>
												</div>
											</div>
										);
									})}
									{outstandingTasks.length > 5 && (
										<p className="text-xs text-center text-slate-500">
											+{outstandingTasks.length - 5} more
										</p>
									)}
								</div>
							)}
						</div>

						{/* Completed Section */}
						<div>
							<h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">
								Last Completed
							</h4>
							{completedTasks.length === 0 ? (
								<p className="text-slate-500 text-xs italic">No history</p>
							) : (
								<div className="space-y-2">
									{completedTasks.slice(0, 3).map((task) => (
										<div
											key={task.id}
											className="flex items-center justify-between p-2 rounded-lg opacity-60"
										>
											<span className="text-sm line-through truncate flex-1 mr-2">
												{task.name}
											</span>
											<span className="text-[10px] text-slate-400 whitespace-nowrap">
												{formatDate(task.last_completed!)}
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					</>
				)}
			</div>

			<button
				onClick={onAddTask}
				className="btn-secondary text-sm w-full mt-auto"
			>
				+ Add Chore
			</button>
		</div>
	);
}

function TaskItem({
	task,
	isCompleted,
	onComplete,
}: {
	task: Task;
	isCompleted: boolean;
	onComplete: () => void;
}) {
	return (
		<div
			className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
				isCompleted ? "opacity-50" : "hover:bg-white/5"
			}`}
		>
			<button
				onClick={() => !isCompleted && onComplete()}
				disabled={isCompleted}
				className={`task-checkbox ${isCompleted ? "checked" : ""}`}
			>
				{isCompleted && (
					<svg
						className="w-3 h-3 text-white"
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
				)}
			</button>
			<span
				className={`text-sm flex-1 ${isCompleted ? "line-through text-slate-500" : ""}`}
			>
				{task.name}
			</span>
			<span
				className={
					task.cleaning_level === "deep" ? "badge-deep" : "badge-surface"
				}
			>
				{task.cleaning_level}
			</span>
		</div>
	);
}
