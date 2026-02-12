import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { taskStore } from "../store/taskStore";
import TopBar from "../components/TopBar";
import BarChart from "../components/BarChart";
import CustomSelect from "../components/CustomSelect";
import type { Priority, Recurrence, TaskStatus } from "../types";

const Stats = () => {
  const { tasks, fetchTasks, updateTask, deleteTask } = taskStore();
  const navigate = useNavigate();
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [frequencyFilter, setFrequencyFilter] = useState<Recurrence | "" | "NONE">("");
  const [blockedFilter, setBlockedFilter] = useState<"" | "BLOCKED" | "CLEAR">("");

  useEffect(() => {
    fetchTasks({});
  }, [fetchTasks]);

  const priorityStats = useMemo(() => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    tasks.forEach((task) => {
      counts[task.priority] += 1;
    });
    return [
      { label: "Low", value: counts.LOW, tone: "cool" },
      { label: "Medium", value: counts.MEDIUM, tone: "neutral" },
      { label: "High", value: counts.HIGH, tone: "warm" }
    ];
  }, [tasks]);

  const statusStats = useMemo(() => {
    const counts = { NOT_DONE: 0, DONE: 0 };
    tasks.forEach((task) => {
      counts[task.status] += 1;
    });
    return [
      { label: "Not done", value: counts.NOT_DONE, tone: "neutral" },
      { label: "Done", value: counts.DONE, tone: "cool" }
    ];
  }, [tasks]);

  const taskMap = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((task) => map.set(task.id, task.status));
    return map;
  }, [tasks]);

  const upcoming = useMemo(() => {
    return tasks
      .filter((task) => (statusFilter ? task.status === statusFilter : true))
      .filter((task) => (priorityFilter ? task.priority === priorityFilter : true))
      .filter((task) => {
        if (!frequencyFilter) return true;
        if (frequencyFilter === "NONE") return task.recurrence === null;
        return task.recurrence === frequencyFilter;
      })
      .filter((task) => {
        if (!blockedFilter) return true;
        const isBlocked = task.dependsOnIds.some((id) => taskMap.get(id) === "NOT_DONE");
        return blockedFilter === "BLOCKED" ? isBlocked : !isBlocked;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 6);
  }, [tasks, blockedFilter, frequencyFilter, priorityFilter, statusFilter, taskMap]);

  return (
    <div className="app-shell">
      <div className="page page-compact">
        <TopBar />
        <div className="stats-grid after-header">
          <BarChart title="Priority Breakdown" bars={priorityStats} />
          <BarChart title="Status Breakdown" bars={statusStats} />
        </div>
        <div className="stats-upcoming glass">
          <h3>Upcoming Tickets</h3>
          <div className="upcoming-filters">
            <CustomSelect
              value={priorityFilter}
              placeholder="All priority"
              onChange={(value) => setPriorityFilter(value as Priority | "")}
              options={[
                { value: "", label: "All priority" },
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" }
              ]}
            />
            <CustomSelect
              value={statusFilter}
              placeholder="All status"
              onChange={(value) => setStatusFilter(value as TaskStatus | "")}
              options={[
                { value: "", label: "All status" },
                { value: "NOT_DONE", label: "Not done" },
                { value: "DONE", label: "Done" }
              ]}
            />
            <CustomSelect
              value={frequencyFilter}
              placeholder="All frequency"
              onChange={(value) => setFrequencyFilter(value as Recurrence | "" | "NONE")}
              options={[
                { value: "", label: "All frequency" },
                { value: "NONE", label: "None" },
                { value: "DAILY", label: "Daily" },
                { value: "WEEKLY", label: "Weekly" },
                { value: "MONTHLY", label: "Monthly" }
              ]}
            />
            <CustomSelect
              value={blockedFilter}
              placeholder="All blocked"
              onChange={(value) => setBlockedFilter(value as "" | "BLOCKED" | "CLEAR")}
              options={[
                { value: "", label: "All blocked" },
                { value: "BLOCKED", label: "Blocked" },
                { value: "CLEAR", label: "Not blocked" }
              ]}
            />
          </div>
          <div className="upcoming-table">
            <div className="upcoming-row header">
              <span>Title</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Frequency</span>
              <span>Blocked</span>
              <span>Actions</span>
            </div>
            {upcoming.map((task) => (
              <div className="upcoming-row" key={task.id}>
                <span>{task.title}</span>
                <span className="upcoming-pill">{task.priority}</span>
                <span>{task.status === "DONE" ? "Done" : "Not done"}</span>
                <span>{task.recurrence ? task.recurrence.toLowerCase() : "None"}</span>
                <span>
                  {task.dependsOnIds.some((id) => taskMap.get(id) === "NOT_DONE") ? "Blocked" : "Clear"}
                </span>
                <div className="upcoming-actions">
                  <button
                    type="button"
                    onClick={() => navigate("/tasks", { state: { editTaskId: task.id } })}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() =>
                      updateTask(task.id, { status: task.status === "DONE" ? "NOT_DONE" : "DONE" })
                    }
                    disabled={
                      task.dependsOnIds.some((id) => taskMap.get(id) === "NOT_DONE") &&
                      task.status !== "DONE"
                    }
                  >
                    {task.status === "DONE" ? "Undo" : "Mark done"}
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && <span className="muted">No upcoming tickets.</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
