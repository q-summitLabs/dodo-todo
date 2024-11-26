import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

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
  const [newTask, setNewTask] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() && selectedList) {
      onAddTask(newTask, selectedDate);
      setNewTask("");
      setSelectedDate(undefined);
      setIsDialogOpen(false);
    }
  };

  const handleAddSubtask = (taskId: string) => {
    if (newSubtask.trim()) {
      const task = tasks.find((t) => t._id === taskId);
      if (task) {
        const updatedSubtasks = [
          ...task.subtasks,
          { title: newSubtask, completed: false },
        ];
        onUpdateTask(taskId, { subtasks: updatedSubtasks });
        setNewSubtask("");
      }
    }
  };

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

  const handleDeleteSubtask = (taskId: string, subtaskIndex: number) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      const updatedSubtasks = task.subtasks.filter(
        (_, index) => index !== subtaskIndex
      );
      onUpdateTask(taskId, { subtasks: updatedSubtasks });
    }
  };

  return (
    <div className="md:col-span-2">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4" disabled={!selectedList}>
            Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="task-due-date"
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !selectedDate && "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button type="submit" className="w-full">
              Add Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {isLoading ? (
        <div className="text-center">Loading tasks...</div>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task._id} className="border rounded p-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleTask(task._id, task.completed)}
                />
                <span
                  className={task.completed ? "line-through text-gray-500" : ""}
                >
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="text-sm text-gray-500 ml-2">
                    Due: {format(new Date(task.dueDate), "PPP")}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => onDeleteTask(task._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedTask(expandedTask === task._id ? null : task._id)
                  }
                >
                  {expandedTask === task._id ? "Hide" : "Show"} Subtasks
                </Button>
              </div>
              {expandedTask === task._id && (
                <div className="mt-2 pl-6">
                  <ul className="space-y-2">
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
                            subtask.completed
                              ? "line-through text-gray-500"
                              : ""
                          }
                        >
                          {subtask.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSubtask(task._id, index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add a subtask"
                      className="flex-grow"
                    />
                    <Button onClick={() => handleAddSubtask(task._id)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Subtask
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
