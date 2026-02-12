import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import { taskStore } from "../store/taskStore";
import type { Task } from "../types";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const daysBetween = (from: Date, to: Date) => {
  const diff = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
};

const isRecurringOnDate = (task: Task, date: Date) => {
  if (!task.recurrence) return false;
  const start = new Date(task.createdAt);
  if (startOfDay(date) < startOfDay(start)) return false;

  if (task.recurrence === "DAILY") return true;
  if (task.recurrence === "WEEKLY") {
    return daysBetween(start, date) % 7 === 0;
  }
  if (task.recurrence === "MONTHLY") {
    return date.getDate() === start.getDate();
  }
  return false;
};

const CalendarPage = () => {
  const { tasks, fetchTasks } = taskStore();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    fetchTasks({});
  }, [fetchTasks]);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const totalDays = monthEnd.getDate();
  const startWeekday = monthStart.getDay();

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();

    tasks.forEach((task) => {
      if (!task.recurrence) {
        const key = formatDateKey(new Date(task.createdAt));
        const bucket = map.get(key) ?? [];
        bucket.push(task);
        map.set(key, bucket);
      }
    });

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const key = formatDateKey(date);
      const recurring = tasks.filter((task) => isRecurringOnDate(task, date));
      if (recurring.length) {
        const bucket = map.get(key) ?? [];
        bucket.push(...recurring);
        map.set(key, bucket);
      }
    }

    return map;
  }, [currentMonth, tasks, totalDays]);

  const dayCells = useMemo(() => {
    const cells: Array<{ date: Date | null }> = [];
    for (let i = 0; i < startWeekday; i += 1) {
      cells.push({ date: null });
    }
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) });
    }
    return cells;
  }, [currentMonth, startWeekday, totalDays]);

  return (
    <div className="app-shell">
      <div className="page">
        <TopBar />
        <div className="calendar-shell glass">
          <div className="calendar-header">
            <h3>Calendar</h3>
            <div className="calendar-controls">
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                  )
                }
              >
                Prev
              </button>
              <span className="calendar-month">
                {currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {weekdayLabels.map((label) => (
              <div key={label} className="calendar-weekday">
                {label}
              </div>
            ))}
            {dayCells.map((cell, index) => {
              if (!cell.date) {
                return <div key={`empty-${index}`} className="calendar-day empty" />;
              }
              const dateKey = formatDateKey(cell.date);
              const dayTasks = tasksByDate.get(dateKey) ?? [];
              return (
                <div key={dateKey} className="calendar-day">
                  <div className="calendar-day-number">{cell.date.getDate()}</div>
                  <div className="calendar-task-list">
                    {dayTasks.map((task) => (
                      <div key={task.id} className="calendar-task">
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
