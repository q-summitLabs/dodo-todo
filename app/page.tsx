"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Header } from "@/components/main/Header";
import { ListManagement } from "@/components/main/ListManagement";
import { TaskManagement } from "@/components/main/TaskManagement";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

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

interface List {
  _id: string;
  name: string;
}

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const addList = async (name: string) => {
    const tempId = uuidv4();
    const newList = { _id: tempId, name };

    setLists((prevLists) => [...prevLists, newList]);
    setSelectedList(tempId);
    setTasks([]);

    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Failed to add list");
      }
      const addedList = await response.json();
      setLists((prevLists) =>
        prevLists.map((list) => (list._id === tempId ? addedList : list))
      );
      setSelectedList(addedList._id);
    } catch (err) {
      setError("An error occurred while adding the list");
      console.error(err);
      setLists((prevLists) => prevLists.filter((list) => list._id !== tempId));
      if (lists.length > 0) {
        setSelectedList(lists[0]._id);
        fetchTasks(lists[0]._id);
      } else {
        setSelectedList(null);
      }
    }
  };

  const deleteList = async (id: string) => {
    const previousLists = [...lists];
    const previousSelectedList = selectedList;
    const previousTasks = [...tasks];

    setLists((prevLists) => prevLists.filter((list) => list._id !== id));
    if (selectedList === id) {
      const remainingLists = lists.filter((list) => list._id !== id);
      if (remainingLists.length > 0) {
        setSelectedList(remainingLists[0]._id);
        fetchTasks(remainingLists[0]._id);
      } else {
        setSelectedList(null);
        setTasks([]);
      }
    }

    try {
      const response = await fetch(`/api/lists?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete list");
      }
    } catch (err) {
      setError("An error occurred while deleting the list");
      console.error(err);
      setLists(previousLists);
      setSelectedList(previousSelectedList);
      setTasks(previousTasks);
    }
  };

  const selectList = (id: string) => {
    setSelectedList(id);
    setIsLoading(true);
    fetchTasks(id);
  };

  const addTask = async (
    title: string,
    dueDate?: Date,
    subtasks: Subtask[] = []
  ) => {
    if (!selectedList) return;

    const tempId = uuidv4();
    const tempTask = {
      _id: tempId,
      title,
      completed: false,
      dueDate,
      subtasks,
      listId: selectedList,
    };

    setTasks((prevTasks) => [tempTask, ...prevTasks]);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          listId: selectedList,
          dueDate,
          subtasks,
        }),
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

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === id ? { ...task, ...updates } : task
      )
    );

    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      setError("An error occurred while updating the task");
      console.error(err);
      await fetchTasks(selectedList!);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
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
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`fixed md:static z-30 w-64 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Todo Lists</h1>
          <ListManagement
            lists={lists}
            selectedList={selectedList}
            onAddList={addList}
            onSelectList={selectList}
            onDeleteList={deleteList}
            onCloseSidebar={closeSidebar}
          />
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <Header>
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </Header>
        <main className="flex-1 overflow-y-auto p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <TaskManagement
            tasks={tasks}
            isLoading={isLoading}
            selectedList={selectedList}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
          />
        </main>
      </div>
    </div>
  );
}
