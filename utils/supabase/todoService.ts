import { createClient } from './client';
import { TodoItem, ChecklistItem } from '../../Types/TodoType';

// Database types (matching Supabase schema)
interface TodoDB {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  parent_id?: string;
  order_index: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

interface ChecklistItemDB {
  id: string;
  todo_id: string;
  text: string;
  completed: boolean;
  note?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Convert database format to app format
function convertTodoFromDB(todo: TodoDB, checklist?: ChecklistItemDB[], subtasks?: TodoDB[]): TodoItem {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description || undefined,
    completed: todo.completed,
    dueDate: todo.due_date || undefined,
    priority: todo.priority,
    tags: todo.tags || [],
    checklist: checklist?.map(convertChecklistFromDB) || [],
    subtasks: subtasks?.map(t => convertTodoFromDB(t)) || [],
    parentId: todo.parent_id || undefined,
    order: todo.order_index,
    createdAt: todo.created_at,
    updatedAt: todo.updated_at,
    color: todo.color || undefined,
  };
}

// Convert app format to database format
function convertTodoToDB(todo: Partial<TodoItem>, userId: string): Partial<TodoDB> {
  return {
    user_id: userId,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    due_date: todo.dueDate,
    priority: todo.priority,
    tags: todo.tags,
    parent_id: todo.parentId,
    order_index: todo.order,
    color: todo.color,
  };
}

// Convert checklist from database format to app format
function convertChecklistFromDB(item: ChecklistItemDB): ChecklistItem {
  return {
    id: item.id,
    text: item.text,
    completed: item.completed,
    note: item.note || undefined,
  };
}

// Convert checklist from app format to database format
function convertChecklistToDB(item: Partial<ChecklistItem>, todoId: string): Partial<ChecklistItemDB> {
  return {
    todo_id: todoId,
    text: item.text,
    completed: item.completed,
    note: item.note,
    order_index: item.order_index || 0,
  };
}

export class TodoService {
  private static supabase = createClient();
  private static todosTable = 'todos';
  private static checklistTable = 'checklist_items';

