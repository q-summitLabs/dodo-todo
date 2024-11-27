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
import { Card, CardContent } from "@/components/ui/card";

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
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const savedListId = localStorage.getItem("selectedListId");
      fetchLists().then((fetchedLists) => {
        if (
          savedListId &&
          fetchedLists.some((list: List) => list._id === savedListId)
        ) {
          setSelectedList(savedListId);
        } else if (fetchedLists.length > 0) {
          setSelectedList(fetchedLists[0]._id);
        }
      });
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedList) {
      fetchTasks(selectedList);
    }
  }, [selectedList]);

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
      setIsLoading(false);
      return data;
    } catch (err) {
      setError("An error occurred while fetching lists");
      console.error(err);
      setIsLoading(false);
      return [];
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
    localStorage.setItem("selectedListId", id);
  };

  const addTask = async (
    title: string,
    description: string,
    dueDate?: Date,
    subtasks: Subtask[] = []
  ) => {
    if (!selectedList) return;

    const tempId = uuidv4();
    const tempTask = {
      _id: tempId,
      title,
      description,
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

  const toggleSidebar = () => {
    setIsAnimating(true);
    setIsSidebarOpen(!isSidebarOpen);
    setTimeout(() => setIsAnimating(false), 300); // Match this with your transition duration
  };

  const getSelectedListName = () => {
    return (
      lists.find((list) => list._id === selectedList)?.name || "None selected"
    );
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
        className={`fixed md:relative z-30 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-80" : "w-0"
        }`}
      >
        <div
          className={`p-4 ${isSidebarOpen && !isAnimating ? "" : "invisible"}`}
        >
          <h1 className="text-2xl font-bold mb-4">Todo Lists</h1>
          <ListManagement
            lists={lists}
            selectedList={selectedList}
            onAddList={addList}
            onSelectList={selectList}
            onDeleteList={deleteList}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
      </aside>
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        <Header>
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </Header>
        <main className="flex-1 overflow-y-auto p-6">
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {getSelectedListName()}
              </h2>
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
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
