import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface List {
  _id: string;
  name: string;
}

interface ListManagementProps {
  lists: List[];
  selectedList: string | null;
  onAddList: (name: string) => void;
  onSelectList: (id: string) => void;
  onDeleteList: (id: string) => void;
  onCloseSidebar?: () => void;
  isSidebarOpen: boolean;
}

export function ListManagement({
  lists,
  selectedList,
  onAddList,
  onSelectList,
  onDeleteList,
  onCloseSidebar,
  isSidebarOpen,
}: ListManagementProps) {
  const [newListName, setNewListName] = useState("");

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onAddList(newListName);
      setNewListName("");
    }
  };

  const handleSelectList = (id: string) => {
    onSelectList(id);
    if (window.innerWidth < 768) {
      onCloseSidebar?.();
    }
  };

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddList} className="space-y-2">
        <Input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
        />
        <Button type="submit" className="w-full">
          Add List
        </Button>
      </form>
      <ul className="space-y-1">
        {lists.map((list) => (
          <li key={list._id} className="flex items-center">
            <Button
              variant={selectedList === list._id ? "secondary" : "ghost"}
              className="flex-grow justify-start"
              onClick={() => handleSelectList(list._id)}
            >
              {list.name}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteList(list._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
