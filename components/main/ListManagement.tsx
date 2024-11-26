import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
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
}

export function ListManagement({
  lists,
  selectedList,
  onAddList,
  onSelectList,
  onDeleteList,
}: ListManagementProps) {
  const [newList, setNewList] = useState("");

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newList.trim()) {
      onAddList(newList);
      setNewList("");
    }
  };

  return (
    <div className="md:col-span-1">
      <h2 className="text-xl font-semibold mb-4">Your Lists</h2>
      <form onSubmit={handleAddList} className="mb-4">
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
      <div className="space-y-2">
        <Select
          value={selectedList || ""}
          onValueChange={onSelectList}
          disabled={lists.length === 0}
        >
          <SelectTrigger
            className={
              lists.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }
          >
            <SelectValue
              placeholder={
                lists.length === 0 ? "No lists available" : "Select a list"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {lists.map((list) => (
              <SelectItem key={list._id} value={list._id}>
                {list.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedList && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <div className="flex items-center justify-center w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete List
                </div>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  list and all tasks associated with it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteList(selectedList)}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
