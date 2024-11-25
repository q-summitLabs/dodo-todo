"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchTasks();
    } else if (status === "loading") {
      setIsLoading(true);
    }
  }, [status, router]);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError("An error occurred while fetching tasks");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask }),
      });
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
      const task = await response.json();
      setTasks((prevTasks) => [task, ...prevTasks]);
      setNewTask("");
    } catch (err) {
      setError("An error occurred while adding the task");
      console.error(err);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed }),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === id ? updatedTask : task))
      );
    } catch (err) {
      setError("An error occurred while updating the task");
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
    } catch (err) {
      setError("An error occurred while deleting the task");
      console.error(err);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        Authenticating...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">
        TODO List for {session?.user?.name}
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={addTask} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Add
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
                onCheckedChange={() => toggleTask(task._id, task.completed)}
                disabled={isLoading}
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
                onClick={() => deleteTask(task._id)}
                disabled={isLoading}
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
