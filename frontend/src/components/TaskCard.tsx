import { useState } from "react";
import type { Task, Priority, Recurrence } from "../types";
import CustomSelect from "./CustomSelect";

type Props = {
  task: Task;
  blocked: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, payload: Partial<Task>) => void;
};

const TaskCard = ({ task, blocked, onDelete, onUpdate }: Props) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [recurrence, setRecurrence] = useState<Recurrence>(task.recurrence);

  const save = () => {
    onUpdate(task.id, {
      title,
      description: description.trim() || null,
      priority,
      recurrence: recurrence ?? null
    });
    setEditing(false);
  };

  return (
    <div className="task-card glass">
      {editing ? (
        <div className="input-group">
          <label>Title</label>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
      ) : (
        <div>
          <h3>{task.title}</h3>
          {task.description && <p className="task-description">{task.description}</p>}
        </div>
      )}
      <div className="task-meta">
        <span className="badge">{task.priority}</span>
        <span>{task.status === "DONE" ? "Done" : "Not done"}</span>
        {task.recurrence && <span>{task.recurrence.toLowerCase()}</span>}
        {task.dependsOnIds.length > 0 && <span>{task.dependsOnIds.length} deps</span>}
      </div>
      {editing && (
        <>
          <div className="input-group">
            <label>Priority</label>
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
            <label>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Recurrence</label>
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
        </>
      )}
      {blocked && <div className="notice">Blocked by dependencies</div>}
      <div className="task-actions">
        {editing ? (
          <button onClick={save}>Save</button>
        ) : (
          <button onClick={() => setEditing(true)}>Edit</button>
        )}
        <button
          className="secondary"
          onClick={() => onUpdate(task.id, { status: task.status === "DONE" ? "NOT_DONE" : "DONE" })}
          disabled={blocked && task.status !== "DONE"}
        >
          {task.status === "DONE" ? "Undo" : "Mark done"}
        </button>
        <button className="secondary" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
