import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Subtask {
  _id?: string;
  title: string;
  completed: boolean;
}

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  subtasks: Subtask[];
  listId: string;
}

interface TaskManagementProps {
  tasks: Task[];
  isLoading: boolean;
  selectedList: string | null;
  onAddTask: (title: string, dueDate?: Date, subtasks?: Subtask[]) => void;
  onToggleTask: (id: string, completed: boolean) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

export function TaskManagement({
  tasks,
  isLoading,
  selectedList,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}: TaskManagementProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(
    undefined
  );
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleToggleSubtask = (taskId: string, subtaskIndex: number) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      const updatedSubtasks = task.subtasks.map((subtask, index) =>
        index === subtaskIndex
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      );
      onUpdateTask(taskId, { subtasks: updatedSubtasks });
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() && selectedList) {
      onAddTask(newTaskTitle, newTaskDueDate);
      setNewTaskTitle("");
      setNewTaskDueDate(undefined);
      setIsAddTaskDialogOpen(false);
    }
  };

  const handleEditTask = () => {
    if (editingTask && editingTask.title.trim()) {
      onUpdateTask(editingTask._id, {
        title: editingTask.title,
        dueDate: editingTask.dueDate,
      });
      setEditingTask(null);
    }
  };

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task._id}
            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleTask(task._id, task.completed)}
              />
              <span
                className={`flex-grow ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </span>
              {task.dueDate && (
                <span className="text-sm text-gray-500">
                  Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setExpandedTask(expandedTask === task._id ? null : task._id)
                }
              >
                {expandedTask === task._id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingTask(task)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteTask(task._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {expandedTask === task._id && task.subtasks.length > 0 && (
              <ul className="mt-2 pl-6 space-y-1">
                {task.subtasks.map((subtask, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() =>
                        handleToggleSubtask(task._id, index)
                      }
                    />
                    <span
                      className={
                        subtask.completed ? "line-through text-gray-500" : ""
                      }
                    >
                      {subtask.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" disabled={!selectedList}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-title" className="text-right">
                Title
              </Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due-date" className="text-right">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="due-date"
                    variant="outline"
                    className={`col-span-3 justify-start text-left font-normal ${
                      !newTaskDueDate && "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newTaskDueDate ? (
                      format(newTaskDueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={setNewTaskDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
            Add Task
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-task-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-task-title"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-due-date" className="text-right">
                  Due Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="edit-due-date"
                      variant="outline"
                      className={`col-span-3 justify-start text-left font-normal ${
                        !editingTask.dueDate && "text-muted-foreground"
                      }`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {editingTask.dueDate ? (
                        format(new Date(editingTask.dueDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={editingTask.dueDate}
                      onSelect={(date) =>
                        setEditingTask({ ...editingTask, dueDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          <Button
            onClick={handleEditTask}
            disabled={!editingTask?.title.trim()}
          >
            Update Task
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
