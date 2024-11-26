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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedList} size="sm">
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
      </div>
      {isLoading ? (
        <div className="text-center">Loading tasks...</div>
      ) : (
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
                  className={`flex-grow text-sm ${
                    task.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-gray-500">
                    {format(new Date(task.dueDate), "MMM d")}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTask(task._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    setExpandedTask(expandedTask === task._id ? null : task._id)
                  }
                >
                  {expandedTask === task._id ? "Hide" : "Show"}
                </Button>
              </div>
              {expandedTask === task._id && (
                <div className="mt-2 pl-6 space-y-2">
                  <ul
                    className="space-y-
1"
                  >
                    {task.subtasks.map((subtask, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() =>
                            handleToggleSubtask(task._id, index)
                          }
                        />
                        <span
                          className={`text-xs ${
                            subtask.completed
                              ? "line-through text-gray-500"
                              : ""
                          }`}
                        >
                          {subtask.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteSubtask(task._id, index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add a subtask"
                      className="flex-grow text-xs h-8"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddSubtask(task._id)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add
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
