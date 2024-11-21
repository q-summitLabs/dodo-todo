import React from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'

interface TodoItemProps {
  id: string
  text: string
  completed: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export const TodoItem: React.FC<TodoItemProps> = ({ id, text, completed, onToggle, onDelete }) => {
  return (
    <div className="flex items-center space-x-2 p-2">
      <Checkbox 
        id={`todo-${id}`} 
        checked={completed} 
        onCheckedChange={() => onToggle(id)}
      />
      <label 
        htmlFor={`todo-${id}`} 
        className={`flex-grow ${completed ? 'line-through text-gray-500' : ''}`}
      >
        {text}
      </label>
      <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

