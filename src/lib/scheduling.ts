import type { Task } from "@/types";

export function getNextDueDate(task: Task): Date {
  const baseDate = task.last_completed
    ? new Date(task.last_completed)
    : new Date(task.created_at || Date.now());

  const nextDue = new Date(baseDate);

  if (task.recurrence_type === "daily") {
    // If last_completed, due next day.
    // If new, due today (base).
    if (task.last_completed) {
      nextDue.setDate(nextDue.getDate() + (task.recurrence_interval || 1));
    }
    return nextDue;
  }

  if (task.recurrence_type === "weekly" && task.recurrence_days?.length) {
    let daysToAdd = task.last_completed ? 1 : 0;

    // Scan for next 14 days to find a match
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date(baseDate);
      checkDate.setDate(baseDate.getDate() + daysToAdd);

      if (task.recurrence_days.includes(checkDate.getDay())) {
        return checkDate;
      }
      daysToAdd++;
    }
    return nextDue;
  }

  if (task.recurrence_type === "monthly") {
    // Assume due on 1st of month
    nextDue.setDate(1);

    if (task.last_completed) {
      nextDue.setMonth(nextDue.getMonth() + (task.recurrence_interval || 1));
    }
    return nextDue;
  }

  // Default fallback for custom or other types
  if (task.last_completed) {
    nextDue.setDate(nextDue.getDate() + 1);
  }
  return nextDue;
}

export function getTaskStatus(task: Task): {
  status: "overdue" | "due_today" | "upcoming";
  daysDiff: number;
} {
  // If completed today, it's done.
  if (task.last_completed) {
    const todayStr = new Date().toDateString();
    const completedStr = new Date(task.last_completed).toDateString();
    if (todayStr === completedStr) return { status: "upcoming", daysDiff: 0 }; // effectively "done"
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = getNextDueDate(task);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: "overdue", daysDiff: diffDays };
  if (diffDays === 0) return { status: "due_today", daysDiff: 0 };
  return { status: "upcoming", daysDiff: diffDays };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
