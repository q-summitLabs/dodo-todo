export interface SubTask {
    id: string;
    text: string;
    completed: boolean;
  }
  
  export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    subTasks: SubTask[];
  }
  
  export interface TaskList {
    id: string;
    name: string;
    todos: Todo[];
  }

