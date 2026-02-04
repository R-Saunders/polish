"use client";

import type { Room, Task } from "@/types";
import { getNextDueDate, getTaskStatus, formatDate } from "@/lib/scheduling";

interface RoomCardProps {
  room: Room;
  tasks: Task[];
  onAddTask: () => void;
  onTaskComplete: (taskId: string) => void;
  onSkip?: (taskId: string) => void;
  onAdvance?: (taskId: string) => void;
  variant?: "daily" | "overview";
}

export function RoomCard({
  room,
  tasks,
  onAddTask,
  onTaskComplete,
  onSkip,
  onAdvance,
  variant = "daily",
}: RoomCardProps) {
  // Logic for "Daily" mode (Progress based on today's tasks)
  // Logic for "Overview" mode (Split lists)

  // Unified list logic: Simply sort tasks by urgency
  const sortedTasks = tasks
    .filter((t) => {
      // Hide completed one-off tasks (they are history)
      if (!t.recurrence_type && t.last_completed) return false;
      return true;
    })
    .sort((a, b) => {
      const statusA = getTaskStatus(a);
      const statusB = getTaskStatus(b);
      return statusA.daysDiff - statusB.daysDiff;
    });

  // Check completion rate logic
  // We calculate rate based on "Today's Status" usually?
  // Or "Current Health" of the room (are things overdue?)
  // Let's stick to "Percentage of tasks NOT overdue" for health ring.
  const overdueCount = tasks.filter(
    (t) => getTaskStatus(t).status === "overdue"
  ).length;

  const completionRate =
    tasks.length > 0
      ? Math.round(((tasks.length - overdueCount) / tasks.length) * 100)
      : 100;

  return (
    <div className="glass-card flex h-full flex-col p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl text-3xl"
            style={{ backgroundColor: `${room.color}20` }}
          >
            {room.icon}
          </span>
          <div>
            <h3 className="text-lg font-semibold">{room.name}</h3>
            <p className="text-sm text-slate-400">{tasks.length} chores</p>
          </div>
        </div>

        {/* Progress ring - Visualization of "Health" */}
        <div className="relative h-12 w-12">
          <svg className="progress-ring h-12 w-12" viewBox="0 0 40 40">
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
              className={`progress-ring__circle ${overdueCount > 0 ? "text-amber-500" : "text-green-400"}`}
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
      <div className="mb-4 flex-1 space-y-4 pr-1">
        <div className="space-y-2">
          {sortedTasks.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              All caught up!
            </p>
          ) : (
            sortedTasks.map((task) => {
              // Check if completed TODAY for the checkbox state
              const isCompletedToday =
                task.last_completed &&
                new Date(task.last_completed).toDateString() ===
                  new Date().toDateString();

              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  isCompleted={!!isCompletedToday}
                  onComplete={() => onTaskComplete(task.id)}
                  onSkip={() => onSkip?.(task.id)}
                  onAdvance={() => onAdvance?.(task.id)}
                  showDates={variant === "overview"}
                />
              );
            })
          )}
        </div>
      </div>

      <button
        onClick={onAddTask}
        className="btn-secondary mt-auto w-full text-sm"
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
  onSkip,
  onAdvance,
  showDates,
}: {
  task: Task;
  isCompleted: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  onAdvance?: () => void;
  showDates?: boolean;
}) {
  const status = getTaskStatus(task);
  const nextDue = getNextDueDate(task);

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg p-3 transition-all ${
        isCompleted ? "opacity-50" : "bg-white/5 hover:bg-white/10"
      }`}
    >
      <button
        onClick={() => !isCompleted && onComplete()}
        disabled={isCompleted}
        className={`task-checkbox mt-1 ${isCompleted ? "checked" : ""}`}
      >
        {isCompleted && (
          <svg
            className="h-3 w-3 text-white"
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

      <div className="min-w-0 flex-1">
        <div
          className={`text-base font-medium ${isCompleted ? "text-slate-500 line-through" : ""}`}
        >
          {task.name}
        </div>

        {/* Metadata Row */}
        {showDates && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            {/* Next Due Date */}
            <span
              className={`${
                status.status === "overdue"
                  ? "font-medium text-red-400"
                  : status.status === "due_today"
                    ? "font-medium text-green-400"
                    : ""
              }`}
            >
              {status.status === "due_today"
                ? "Due Today"
                : `Due: ${formatDate(nextDue.toISOString())}`}
              {status.status === "overdue" &&
                ` (${Math.abs(status.daysDiff)}d late)`}
            </span>

            {/* Last Completed */}
            {task.last_completed && (
              <span>Last: {formatDate(task.last_completed)}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        {/* Badge */}
        <span
          className={
            task.cleaning_level === "deep" ? "badge-deep" : "badge-surface"
          }
        >
          {task.cleaning_level}
        </span>

        {/* Still Clean Button */}
        {!isCompleted &&
          onSkip &&
          (status.status === "overdue" || status.status === "due_today") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSkip();
              }}
              className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-slate-300 hover:bg-white/20 hover:text-white"
            >
              Still clean?
            </button>
          )}

        {/* Advance Button (Mark Next Done) */}
        {isCompleted && onAdvance && task.recurrence_type && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdvance();
            }}
            className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200"
          >
            Mark Next Done
          </button>
        )}
      </div>
    </div>
  );
}
