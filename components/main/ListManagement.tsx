import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [listToDelete, setListToDelete] = useState<string | null>(null);

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

  const handleDeleteList = () => {
    if (listToDelete) {
      onDeleteList(listToDelete);
      setListToDelete(null);
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setListToDelete(list._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the list &quot;{list.name}&quot; and all its associated
                    tasks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setListToDelete(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteList}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </li>
        ))}
      </ul>
    </div>
  );
}
