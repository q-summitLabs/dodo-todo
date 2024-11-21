import React from 'react'
import { TodoItem } from './TodoItem'
import { Todo } from '../types/todo'

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubTask: (todoId: string, subTaskText: string) => void;
  onToggleSubTask: (todoId: string, subTaskId: string) => void;
  onDeleteSubTask: (todoId: string, subTaskId: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  onToggle, 
  onDelete, 
  onAddSubTask, 
  onToggleSubTask, 
  onDeleteSubTask 
}) => {
  return (
    <div>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onAddSubTask={onAddSubTask}
          onToggleSubTask={onToggleSubTask}
          onDeleteSubTask={onDeleteSubTask}
        />
      ))}
    </div>
  )
}