  // Get current user ID
  private static async getUserId(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  // Create a new todo
  static async createTodo(todoData: Partial<TodoItem>): Promise<TodoItem | null> {
    try {
      const userId = await this.getUserId();
      const dbData = convertTodoToDB(todoData, userId);
      
      // Set defaults
      const dataToInsert = {
        ...dbData,
        completed: dbData.completed ?? false,
        priority: dbData.priority ?? 'medium',
        order_index: dbData.order_index ?? 0,
      };

      const { data, error } = await this.supabase
        .from(this.todosTable)
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;

      // Get checklist items if provided
      let checklist: ChecklistItemDB[] = [];
      if (todoData.checklist && todoData.checklist.length > 0) {
        const checklistData = todoData.checklist.map((item, index) => ({
          todo_id: data.id,
          text: item.text,
          completed: item.completed ?? false,
          note: item.note,
          order_index: index,
        }));

        const { data: checklistDataResult, error: checklistError } = await this.supabase
          .from(this.checklistTable)
          .insert(checklistData)
          .select();

        if (!checklistError) {
          checklist = checklistDataResult || [];
        }
      }

      return convertTodoFromDB(data, checklist);
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  // Get all todos for current user
  static async getTodos(includeSubtasks: boolean = false): Promise<TodoItem[]> {
    try {
      const userId = await this.getUserId();
      
      let query = this.supabase
        .from(this.todosTable)
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (!includeSubtasks) {
        query = query.is('parent_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data) return [];

      // Get all checklist items for these todos
      const todoIds = data.map(t => t.id);
      const { data: checklistData } = await this.supabase
        .from(this.checklistTable)
        .select('*')
        .in('todo_id', todoIds)
        .order('order_index', { ascending: true });

      // Group checklist items by todo_id
      const checklistMap = new Map<string, ChecklistItemDB[]>();
      checklistData?.forEach(item => {
        if (!checklistMap.has(item.todo_id)) {
          checklistMap.set(item.todo_id, []);
        }
        checklistMap.get(item.todo_id)!.push(item);
      });

      // Convert to app format
      const todos = data.map(todo => {
        const checklist = checklistMap.get(todo.id) || [];
        return convertTodoFromDB(todo, checklist);
      });

      // Build nested structure if includeSubtasks is true
      if (includeSubtasks) {
        return this.buildNestedStructure(todos);
      }

      return todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  // Build nested structure for todos
  private static buildNestedStructure(todos: TodoItem[]): TodoItem[] {
    const todoMap = new Map<string, TodoItem>();
    const rootTodos: TodoItem[] = [];

    // First pass: create map of all todos
    todos.forEach(todo => {
      todoMap.set(todo.id, { ...todo, subtasks: [] });
    });

    // Second pass: build tree structure
    todos.forEach(todo => {
      const todoWithSubtasks = todoMap.get(todo.id)!;
      if (todo.parentId) {
        const parent = todoMap.get(todo.parentId);
        if (parent) {
          if (!parent.subtasks) parent.subtasks = [];
          parent.subtasks.push(todoWithSubtasks);
        }
      } else {
        rootTodos.push(todoWithSubtasks);
      }
    });

    return rootTodos;
  }

  // Get todo by ID with all nested subtasks
  static async getTodoById(todoId: string): Promise<TodoItem | null> {
    try {
      const userId = await this.getUserId();

      // Get todo using recursive function
      const { data, error } = await this.supabase.rpc('get_todo_with_subtasks', {
        todo_uuid: todoId
      });

      if (error) {
        // Fallback to regular query if function doesn't exist
        const { data: todoData, error: todoError } = await this.supabase
          .from(this.todosTable)
          .select('*')
          .eq('id', todoId)
          .eq('user_id', userId)
          .single();

        if (todoError) throw todoError;
        if (!todoData) return null;

        // Get checklist items
        const { data: checklistData } = await this.supabase
          .from(this.checklistTable)
          .select('*')
          .eq('todo_id', todoId)
          .order('order_index', { ascending: true });

        return convertTodoFromDB(todoData, checklistData || []);
      }

      if (!data || data.length === 0) return null;

      // Get root todo
      const rootTodo = data.find((t: TodoDB) => t.id === todoId);
      if (!rootTodo) return null;

      // Get all checklist items for all todos
      const todoIds = data.map((t: TodoDB) => t.id);
      const { data: checklistData } = await this.supabase
        .from(this.checklistTable)
        .select('*')
        .in('todo_id', todoIds)
        .order('order_index', { ascending: true });

      // Group checklist items by todo_id
      const checklistMap = new Map<string, ChecklistItemDB[]>();
      checklistData?.forEach(item => {
        if (!checklistMap.has(item.todo_id)) {
          checklistMap.set(item.todo_id, []);
        }
        checklistMap.get(item.todo_id)!.push(item);
      });

      // Build nested structure
      const todos = data.map((t: TodoDB) => {
        const checklist = checklistMap.get(t.id) || [];
        return convertTodoFromDB(t, checklist);
      });

      return this.buildNestedStructure(todos).find(t => t.id === todoId) || null;
    } catch (error) {
      console.error('Error fetching todo:', error);
      throw error;
    }
  }

  // Update todo
  static async updateTodo(todoId: string, updateData: Partial<TodoItem>): Promise<TodoItem | null> {
    try {
      const userId = await this.getUserId();
      const dbData = convertTodoToDB(updateData, userId);

      // Remove undefined values
      Object.keys(dbData).forEach(key => {
        if (dbData[key as keyof typeof dbData] === undefined) {
          delete dbData[key as keyof typeof dbData];
        }
      });

      const { data, error } = await this.supabase
        .from(this.todosTable)
        .update(dbData)
        .eq('id', todoId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Get checklist items
      const { data: checklistData } = await this.supabase
        .from(this.checklistTable)
        .select('*')
        .eq('todo_id', todoId)
        .order('order_index', { ascending: true });

      return convertTodoFromDB(data, checklistData || []);
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  // Delete todo and all nested subtasks
  static async deleteTodo(todoId: string): Promise<void> {
    try {
      const userId = await this.getUserId();

      // Try to use cascade delete function
      const { error: functionError } = await this.supabase.rpc('delete_todo_cascade', {
        todo_uuid: todoId
      });

      if (functionError) {
        // Fallback to manual cascade delete
        // First delete all checklist items
        await this.supabase
          .from(this.checklistTable)
          .delete()
          .in('todo_id', [todoId]); // This will need to be expanded for nested todos

        // Then delete all nested subtasks recursively
        const deleteSubtasks = async (parentId: string) => {
          const { data: subtasks } = await this.supabase
            .from(this.todosTable)
            .select('id')
            .eq('parent_id', parentId)
            .eq('user_id', userId);

          if (subtasks) {
            for (const subtask of subtasks) {
              await deleteSubtasks(subtask.id);
              await this.supabase
                .from(this.todosTable)
                .delete()
                .eq('id', subtask.id)
                .eq('user_id', userId);
            }
          }
        };

        await deleteSubtasks(todoId);

        // Finally delete the todo itself
        const { error } = await this.supabase
          .from(this.todosTable)
          .delete()
          .eq('id', todoId)
          .eq('user_id', userId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  // Create checklist item
  static async createChecklistItem(todoId: string, item: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    try {
      const userId = await this.getUserId();

      // Verify todo belongs to user
      const { data: todo } = await this.supabase
        .from(this.todosTable)
        .select('id')
        .eq('id', todoId)
        .eq('user_id', userId)
        .single();

      if (!todo) throw new Error('Todo not found');

      // Get current max order_index
      const { data: existingItems } = await this.supabase
        .from(this.checklistTable)
        .select('order_index')
        .eq('todo_id', todoId)
        .order('order_index', { ascending: false })
        .limit(1);

      const maxOrder = existingItems && existingItems.length > 0 
        ? existingItems[0].order_index + 1 
        : 0;

      const dbData = convertChecklistToDB(item, todoId);
      const dataToInsert = {
        ...dbData,
        completed: dbData.completed ?? false,
        order_index: maxOrder,
      };

      const { data, error } = await this.supabase
        .from(this.checklistTable)
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;
      return convertChecklistFromDB(data);
    } catch (error) {
      console.error('Error creating checklist item:', error);
      throw error;
    }
  }

  // Update checklist item
  static async updateChecklistItem(itemId: string, updateData: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    try {
      const userId = await this.getUserId();

      // Verify checklist item belongs to user's todo
      const { data: checklistItem } = await this.supabase
        .from(this.checklistTable)
        .select('todo_id, todos!inner(user_id)')
        .eq('id', itemId)
        .single();

      if (!checklistItem || (checklistItem.todos as any).user_id !== userId) {
        throw new Error('Checklist item not found');
      }

      const dbData: Partial<ChecklistItemDB> = {};
      if (updateData.text !== undefined) dbData.text = updateData.text;
      if (updateData.completed !== undefined) dbData.completed = updateData.completed;
      if (updateData.note !== undefined) dbData.note = updateData.note;

      const { data, error } = await this.supabase
        .from(this.checklistTable)
        .update(dbData)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return convertChecklistFromDB(data);
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  }

  // Delete checklist item
  static async deleteChecklistItem(itemId: string): Promise<void> {
    try {
      const userId = await this.getUserId();

      // Verify checklist item belongs to user's todo
      const { data: checklistItem } = await this.supabase
        .from(this.checklistTable)
        .select('todo_id, todos!inner(user_id)')
        .eq('id', itemId)
        .single();

      if (!checklistItem || (checklistItem.todos as any).user_id !== userId) {
        throw new Error('Checklist item not found');
      }

      const { error } = await this.supabase
        .from(this.checklistTable)
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      throw error;
    }
  }

  // Update todo order (for drag and drop)
  static async updateTodoOrder(todoId: string, newOrder: number): Promise<void> {
    try {
      const userId = await this.getUserId();

      const { error } = await this.supabase
        .from(this.todosTable)
        .update({ order_index: newOrder })
        .eq('id', todoId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating todo order:', error);
      throw error;
    }
  }

  // Update checklist item order
  static async updateChecklistItemOrder(itemId: string, newOrder: number): Promise<void> {
    try {
      const userId = await this.getUserId();

      // Verify checklist item belongs to user's todo
      const { data: checklistItem } = await this.supabase
        .from(this.checklistTable)
        .select('todo_id, todos!inner(user_id)')
        .eq('id', itemId)
        .single();

      if (!checklistItem || (checklistItem.todos as any).user_id !== userId) {
        throw new Error('Checklist item not found');
      }

      const { error } = await this.supabase
        .from(this.checklistTable)
        .update({ order_index: newOrder })
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating checklist item order:', error);
      throw error;
    }
  }

  // Bulk update todo orders (for drag and drop)
  static async bulkUpdateTodoOrders(updates: { id: string; order: number }[]): Promise<void> {
    try {
      const userId = await this.getUserId();

      // Update each todo individually (Supabase doesn't support bulk updates easily)
      for (const update of updates) {
        await this.updateTodoOrder(update.id, update.order);
      }
    } catch (error) {
      console.error('Error bulk updating todo orders:', error);
      throw error;
    }
  }
}

