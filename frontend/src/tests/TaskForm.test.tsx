import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import TaskForm from "../components/TaskForm";

describe("TaskForm", () => {
  it("submits a new task", () => {
    const onCreate = vi.fn();
    render(<TaskForm tasks={[]} onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "New task" }
    });

    fireEvent.click(screen.getByText(/add task/i));

    expect(onCreate).toHaveBeenCalled();
  });
});
