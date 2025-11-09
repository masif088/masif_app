import { createClient } from './client';
import { TodoItem, ChecklistItem } from '../../Types/TodoType';

// Database types (matching Supabase schema)
interface TodoDB {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  due_date?: string | null;
  priority: 'low' | 'medium' | 'high';
  tags?: string[] | null;
  parent_id?: string | null;
  order_index: number;
  color?: string | null;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
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
    owner: todo.owner,
    userId: todo.user_id,
  };
}

// Convert app format to database format
function convertTodoToDB(todo: Partial<TodoItem>, userId: string): Partial<TodoDB> {
  // Handle due_date: convert empty string to null, undefined to null
  let dueDate: string | null | undefined = todo.dueDate;
  if (dueDate === '' || dueDate === null || dueDate === undefined) {
    dueDate = null;
  }
  
  // Only include parent_id if parentId is explicitly provided (not undefined)
  // This prevents removing parent_id when updating other fields
  const result: Partial<TodoDB> = {
    user_id: userId,
    title: todo.title,
    description: todo.description !== undefined ? (todo.description || null) : undefined,
    completed: todo.completed,
    due_date: dueDate,
    priority: todo.priority,
    tags: todo.tags !== undefined ? (todo.tags || null) : undefined,
    order_index: todo.order,
    color: todo.color !== undefined ? (todo.color || null) : undefined,
  };
  
  // Only include parent_id if parentId is explicitly provided
  if (todo.parentId !== undefined) {
    result.parent_id = todo.parentId || null;
  }
  
  return result;
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
function convertChecklistToDB(item: Partial<ChecklistItem>, todoId: string, orderIndex?: number): Partial<ChecklistItemDB> {
  return {
    todo_id: todoId,
    text: item.text,
    completed: item.completed,
    note: item.note,
    order_index: orderIndex !== undefined ? orderIndex : 0,
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
      // Use provided userId or default to current user
      let userId: string;
      if (todoData.userId) {
        userId = todoData.userId;
      } else {
        userId = await this.getUserId();
      }
      console.log('todoData', todoData);
      const dbData = convertTodoToDB(todoData, userId);
      console.log('dbData', dbData);
      
      // Set defaults and clean up data
      const dataToInsert: any = {
        ...dbData,
        completed: dbData.completed ?? false,
        priority: dbData.priority ?? 'medium',
        order_index: dbData.order_index ?? 0,
      };
      
      // Remove empty strings and convert to null
      Object.keys(dataToInsert).forEach(key => {
        if (dataToInsert[key] === '' || dataToInsert[key] === undefined) {
          dataToInsert[key] = null;
        }
      });
      
      // Ensure due_date is properly formatted or null
      if (dataToInsert.due_date === '' || dataToInsert.due_date === undefined) {
        dataToInsert.due_date = null;
      }

      console.log('dataToInsert', dataToInsert);
      
      // Try using the database function if user_id is different from current user
      const currentUserId = await this.getUserId();
      if (userId !== currentUserId) {
        // Use function to bypass RLS when assigning to different user
        const { data: functionData, error: functionError } = await this.supabase.rpc('create_todo_with_user', {
          p_user_id: userId,
          p_title: dataToInsert.title,
          p_description: dataToInsert.description || null,
          p_completed: dataToInsert.completed ?? false,
          p_due_date: dataToInsert.due_date || null,
          p_priority: dataToInsert.priority ?? 'medium',
          p_tags: dataToInsert.tags || null,
          p_parent_id: dataToInsert.parent_id || null,
          p_order_index: dataToInsert.order_index ?? 0,
          p_color: dataToInsert.color || null
        });
        
        if (functionError) {
          console.error('Error using create_todo_with_user function:', functionError);
          // Fallback to regular insert
        } else if (functionData) {
          // Fetch the created todo
          const { data: createdTodo, error: fetchError } = await this.supabase
            .from(this.todosTable)
            .select('*')
            .eq('id', functionData)
            .maybeSingle();
          
          if (fetchError) throw fetchError;
          if (!createdTodo) {
            throw new Error('Failed to create todo');
          }
          
          // Get checklist items if provided
          let checklist: ChecklistItemDB[] = [];
          if (todoData.checklist && todoData.checklist.length > 0) {
            const checklistData = todoData.checklist.map((item, index) => ({
              todo_id: createdTodo.id,
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

          return convertTodoFromDB(createdTodo, checklist);
        }
      }
      
      // Regular insert for same user
      const { data, error } = await this.supabase
        .from(this.todosTable)
        .insert([dataToInsert])
        .select()
        .maybeSingle();
        console.log('data', data, error);

      if (error) throw error;
      if (!data) {
        throw new Error('Failed to create todo');
      }

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
      console.error('Error details:', {
        operation: 'createTodo',
        todoData: todoData,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  }

  // Get all todos (optionally filter by user)
  static async getTodos(includeSubtasks: boolean = false, onlyMyTodos: boolean = true): Promise<TodoItem[]> {
    try {
      const userId = await this.getUserId();
      
      // Fetch all todos (including subtasks if needed)
      let query = this.supabase
        .from(this.todosTable)
        .select('*');
      
      // Filter by user_id if onlyMyTodos is true
      if (onlyMyTodos) {
        query = query.eq('user_id', userId);
      }
      
      query = query
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      // If not including subtasks, only get root todos
      if (!includeSubtasks) {
        query = query.is('parent_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Fetch owner information for all todos
      const userIds = Array.from(new Set(data.map(t => t.user_id)));
      const { data: usersData } = await this.supabase
        .from('users')
        .select('id, email, first_name, last_name, username')
        .in('id', userIds);

      const userMap = new Map();
      usersData?.forEach(user => {
        userMap.set(user.id, user);
      });

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

      // Convert to app format with owner info
      const todos = data.map(todo => {
        const checklist = checklistMap.get(todo.id) || [];
        const owner = userMap.get(todo.user_id);
        return convertTodoFromDB({ ...todo, owner }, checklist);
      });

      // Build nested structure if includeSubtasks is true
      if (includeSubtasks) {
        return this.buildNestedStructure(todos);
      }

      return todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      console.error('Error details:', {
        operation: 'getTodos',
        includeSubtasks: includeSubtasks,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
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
          .maybeSingle();

        if (todoError && todoError.code !== 'PGRST116') throw todoError;
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
      console.error('Error details:', {
        operation: 'getTodoById',
        todoId: todoId,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  }

  // Update todo
  static async updateTodo(todoId: string, updateData: Partial<TodoItem>): Promise<TodoItem | null> {
    try {
      const currentUserId = await this.getUserId();
      
      // Get current todo to check ownership and get current user_id
      let currentTodo: TodoItem | null = null;
      try {
        currentTodo = await this.getTodoById(todoId);
      } catch (error) {
        console.warn('Could not fetch current todo:', error);
      }

      // Use provided userId or preserve existing user_id
      let userId: string;
      if (updateData.userId) {
        userId = updateData.userId;
      } else {
        userId = currentTodo?.userId || currentUserId;
      }

      // Check if user has permission (must own the todo or be admin)
      if (currentTodo && currentTodo.userId !== currentUserId) {
        throw new Error('You do not have permission to update this todo');
      }

      const dbData = convertTodoToDB(updateData, userId);

      // Remove undefined values and convert empty strings to null
      Object.keys(dbData).forEach(key => {
        const value = dbData[key as keyof typeof dbData];
        if (value === undefined) {
          delete dbData[key as keyof typeof dbData];
        } else if (value === '') {
          // Convert empty string to null for all fields
          (dbData as any)[key] = null;
        }
      });
      
      // Ensure due_date is null if empty string
      if ((dbData as any).due_date === '' || (dbData as any).due_date === undefined) {
        (dbData as any).due_date = null;
      }

      // If changing user_id, use database function to bypass RLS
      if (updateData.userId && updateData.userId !== currentTodo?.userId) {
        try {
          // Prepare due_date - convert empty string to null
          let dueDateValue: string | null | undefined = updateData.dueDate;
          if (dueDateValue === '' || dueDateValue === undefined) {
            dueDateValue = null;
          }
          
          // Build RPC parameters - only include fields that are explicitly provided
          const rpcParams: any = {
            p_todo_id: todoId,
            p_user_id: updateData.userId,
          };
          
          if (updateData.title !== undefined) rpcParams.p_title = updateData.title;
          if (updateData.description !== undefined) rpcParams.p_description = updateData.description || null;
          if (updateData.completed !== undefined) rpcParams.p_completed = updateData.completed;
          if (updateData.dueDate !== undefined) rpcParams.p_due_date = dueDateValue || null;
          if (updateData.priority !== undefined) rpcParams.p_priority = updateData.priority;
          if (updateData.tags !== undefined) rpcParams.p_tags = updateData.tags || null;
          if (updateData.parentId !== undefined) rpcParams.p_parent_id = updateData.parentId || null;
          if (updateData.order !== undefined) rpcParams.p_order_index = updateData.order;
          if (updateData.color !== undefined) rpcParams.p_color = updateData.color || null;
          
          const { data: functionData, error: functionError } = await this.supabase.rpc('update_todo_with_user', rpcParams);
          
          if (functionError) {
            console.error('Error using update_todo_with_user function:', functionError);
            throw functionError;
          }
          
          // Fetch the updated todo
          const { data: updatedTodo, error: fetchError } = await this.supabase
            .from(this.todosTable)
            .select('*')
            .eq('id', todoId)
            .maybeSingle();
          
          if (fetchError) throw fetchError;
          if (!updatedTodo) {
            throw new Error('Todo not found after update');
          }
          
          // Get checklist items
          const { data: checklistData } = await this.supabase
            .from(this.checklistTable)
            .select('*')
            .eq('todo_id', todoId)
            .order('order_index', { ascending: true });

          return convertTodoFromDB(updatedTodo, checklistData || []);
        } catch (error) {
          console.error('Error updating todo with user change:', error);
          throw error;
        }
      }
      
      // Regular update for same user
      let query = this.supabase
        .from(this.todosTable)
        .update(dbData)
        .eq('id', todoId);

      // Only filter by user_id if we're not changing it
      if (!updateData.userId && currentTodo) {
        query = query.eq('user_id', currentTodo.userId);
      } else if (!updateData.userId) {
        query = query.eq('user_id', currentUserId);
      }

      const { data, error } = await query
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error('Todo not found or you do not have permission to update it');
      }

      // Get checklist items
      const { data: checklistData } = await this.supabase
        .from(this.checklistTable)
        .select('*')
        .eq('todo_id', todoId)
        .order('order_index', { ascending: true });

      return convertTodoFromDB(data, checklistData || []);
    } catch (error) {
      console.error('Error updating todo:', error);
      console.error('Error details:', {
        operation: 'updateTodo',
        todoId: todoId,
        updateData: updateData,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
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
      console.error('Error details:', {
        operation: 'deleteTodo',
        todoId: todoId,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  }

  // Create checklist item
  static async createChecklistItem(todoId: string, item: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    try {
      const userId = await this.getUserId();

      // Verify todo belongs to user
      const { data: todo, error: todoError } = await this.supabase
        .from(this.todosTable)
        .select('id')
        .eq('id', todoId)
        .eq('user_id', userId)
        .maybeSingle();

      if (todoError && todoError.code !== 'PGRST116') throw todoError;
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
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error('Failed to create checklist item');
      }
      return convertChecklistFromDB(data);
    } catch (error) {
      console.error('Error creating checklist item:', error);
      console.error('Error details:', {
        operation: 'createChecklistItem',
        todoId: todoId,
        item: item,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  }

  // Update checklist item
  static async updateChecklistItem(itemId: string, updateData: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    try {
      const userId = await this.getUserId();

      // Verify checklist item belongs to user's todo
      const { data: checklistItem, error: checklistError } = await this.supabase
        .from(this.checklistTable)
        .select('todo_id, todos!inner(user_id)')
        .eq('id', itemId)
        .maybeSingle();

      if (checklistError && checklistError.code !== 'PGRST116') throw checklistError;
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
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error('Checklist item not found or update failed');
      }
      return convertChecklistFromDB(data);
    } catch (error) {
      console.error('Error updating checklist item:', error);
      console.error('Error details:', {
        operation: 'updateChecklistItem',
        itemId: itemId,
        updateData: updateData,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  }

  // Delete checklist item
  static async deleteChecklistItem(itemId: string): Promise<void> {
    try {
      const userId = await this.getUserId();

      // Verify checklist item belongs to user's todo
      const { data: checklistItem, error: checklistError } = await this.supabase
        .from(this.checklistTable)
        .select('todo_id, todos!inner(user_id)')
        .eq('id', itemId)
        .maybeSingle();

      if (checklistError && checklistError.code !== 'PGRST116') throw checklistError;
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
      console.error('Error details:', {
        operation: 'deleteChecklistItem',
        itemId: itemId,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
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
      console.error('Error details:', {
        operation: 'updateTodoOrder',
        todoId: todoId,
        newOrder: newOrder,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  }

  // Update checklist item order
  static async updateChecklistItemOrder(itemId: string, newOrder: number): Promise<void> {
    try {
      const userId = await this.getUserId();

      // Verify checklist item belongs to user's todo
      const { data: checklistItem, error: checklistError } = await this.supabase
        .from(this.checklistTable)
        .select('todo_id, todos!inner(user_id)')
        .eq('id', itemId)
        .maybeSingle();

      if (checklistError && checklistError.code !== 'PGRST116') throw checklistError;
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
      console.error('Error details:', {
        operation: 'updateChecklistItemOrder',
        itemId: itemId,
        newOrder: newOrder,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
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
      console.error('Error details:', {
        operation: 'bulkUpdateTodoOrders',
        updates: updates,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  }
}

