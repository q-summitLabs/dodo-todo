import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  listId: string;
}

interface TaskManagementProps {
  tasks: Task[];
  isLoading: boolean;
  selectedList: string | null;
  onAddTask: (title: string) => void;
  onToggleTask: (id: string, completed: boolean) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskManagement({
  tasks,
  isLoading,
  selectedList,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TaskManagementProps) {
  const [newTask, setNewTask] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() && selectedList) {
      onAddTask(newTask);
      setNewTask("");
    }
  };

  return (
    <div className="md:col-span-2">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      <form onSubmit={handleAddTask} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
            className="flex-grow"
          />
          <Button type="submit" disabled={!selectedList}>
            Add Task
          </Button>
        </div>
      </form>
      {isLoading ? (
        <div className="text-center">Loading tasks...</div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex items-center gap-2 p-2 border rounded"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleTask(task._id, task.completed)}
              />
              <span
                className={task.completed ? "line-through text-gray-500" : ""}
              >
                {task.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => onDeleteTask(task._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
