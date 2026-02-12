import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { taskStore, type TaskFilters } from "../store/taskStore";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import TaskFiltersPanel from "../components/TaskFilters";
import TopBar from "../components/TopBar";
import type { Task } from "../types";

const Tasks = () => {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, loading, error } = taskStore();
  const [filters, setFilters] = useState<TaskFilters>({ sort: "createdAt", order: "asc" });
  const [editTask, setEditTask] = useState<Task | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const editTaskId = (location.state as { editTaskId?: string } | null)?.editTaskId;

  useEffect(() => {
    fetchTasks(filters);
  }, [fetchTasks, filters]);

  useEffect(() => {
    if (!editTaskId || tasks.length === 0) return;
    const match = tasks.find((task) => task.id === editTaskId);
    if (match) {
      setEditTask(match);
      navigate("/tasks", { replace: true, state: {} });
    }
  }, [editTaskId, navigate, tasks]);

  const taskMap = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((task) => map.set(task.id, task.status));
    return map;
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [tasks]);

  return (
    <div className="app-shell">
      <div className="page">
        <TopBar />
        <TaskFiltersPanel filters={filters} onChange={setFilters} />
        <div className="tasks-layout">
          <TaskForm
            tasks={tasks}
            onCreate={createTask}
            onUpdate={updateTask}
            editTask={editTask}
            onCancelEdit={() => setEditTask(null)}
          />
          <div className="tasks-navigator glass">
            {error && <div className="notice">{error}</div>}
            {loading && <div className="notice">Loading...</div>}
            <div className="tasks-scroll">
              <div className="tasks-grid">
                {recentTasks.map((task) => {
                  const blocked = task.dependsOnIds.some((id) => taskMap.get(id) === "NOT_DONE");
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      blocked={blocked}
                      onDelete={deleteTask}
                      onUpdate={updateTask}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
