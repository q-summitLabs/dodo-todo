'use client'

import React, { useState } from 'react'
import { TodoList } from './components/TodoList'
import { TodoForm } from './components/TodoForm'
import { TaskLists } from './components/TaskLists'
import { TaskList, Todo, SubTask } from './types/todo'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [taskLists, setTaskLists] = useState<TaskList[]>([
    { id: '1', name: 'Default List', todos: [] }
  ]);
  const [currentListId, setCurrentListId] = useState('1');
  const [completedTodos, setCompletedTodos] = useState<Todo[]>([]);

  const getCurrentList = () => taskLists.find(list => list.id === currentListId) || taskLists[0];

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      subTasks: []
    };
    setTaskLists(prevLists => 
      prevLists.map(list => 
        list.id === currentListId 
          ? { ...list, todos: [...list.todos, newTodo] }
          : list
      )
    );
  };

  const toggleTodo = (id: string) => {
    setTaskLists(prevLists => 
      prevLists.map(list => 
        list.id === currentListId 
          ? {
              ...list,
              todos: list.todos.map(todo => 
                todo.id === id 
                  ? { ...todo, completed: !todo.completed }
                  : todo
              )
            }
          : list
      )
    );
    
    // Move completed todos to the completed list
    const completedTodo = getCurrentList().todos.find(todo => todo.id === id);
    if (completedTodo && !completedTodo.completed) {
      setCompletedTodos(prev => [...prev, { ...completedTodo, completed: true }]);
      deleteTodo(id);
    }
  };

  const deleteTodo = (id: string) => {
    setTaskLists(prevLists => 
      prevLists.map(list => 
        list.id === currentListId 
          ? { ...list, todos: list.todos.filter(todo => todo.id !== id) }
          : list
      )
    );
  };

  const addSubTask = (todoId: string, subTaskText: string) => {
    const newSubTask: SubTask = {
      id: Date.now().toString(),
      text: subTaskText,
      completed: false
    };
    setTaskLists(prevLists => 
      prevLists.map(list => 
        list.id === currentListId 
          ? {
              ...list,
              todos: list.todos.map(todo => 
                todo.id === todoId 
                  ? { ...todo, subTasks: [...todo.subTasks, newSubTask] }
                  : todo
              )
            }
          : list
      )
    );
  };

  const toggleSubTask = (todoId: string, subTaskId: string) => {
    setTaskLists(prevLists => 
      prevLists.map(list => 
        list.id === currentListId 
          ? {
              ...list,
              todos: list.todos.map(todo => 
                todo.id === todoId 
                  ? {
                      ...todo,
                      subTasks: todo.subTasks.map(subTask => 
                        subTask.id === subTaskId 
                          ? { ...subTask, completed: !subTask.completed }
                          : subTask
                      )
                    }
                  : todo
              )
            }
          : list
      )
    );
  };

  const deleteSubTask = (todoId: string, subTaskId: string) => {
    setTaskLists(prevLists => 
      prevLists.map(list => 
        list.id === currentListId 
          ? {
              ...list,
              todos: list.todos.map(todo => 
                todo.id === todoId 
                  ? { ...todo, subTasks: todo.subTasks.filter(subTask => subTask.id !== subTaskId) }
                  : todo
              )
            }
          : list
      )
    );
  };

  const addList = (name: string) => {
    const newList: TaskList = {
      id: Date.now().toString(),
      name,
      todos: []
    };
    setTaskLists(prevLists => [...prevLists, newList]);
    setCurrentListId(newList.id);
  };

  const selectList = (id: string) => {
    setCurrentListId(id);
  };

  return (
    <main className="p-6 md:p-10">
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text"
      >
        dododo
      </motion.h1>
      <TaskLists 
        taskLists={taskLists} 
        currentListId={currentListId} 
        onAddList={addList} 
        onSelectList={selectList} 
      />
      <TodoForm onAdd={addTodo} />
      <motion.div 
        layout
        className="mt-8 space-y-6"
      >
        <AnimatePresence mode="popLayout">
          {getCurrentList().todos.length > 0 && (
            <motion.div
              key="current-tasks"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-200">Current Tasks</h2>
              <TodoList 
                todos={getCurrentList().todos} 
                onToggle={toggleTodo} 
                onDelete={deleteTodo}
                onAddSubTask={addSubTask}
                onToggleSubTask={toggleSubTask}
                onDeleteSubTask={deleteSubTask}
              />
            </motion.div>
          )}
          {completedTodos.length > 0 && (
            <motion.div
              key="completed-tasks"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-300">Completed Tasks</h2>
              <TodoList 
                todos={completedTodos} 
                onToggle={() => {}} 
                onDelete={() => {}}
                onAddSubTask={() => {}}
                onToggleSubTask={() => {}}
                onDeleteSubTask={() => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}

