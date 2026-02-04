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
      // Hide completed one-off tasks from "Next Due"
      // They will appear in "Last Completed" history only.
      if (!t.recurrence_type && t.last_completed) return false;

      // Recurring tasks are always shown in "Next Due" because they always have a future schedule,
      // even if completed today (e.g. Weekly completed today -> Due next week).
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
    (t) => getTaskStatus(t).status === "overdue"
  ).length;

  // If variant is daily, we might pass pre-filtered "today's tasks" only into the component.
  // Check completion rate logic below.

  const validTasks = variant === "daily" ? tasks : tasks; // potentially redundant but clear
  const pendingCount = validTasks.filter(
    (t) => !completedToday.includes(t)
  ).length;

  const completionRate =
    validTasks.length > 0
      ? Math.round(
          ((validTasks.length - pendingCount) / validTasks.length) * 100
        )
      : 0;

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
      <div className="custom-scrollbar mb-4 max-h-[300px] flex-1 space-y-4 overflow-y-auto pr-1">
        {variant === "daily" && (
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
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
              <h4 className="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Next Due
              </h4>
              {outstandingTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nothing pending</p>
              ) : (
                <div className="space-y-2">
                  {outstandingTasks.slice(0, 5).map((task) => {
                    const status = getTaskStatus(task);
                    const nextDue = getNextDueDate(task);

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-lg bg-white/5 p-2"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <button
                            onClick={() => onTaskComplete(task.id)}
                            className="task-checkbox h-4 min-h-[1rem] w-4 min-w-[1rem]"
                          ></button>
                          <span className="truncate text-sm">{task.name}</span>
                        </div>
                        <div className="flex min-w-[60px] flex-col items-end">
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
                    <p className="text-center text-xs text-slate-500">
                      +{outstandingTasks.length - 5} more
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Completed Section */}
            <div>
              <h4 className="mt-4 mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Last Completed
              </h4>
              {completedTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No history</p>
              ) : (
                <div className="space-y-2">
                  {completedTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg p-2 opacity-60"
                    >
                      <span className="mr-2 flex-1 truncate text-sm line-through">
                        {task.name}
                      </span>
                      <span className="text-[10px] whitespace-nowrap text-slate-400">
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
}: {
  task: Task;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-2 transition-all ${
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
      <span
        className={`flex-1 text-sm ${isCompleted ? "text-slate-500 line-through" : ""}`}
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
