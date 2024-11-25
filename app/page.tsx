"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  listId: string;
}

interface List {
  _id: string;
  name: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newList, setNewList] = useState("");
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchLists();
    }
  }, [status, router]);

  const fetchLists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/lists");
      if (!response.ok) {
        throw new Error("Failed to fetch lists");
      }
      const data = await response.json();
      setLists(data);
      if (data.length > 0) {
        setSelectedList(data[0]._id);
        fetchTasks(data[0]._id);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred while fetching lists");
      console.error(err);
      setIsLoading(false);
    }
  };

  const fetchTasks = async (listId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks?listId=${listId}`);
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

  const addList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newList.trim()) return;

    const tempId = uuidv4();
    const tempList = { _id: tempId, name: newList };

    setLists((prevLists) => [...prevLists, tempList]);
    setNewList("");

    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newList }),
      });
      if (!response.ok) {
        throw new Error("Failed to add list");
      }
      const addedList = await response.json();
      setLists((prevLists) =>
        prevLists.map((list) => (list._id === tempId ? addedList : list))
      );
      setSelectedList(addedList._id);
      fetchTasks(addedList._id);
    } catch (err) {
      setError("An error occurred while adding the list");
      console.error(err);
      setLists((prevLists) => prevLists.filter((list) => list._id !== tempId));
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !selectedList) return;

    const tempId = uuidv4();
    const tempTask = {
      _id: tempId,
      title: newTask,
      completed: false,
      listId: selectedList,
    };

    setTasks((prevTasks) => [tempTask, ...prevTasks]);
    setNewTask("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask, listId: selectedList }),
      });
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
      const addedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === tempId ? addedTask : task))
      );
    } catch (err) {
      setError("An error occurred while adding the task");
      console.error(err);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== tempId));
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === id ? { ...task, completed: !completed } : task
      )
    );

    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed }),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      setError("An error occurred while updating the task");
      console.error(err);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === id ? { ...task, completed: completed } : task
        )
      );
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));

    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
    } catch (err) {
      setError("An error occurred while deleting the task");
      console.error(err);
      await fetchTasks(selectedList!);
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
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">TODO Lists</h1>
        {session?.user?.image && (
          <Image
            src={session.user.image}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Your Lists</h2>
          <form onSubmit={addList} className="mb-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newList}
                onChange={(e) => setNewList(e.target.value)}
                placeholder="New list name"
                className="flex-grow"
              />
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" /> Add List
              </Button>
            </div>
          </form>
          <Select
            value={selectedList || ""}
            onValueChange={(value) => {
              setSelectedList(value);
              fetchTasks(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a list" />
            </SelectTrigger>
            <SelectContent>
              {lists.map((list) => (
                <SelectItem key={list._id} value={list._id}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={addTask} className="mb-4">
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
                    onCheckedChange={() => toggleTask(task._id, task.completed)}
                  />
                  <span
                    className={
                      task.completed ? "line-through text-gray-500" : ""
                    }
                  >
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    onClick={() => deleteTask(task._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
