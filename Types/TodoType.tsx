export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  note?: string;
}

export interface TodoOwner {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
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
  owner?: TodoOwner;
  userId?: string;
}

export interface TodoListData {
  todos: TodoItem[];
  lastUpdated: string;
}

