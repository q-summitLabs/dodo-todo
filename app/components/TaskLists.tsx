import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskList } from '../types/todo'

interface TaskListsProps {
  taskLists: TaskList[];
  currentListId: string;
  onAddList: (name: string) => void;
  onSelectList: (id: string) => void;
}

export const TaskLists: React.FC<TaskListsProps> = ({ 
  taskLists, 
  currentListId, 
  onAddList, 
  onSelectList 
}) => {
  const [newListName, setNewListName] = useState('');

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onAddList(newListName.trim());
      setNewListName('');
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <Select value={currentListId} onValueChange={onSelectList}>
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-gray-100">
          <SelectValue placeholder="Select a list" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {taskLists.map((list) => (
            <SelectItem key={list.id} value={list.id} className="text-gray-100 focus:bg-gray-700">
              {list.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <form onSubmit={handleAddList} className="flex items-center space-x-2">
        <Input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name..."
          className="flex-grow bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Add List</Button>
      </form>
    </div>
  )
}

