import type { TaskFilters } from "../store/taskStore";
import CustomSelect from "./CustomSelect";

type Props = {
  filters: TaskFilters;
  onChange: (next: TaskFilters) => void;
};

const TaskFilters = ({ filters, onChange }: Props) => (
  <div className="filters after-header">
    <input
      placeholder="Search tasks"
      value={filters.search ?? ""}
      onChange={(event) => onChange({ ...filters, search: event.target.value })}
    />
    <CustomSelect
      value={filters.status ?? ""}
      placeholder="All status"
      onChange={(value) => onChange({ ...filters, status: (value || undefined) as TaskFilters["status"] })}
      options={[
        { value: "", label: "All status" },
        { value: "NOT_DONE", label: "Not done" },
        { value: "DONE", label: "Done" }
      ]}
    />
    <CustomSelect
      value={filters.priority ?? ""}
      placeholder="All priority"
      onChange={(value) => onChange({ ...filters, priority: (value || undefined) as TaskFilters["priority"] })}
      options={[
        { value: "", label: "All priority" },
        { value: "LOW", label: "Low" },
        { value: "MEDIUM", label: "Medium" },
        { value: "HIGH", label: "High" }
      ]}
    />
    <CustomSelect
      value={filters.sort ?? "createdAt"}
      onChange={(value) => onChange({ ...filters, sort: value as TaskFilters["sort"] })}
      options={[
        { value: "createdAt", label: "Sort by created" },
        { value: "priority", label: "Sort by priority" },
        { value: "status", label: "Sort by status" }
      ]}
    />
    <CustomSelect
      value={filters.order ?? "asc"}
      onChange={(value) => onChange({ ...filters, order: value as TaskFilters["order"] })}
      options={[
        { value: "asc", label: "Ascending" },
        { value: "desc", label: "Descending" }
      ]}
    />
  </div>
);

export default TaskFilters;
