"use client";

import type { Room, Task } from "@/types";

interface RoomCardProps {
	room: Room;
	tasks: Task[];
	onAddTask: () => void;
	onTaskComplete: (taskId: string) => void;
}

export function RoomCard({
	room,
	tasks,
	onAddTask,
	onTaskComplete,
}: RoomCardProps) {
	const pendingTasks = tasks.filter((t) => {
		if (!t.last_completed) return true;
		const lastCompleted = new Date(t.last_completed);
		const today = new Date();
		return lastCompleted.toDateString() !== today.toDateString();
	});

	const completionRate =
		tasks.length > 0
			? Math.round(((tasks.length - pendingTasks.length) / tasks.length) * 100)
			: 0;

	return (
		<div className="glass-card p-5 flex flex-col">
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

				{/* Progress ring */}
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
							className="text-green-400 progress-ring__circle"
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

			{/* Task list preview */}
			<div className="flex-1 space-y-2 mb-4 max-h-48 overflow-y-auto">
				{tasks.length === 0 ? (
					<p className="text-slate-500 text-sm text-center py-4">
						No chores yet
					</p>
				) : (
					tasks.slice(0, 5).map((task) => {
						const isCompleted =
							task.last_completed &&
							new Date(task.last_completed).toDateString() ===
								new Date().toDateString();

						return (
							<div
								key={task.id}
								className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
									isCompleted ? "opacity-50" : "hover:bg-white/5"
								}`}
							>
								<button
									onClick={() => !isCompleted && onTaskComplete(task.id)}
									disabled={!!isCompleted}
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
										task.cleaning_level === "deep"
											? "badge-deep"
											: "badge-surface"
									}
								>
									{task.cleaning_level}
								</span>
							</div>
						);
					})
				)}
				{tasks.length > 5 && (
					<p className="text-slate-500 text-xs text-center">
						+{tasks.length - 5} more
					</p>
				)}
			</div>

			<button onClick={onAddTask} className="btn-secondary text-sm w-full">
				+ Add Chore
			</button>
		</div>
	);
}
