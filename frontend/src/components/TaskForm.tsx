import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Task, Priority, Recurrence } from "../types";
import CustomSelect from "./CustomSelect";

type Props = {
  tasks: Task[];
  onCreate: (payload: {
    title: string;
    description?: string | null;
    priority: Priority;
    recurrence: Recurrence;
    dependsOnIds: string[];
  }) => void;
  onUpdate?: (id: string, payload: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>) => void;
  editTask?: Task | null;
  onCancelEdit?: () => void;
};

const TaskForm = ({ tasks, onCreate, onUpdate, editTask, onCancelEdit }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [recurrence, setRecurrence] = useState<Recurrence>(null);
  const [dependsOnIds, setDependsOnIds] = useState<string[]>([]);

  const availableTasks = useMemo(() => {
    if (!editTask) return tasks;
    return tasks.filter((task) => task.id !== editTask.id);
  }, [editTask, tasks]);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description ?? "");
      setPriority(editTask.priority);
      setRecurrence(editTask.recurrence ?? null);
      setDependsOnIds(editTask.dependsOnIds ?? []);
      return;
    }
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setRecurrence(null);
    setDependsOnIds([]);
  }, [editTask]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    if (editTask && onUpdate) {
      onUpdate(editTask.id, {
        title,
        description: description.trim() || null,
        priority,
        recurrence,
        dependsOnIds
      });
      onCancelEdit?.();
    } else {
      onCreate({ title, description: description.trim() || null, priority, recurrence, dependsOnIds });
    }
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setRecurrence(null);
    setDependsOnIds([]);
  };

  return (
    <form className="form-panel glass" onSubmit={submit}>
      <h3>{editTask ? "Edit task" : "Create a task"}</h3>
      <div className="input-group">
        <label htmlFor="task-title">Title</label>
        <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="input-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="task-priority">Priority</label>
        <CustomSelect
          value={priority}
          onChange={(value) => setPriority(value as Priority)}
          options={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" }
          ]}
        />
      </div>
      <div className="input-group">
        <label htmlFor="task-recurrence">Recurring</label>
        <CustomSelect
          value={recurrence ?? ""}
          placeholder="No recurrence"
          onChange={(value) => setRecurrence(value ? (value as Recurrence) : null)}
          options={[
            { value: "DAILY", label: "Daily" },
            { value: "WEEKLY", label: "Weekly" },
            { value: "MONTHLY", label: "Monthly" }
          ]}
        />
      </div>
      <div className="input-group">
        <label htmlFor="task-deps">Depends on</label>
        <CustomSelect
          multiple
          value={dependsOnIds}
          placeholder="No dependencies"
          onChange={(value) => setDependsOnIds(value as string[])}
          options={availableTasks.map((task) => ({ value: task.id, label: task.title }))}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="button-half">
          {editTask ? "Save changes" : "Add task"}
        </button>
        {editTask && (
          <button type="button" className="secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
