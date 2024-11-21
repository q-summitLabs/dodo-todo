import React, { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Todo, SubTask } from '../types/todo'
import { motion, AnimatePresence } from 'framer-motion'

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubTask: (todoId: string, subTaskText: string) => void;
  onToggleSubTask: (todoId: string, subTaskId: string) => void;
  onDeleteSubTask: (todoId: string, subTaskId: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onToggle, 
  onDelete, 
  onAddSubTask, 
  onToggleSubTask, 
  onDeleteSubTask 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubTask, setNewSubTask] = useState('');

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubTask.trim()) {
      onAddSubTask(todo.id, newSubTask.trim());
      setNewSubTask('');
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="bg-gray-800 rounded-lg p-4 mb-3 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl"
    >
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
        <Checkbox 
          id={`todo-${todo.id}`} 
          checked={todo.completed} 
          onCheckedChange={() => onToggle(todo.id)}
          className="border-gray-500"
        />
        <label 
          htmlFor={`todo-${todo.id}`} 
          className={`flex-grow text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}
        >
          {todo.text}
        </label>
        <Button variant="ghost" size="icon" onClick={() => onDelete(todo.id)} className="text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-10 mt-3 space-y-2"
          >
            {todo.subTasks.map((subTask) => (
              <motion.div 
                key={subTask.id} 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-2"
              >
                <Checkbox 
                  id={`subtask-${subTask.id}`} 
                  checked={subTask.completed} 
                  onCheckedChange={() => onToggleSubTask(todo.id, subTask.id)}
                  className="border-gray-600"
                />
                <label 
                  htmlFor={`subtask-${subTask.id}`} 
                  className={`flex-grow ${subTask.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}
                >
                  {subTask.text}
                </label>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDeleteSubTask(todo.id, subTask.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
            <form onSubmit={handleAddSubTask} className="flex items-center mt-2">
              <Input
                type="text"
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                placeholder="Add a sub-task..."
                className="flex-grow mr-2 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
              />
              <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

