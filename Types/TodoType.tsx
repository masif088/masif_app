export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  note?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  checklist?: ChecklistItem[];
  subtasks?: TodoItem[];
  parentId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  color?: string;
}

export interface TodoListData {
  todos: TodoItem[];
  lastUpdated: string;
}

