import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trash2,
  Plus,
  Calendar,
  Edit2,
  ChevronDown,
  ChevronUp,
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
  description?: string;
  completed: boolean;
  dueDate?: Date;
  subtasks: Subtask[];
  listId: string;
}

interface TaskManagementProps {
  tasks: Task[];
  isLoading: boolean;
  selectedList: string | null;
  onAddTask: (
    title: string,
    description: string,
    dueDate?: Date,
    subtasks?: Subtask[]
  ) => void;
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
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(
    undefined
  );
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [collapsedTasks, setCollapsedTasks] = useState(new Set<string>());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtask, setEditingSubtask] = useState<{
    taskId: string;
    subtaskIndex: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    // Only reset collapsed tasks for new tasks
    const newTaskIds = tasks
      .filter((task) => !collapsedTasks.has(task._id))
      .map((task) => task._id);
    setCollapsedTasks((prev) => {
      const newSet = new Set(prev);
      newTaskIds.forEach((id) => newSet.delete(id));
      return newSet;
    });
  }, [tasks]);

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
      onAddTask(newTaskTitle, newTaskDescription, newTaskDueDate);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate(undefined);
      setIsAddTaskDialogOpen(false);
    }
  };

  const handleAddSubtask = (taskId: string) => {
    if (newSubtaskTitle.trim()) {
      const task = tasks.find((t) => t._id === taskId);
      if (task) {
        const updatedSubtasks = [
          ...task.subtasks,
          { title: newSubtaskTitle, completed: false },
        ];
        onUpdateTask(taskId, { subtasks: updatedSubtasks });
        setNewSubtaskTitle("");
      }
    }
  };

  const handleEditTask = () => {
    if (editingTask && editingTask.title.trim()) {
      onUpdateTask(editingTask._id, {
        title: editingTask.title,
        description: editingTask.description,
        dueDate: editingTask.dueDate,
      });
      setEditingTask(null);
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

  const handleEditSubtask = () => {
    if (editingSubtask && editingSubtask.title.trim()) {
      const task = tasks.find((t) => t._id === editingSubtask.taskId);
      if (task) {
        const updatedSubtasks = task.subtasks.map((subtask, index) =>
          index === editingSubtask.subtaskIndex
            ? { ...subtask, title: editingSubtask.title }
            : subtask
        );
        onUpdateTask(editingSubtask.taskId, { subtasks: updatedSubtasks });
        setEditingSubtask(null);
      }
    }
  };

  const toggleTaskCollapse = (taskId: string) => {
    setCollapsedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
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
                id={`task-${task._id}`}
              />
              <label
                htmlFor={`task-${task._id}`}
                className={`flex-grow ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleTaskCollapse(task._id)}
              >
                {collapsedTasks.has(task._id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {collapsedTasks.has(task._id)
                    ? "Expand subtasks"
                    : "Collapse subtasks"}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingTask(task)}
              >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Edit task</span>
              </Button>
              {task.dueDate && (
                <span className="text-sm text-gray-500">
                  Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteTask(task._id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete task</span>
              </Button>
            </div>
            {!collapsedTasks.has(task._id) && (
              <div className="mt-2 pl-6 space-y-2">
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                <ul className="space-y-1">
                  {task.subtasks.map((subtask, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() =>
                          handleToggleSubtask(task._id, index)
                        }
                        id={`subtask-${task._id}-${index}`}
                      />
                      <label
                        htmlFor={`subtask-${task._id}-${index}`}
                        className={`flex-grow ${
                          subtask.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {subtask.title}
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setEditingSubtask({
                            taskId: task._id,
                            subtaskIndex: index,
                            title: subtask.title,
                          })
                        }
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit subtask</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubtask(task._id, index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete subtask</span>
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2">
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="New subtask"
                    className="flex-grow"
                  />
                  <Button
                    onClick={() => handleAddSubtask(task._id)}
                    disabled={!newSubtaskTitle.trim()}
                  >
                    Add Subtask
                  </Button>
                </div>
              </div>
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
              <Label htmlFor="task-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="task-description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
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
                <Label htmlFor="edit-task-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-task-description"
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
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
      <Dialog
        open={!!editingSubtask}
        onOpenChange={() => setEditingSubtask(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subtask</DialogTitle>
          </DialogHeader>
          {editingSubtask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-subtask-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-subtask-title"
                  value={editingSubtask.title}
                  onChange={(e) =>
                    setEditingSubtask({
                      ...editingSubtask,
                      title: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <Button
            onClick={handleEditSubtask}
            disabled={!editingSubtask?.title.trim()}
          >
            Update Subtask
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
