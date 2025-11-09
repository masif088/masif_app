import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Card, CardBody, CardHeader, Input, FormGroup, Label, Badge } from 'reactstrap';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { TodoItem, ChecklistItem } from 'Types/TodoType';
import { X, Plus, Edit2, Trash2, Calendar, List, CheckSquare, ChevronDown, ChevronRight, Move } from 'react-feather';

// Storage key for JSON persistence
const STORAGE_KEY = 'todo_list_data';

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Load todos from localStorage
const loadTodos = (): TodoItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.todos || [];
    }
  } catch (error) {
    console.error('Error loading todos:', error);
  }
  return [];
};

// Save todos to localStorage
const saveTodos = (todos: TodoItem[]) => {
  try {
    const data = {
      todos,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving todos:', error);
  }
};

// Sortable Todo Item Component
interface SortableTodoItemProps {
  todo: TodoItem;
  onEdit: (todo: TodoItem) => void;
  onUpdateTodo: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddSubtask: (parentId: string) => void;
  onEditChecklistItem?: (todo: TodoItem, checklistItem: ChecklistItem) => void;
  expandedIds: Set<string>;
  level?: number;
}

const SortableTodoItem: React.FC<SortableTodoItemProps> = ({
  todo,
  onEdit,
  onUpdateTodo,
  onDelete,
  onToggleComplete,
  onToggleExpand,
  onAddSubtask,
  onEditChecklistItem,
  expandedIds,
  level = 0
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isExpanded = expandedIds.has(todo.id);
  const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
  const completedSubtasks = todo.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;
  const completedChecklist = todo.checklist?.filter(item => item.completed).length || 0;
  const totalChecklist = todo.checklist?.length || 0;

  const priorityColors = {
    low: 'secondary',
    medium: 'warning',
    high: 'danger'
  };

  const combinedStyle = {
    ...style,
    marginLeft: `${level * 20}px`,
    marginBottom: '10px'
  };

  return (
    <div ref={setNodeRef} style={combinedStyle} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <Card className="mb-2" style={{ borderLeft: `4px solid var(--bs-${priorityColors[todo.priority]})` }}>
        <CardBody className="p-3">
          <div className="d-flex align-items-start">
            <div {...attributes} {...listeners} className="drag-handle me-2" style={{ cursor: 'grab' }}>
              <Move size={18} />
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex align-items-center mb-2">
                {hasSubtasks && (
                  <div
                    className="me-2"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand(todo.id);
                    }}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                )}
                
                <Input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => onToggleComplete(todo.id)}
                  className="me-2"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <div
                  className="flex-grow-1"
                  style={{ 
                    cursor: hasSubtasks ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  onClick={(e) => {
                    if (hasSubtasks) {
                      e.stopPropagation();
                      onToggleExpand(todo.id);
                    }
                  }}
                >
                  <h6 className="mb-0" style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                    {todo.title}
                  </h6>
                </div>
                
                <Badge color={priorityColors[todo.priority]} className="me-2">
                  {todo.priority}
                </Badge>
                
                {todo.dueDate && (
                  <Badge color="info" className="me-2">
                    <Calendar size={12} className="me-1" style={{ width: '12px', height: '12px',paddingTop:0 }}  />
                    {new Date(todo.dueDate).toLocaleDateString()}
                  </Badge>
                )}
                
                {totalChecklist > 0 && (
                  <Badge color="primary" className="me-2">
                    <CheckSquare size={12} className="me-1" style={{ width: '12px', height: '12px',paddingTop:0 }} />
                    {completedChecklist}/{totalChecklist}
                  </Badge>
                )}
                
                {hasSubtasks && (
                  <Badge color="secondary" className="me-2">
                    {completedSubtasks}/{totalSubtasks} subtasks
                  </Badge>
                )}
                
                <Button
                  color="link"
                  size="sm"
                  className="me-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSubtask(todo.id);
                  }}
                  title="Add Subtask"
                >
                  <Plus size={16} />
                </Button>
                
                <Button
                  color="link"
                  size="sm"
                  className="me-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(todo);
                  }}
                  title="Edit"
                >
                  <Edit2 size={16} />
                </Button>
                
                <Button
                  color="link"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(todo.id);
                  }}
                  title="Delete"
                >
                  <Trash2 size={16} color="red" />
                </Button>
              </div>
              
              {todo.description && (
                <p className="text-muted small mb-2">{todo.description}</p>
              )}
              
              {todo.tags && todo.tags.length > 0 && (
                <div className="mb-2">
                  {todo.tags.map((tag, idx) => (
                    <Badge key={idx} color="light" className="me-1">{tag}</Badge>
                  ))}
                </div>
              )}
              
              {todo.checklist && todo.checklist.length > 0 && (
                <div className="mb-2 mt-2">
                  <div className="small text-muted mb-1">Checklist:</div>
                  {todo.checklist.map((item) => (
                    <div 
                      key={item.id} 
                      className="d-flex align-items-center mb-1 p-2" 
                      style={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '4px', 
                        backgroundColor: item.completed ? '#f5f5f5' : '#fff'
                      }}
                    >
                      <Input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => {
                          e.stopPropagation();
                          // Toggle checklist item completion
                          const updatedChecklist = todo.checklist!.map(ci => 
                            ci.id === item.id ? { ...ci, completed: !ci.completed } : ci
                          );
                          const updatedTodo = { 
                            ...todo, 
                            checklist: updatedChecklist,
                            updatedAt: new Date().toISOString()
                          };
                          onUpdateTodo(updatedTodo);
                        }}
                        className="me-2"
                        style={{ marginTop: 0 }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-grow-1">
                        <div style={{ 
                          textDecoration: item.completed ? 'line-through' : 'none',
                          fontWeight: item.completed ? 'normal' : '500',
                          fontSize: '0.9rem',
                          lineHeight: '1.4'
                        }}>
                          {item.text}
                        </div>
                        {item.note && (
                          <div className="text-muted small mt-1" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                            {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {isExpanded && hasSubtasks && (
                <div className="mt-3" style={{ borderLeft: '2px solid #e0e0e0', paddingLeft: '15px' }}>
                  {todo.subtasks!.map((subtask) => (
                    <SortableTodoItem
                      key={subtask.id}
                      todo={subtask}
                      onEdit={onEdit}
                      onUpdateTodo={onUpdateTodo}
                      onDelete={onDelete}
                      onToggleComplete={onToggleComplete}
                      onToggleExpand={onToggleExpand}
                      onAddSubtask={onAddSubtask}
                      onEditChecklistItem={onEditChecklistItem}
                      expandedIds={expandedIds}
                      level={level + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

// Checklist Item Edit Modal Component
interface ChecklistItemModalProps {
  isOpen: boolean;
  toggle: () => void;
  item: ChecklistItem | null;
  onSave: (item: ChecklistItem) => void;
}

const ChecklistItemModal: React.FC<ChecklistItemModalProps> = ({ isOpen, toggle, item, onSave }) => {
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (item) {
      setText(item.text);
      setNote(item.note || '');
      setCompleted(item.completed);
    } else {
      setText('');
      setNote('');
      setCompleted(false);
    }
  }, [item, isOpen]);

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('Checklist item text is required');
      return;
    }

    const updatedItem: ChecklistItem = {
      id: item?.id || generateId(),
      text: text.trim(),
      note: note.trim() || undefined,
      completed: completed,
    };

    onSave(updatedItem);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit Checklist Item</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="checklistText">Item Text *</Label>
            <Input
              id="checklistText"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter checklist item text"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="checklistNote">Note</Label>
            <Input
              id="checklistNote"
              type="textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this checklist item"
            />
          </FormGroup>

          <FormGroup check>
            <Input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            <Label check>Completed</Label>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Cancel</Button>
        <Button color="primary" onClick={handleSave}>Save</Button>
      </ModalFooter>
    </Modal>
  );
};

// Todo Form Modal Component
interface TodoFormModalProps {
  isOpen: boolean;
  toggle: () => void;
  todo?: TodoItem;
  onSave: (todo: TodoItem) => void;
  parentId?: string;
}

const TodoFormModal: React.FC<TodoFormModalProps> = ({ isOpen, toggle, todo, onSave, parentId }) => {
  const [formData, setFormData] = useState<Partial<TodoItem>>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: [],
    checklist: [],
    subtasks: [],
    completed: false,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checklistInput, setChecklistInput] = useState('');
  const [error, setError] = useState('');
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<ChecklistItem | null>(null);

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority,
        dueDate: todo.dueDate || '',
        tags: todo.tags || [],
        checklist: todo.checklist || [],
        completed: todo.completed,
      });
      setChecklistItems(todo.checklist || []);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        tags: [],
        checklist: [],
        subtasks: [],
        completed: false,
      });
      setChecklistItems([]);
    }
    setTagInput('');
    setChecklistInput('');
    setError('');
  }, [todo, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddChecklistItem = () => {
    if (checklistInput.trim()) {
      const newItem: ChecklistItem = {
        id: generateId(),
        text: checklistInput.trim(),
        completed: false
      };
      setChecklistItems(prev => [...prev, newItem]);
      setChecklistInput('');
    }
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEditChecklistItem = (item: ChecklistItem) => {
    setEditingChecklistItem(item);
    setIsChecklistModalOpen(true);
  };

  const handleSaveChecklistItem = (updatedItem: ChecklistItem) => {
    setChecklistItems(prev =>
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  const handleSubmit = () => {
    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }

    const todoData: TodoItem = {
      id: todo?.id || generateId(),
      title: formData.title!,
      description: formData.description,
      priority: formData.priority as 'low' | 'medium' | 'high',
      dueDate: formData.dueDate,
      tags: formData.tags,
      checklist: checklistItems,
      subtasks: todo?.subtasks || [],
      parentId: parentId || todo?.parentId,
      order: todo?.order || Date.now(),
      completed: formData.completed || false,
      createdAt: todo?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(todoData);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {todo ? 'Edit Todo' : parentId ? 'Add Subtask' : 'Add New Todo'}
      </ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}
        
        <Form>
          <FormGroup>
            <Label for="title">Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter todo title"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              id="description"
              name="description"
              type="textarea"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description"
            />
          </FormGroup>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="priority">Priority</Label>
                <Input
                  id="priority"
                  name="priority"
                  type="select"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>Tags</Label>
            <div className="d-flex mb-2">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag and press Enter"
              />
              <Button color="primary" onClick={handleAddTag} className="ms-2">
                <Plus size={16} />
              </Button>
            </div>
            <div>
              {formData.tags?.map((tag, idx) => (
                <Badge key={idx} color="primary" className="me-1 mb-1">
                  {tag}
                  <X size={12} className="ms-1" style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(idx)} />
                </Badge>
              ))}
            </div>
          </FormGroup>

          <FormGroup>
            <Label>Checklist</Label>
            <div className="d-flex mb-2">
              <Input
                type="text"
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                placeholder="Add checklist item and press Enter"
              />
              <Button color="primary" onClick={handleAddChecklistItem} className="ms-2">
                <Plus size={16} />
              </Button>
            </div>
            <div>
              {checklistItems.map((item) => (
                <div key={item.id} className="d-flex align-items-center mb-2 p-2" style={{ border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleEditChecklistItem(item)}>
                  <Input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleChecklistItem(item.id);
                    }}
                    className="me-2"
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginTop: 0 }}
                  />
                  <div className="flex-grow-1" onClick={(e) => e.stopPropagation()}>
                    <div style={{ textDecoration: item.completed ? 'line-through' : 'none', fontWeight: item.completed ? 'normal' : '500', lineHeight: '1.4' }}>
                      {item.text}
                    </div>
                    {item.note && (
                      <div className="text-muted small mt-1" style={{ fontStyle: 'italic' }}>
                        {item.note}
                      </div>
                    )}
                  </div>
                  <Button
                    color="link"
                    size="sm"
                    className="ms-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveChecklistItem(item.id);
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Cancel</Button>
        <Button color="primary" onClick={handleSubmit}>Save</Button>
      </ModalFooter>

      <ChecklistItemModal
        isOpen={isChecklistModalOpen}
        toggle={() => {
          setIsChecklistModalOpen(false);
          setEditingChecklistItem(null);
        }}
        item={editingChecklistItem}
        onSave={handleSaveChecklistItem}
      />
    </Modal>
  );
};

// Main Todo List Component
const MyCalendar: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | undefined>();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<ChecklistItem | null>(null);
  const [editingChecklistTodo, setEditingChecklistTodo] = useState<TodoItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadedTodos = loadTodos();
    setTodos(loadedTodos);
  }, []);

  const saveTodosToStorage = useCallback((updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  }, []);

  const handleAddTodo = () => {
    setEditingTodo(undefined);
    setSelectedDate(null);
    setAddingSubtaskFor(null);
    setIsModalOpen(true);
  };

  const handleAddSubtask = (parentId: string) => {
    setEditingTodo(undefined);
    setSelectedDate(null);
    setAddingSubtaskFor(parentId);
    setIsModalOpen(true);
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleUpdateTodo = (updatedTodo: TodoItem) => {
    // Update todo without opening modal
    const updateTodoInTree = (items: TodoItem[]): TodoItem[] => {
      return items.map(item => {
        if (item.id === updatedTodo.id) {
          return updatedTodo;
        }
        if (item.subtasks) {
          return { ...item, subtasks: updateTodoInTree(item.subtasks) };
        }
        return item;
      });
    };
    const updatedTodos = updateTodoInTree(todos);
    saveTodosToStorage(updatedTodos);
  };

  const handleEditChecklistItem = (todo: TodoItem, checklistItem: ChecklistItem) => {
    setEditingChecklistTodo(todo);
    setEditingChecklistItem(checklistItem);
    setIsChecklistModalOpen(true);
  };

  const handleSaveChecklistItem = (updatedItem: ChecklistItem) => {
    if (!editingChecklistTodo) return;

    const updatedChecklist = editingChecklistTodo.checklist!.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    const updatedTodo = { ...editingChecklistTodo, checklist: updatedChecklist };
    
    // Update todo in tree
    const updateTodoInTree = (items: TodoItem[]): TodoItem[] => {
      return items.map(item => {
        if (item.id === updatedTodo.id) {
          return updatedTodo;
        }
        if (item.subtasks) {
          return { ...item, subtasks: updateTodoInTree(item.subtasks) };
        }
        return item;
      });
    };
    
    const updatedTodos = updateTodoInTree(todos);
    saveTodosToStorage(updatedTodos);
    toast.success('Checklist item updated successfully');
    setIsChecklistModalOpen(false);
    setEditingChecklistItem(null);
    setEditingChecklistTodo(null);
  };

  const handleSaveTodo = (todoData: TodoItem) => {
    if (editingTodo && editingTodo.id && editingTodo.id === todoData.id) {
      // Update existing todo
      const updateTodoInTree = (items: TodoItem[]): TodoItem[] => {
        return items.map(item => {
          if (item.id === todoData.id) {
            return { ...todoData, subtasks: item.subtasks || [] };
          }
          if (item.subtasks) {
            return { ...item, subtasks: updateTodoInTree(item.subtasks) };
          }
          return item;
        });
      };
      const updatedTodos = updateTodoInTree(todos);
      saveTodosToStorage(updatedTodos);
      toast.success('Todo updated successfully');
    } else {
      // Add new todo or subtask
      const parentId = addingSubtaskFor || todoData.parentId;
      
      const newTodo: TodoItem = {
        ...todoData,
        id: todoData.id || generateId(),
        parentId: parentId,
        order: parentId ? 0 : (todos.length > 0 ? Math.max(...todos.map(t => t.order)) + 1 : 0),
      };

      if (parentId) {
        // Add as subtask
        const addSubtaskToTree = (items: TodoItem[]): TodoItem[] => {
          return items.map(item => {
            if (item.id === parentId) {
              const existingSubtasks = item.subtasks || [];
              return {
                ...item,
                subtasks: [...existingSubtasks, { ...newTodo, order: existingSubtasks.length }]
              };
            }
            if (item.subtasks) {
              return { ...item, subtasks: addSubtaskToTree(item.subtasks) };
            }
            return item;
          });
        };
        const updatedTodos = addSubtaskToTree(todos);
        saveTodosToStorage(updatedTodos);
        toast.success('Subtask added successfully');
        setAddingSubtaskFor(null);
      } else {
        // Add as root todo
        saveTodosToStorage([...todos, newTodo]);
        toast.success('Todo added successfully');
      }
    }
  };

  const handleDeleteTodo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      const deleteTodoFromTree = (items: TodoItem[]): TodoItem[] => {
        return items
          .filter(item => item.id !== id)
          .map(item => ({
            ...item,
            subtasks: item.subtasks ? deleteTodoFromTree(item.subtasks) : []
          }));
      };
      const updatedTodos = deleteTodoFromTree(todos);
      saveTodosToStorage(updatedTodos);
      toast.success('Todo deleted successfully');
    }
  };

  const handleToggleComplete = (id: string) => {
    const toggleCompleteInTree = (items: TodoItem[]): TodoItem[] => {
      return items.map(item => {
        if (item.id === id) {
          const newCompleted = !item.completed;
          // If completing, also complete all subtasks
          const updatedSubtasks = item.subtasks?.map(st => ({ ...st, completed: newCompleted })) || [];
          return {
            ...item,
            completed: newCompleted,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString()
          };
        }
        if (item.subtasks) {
          return { ...item, subtasks: toggleCompleteInTree(item.subtasks) };
        }
        return item;
      });
    };
    const updatedTodos = toggleCompleteInTree(todos);
    saveTodosToStorage(updatedTodos);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const findTodoAndParent = (items: TodoItem[], id: string): { todo: TodoItem | null, parent: TodoItem[] } | null => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          return { todo: items[i], parent: items };
        }
        if (items[i].subtasks) {
          const found = findTodoAndParent(items[i].subtasks!, id);
          if (found) return found;
        }
      }
      return null;
    };

    const activeFound = findTodoAndParent(todos, active.id as string);
    const overFound = findTodoAndParent(todos, over.id as string);

    if (!activeFound || !overFound) return;

    const activeTodo = activeFound.todo!;
    const activeParent = activeFound.parent;
    const overParent = overFound.parent;

    // Create a deep copy to avoid mutating state directly
    const deepCopy = (items: TodoItem[]): TodoItem[] => {
      return items.map(item => ({
        ...item,
        subtasks: item.subtasks ? deepCopy(item.subtasks) : []
      }));
    };

    const updatedTodos = deepCopy(todos);

    // Find and remove active todo from its current position
    const removeFromTree = (items: TodoItem[], id: string): TodoItem[] => {
      return items.filter(item => {
        if (item.id === id) return false;
        if (item.subtasks) {
          item.subtasks = removeFromTree(item.subtasks, id);
        }
        return true;
      });
    };

    // Find and insert active todo at new position
    const insertAtPosition = (items: TodoItem[], targetId: string, todoToInsert: TodoItem): TodoItem[] => {
      return items.map(item => {
        if (item.id === targetId) {
          // Insert after the target
          const index = items.findIndex(t => t.id === targetId);
          const newItems = [...items];
          newItems.splice(index + 1, 0, todoToInsert);
          return item;
        }
        if (item.subtasks) {
          return {
            ...item,
            subtasks: insertAtPosition(item.subtasks, targetId, todoToInsert)
          };
        }
        return item;
      });
    };

    // Remove active todo
    let result = removeFromTree(updatedTodos, active.id as string);
    
    // Insert at new position
    result = insertAtPosition(result, over.id as string, activeTodo);

    // Update orders
    const updateOrders = (items: TodoItem[], startOrder: number = 0): TodoItem[] => {
      return items.map((item, index) => ({
        ...item,
        order: startOrder + index,
        updatedAt: new Date().toISOString(),
        subtasks: item.subtasks ? updateOrders(item.subtasks, 0) : []
      }));
    };

    const finalTodos = updateOrders(result);
    saveTodosToStorage(finalTodos);
  };

  // Flatten todos for calendar view
  const flattenTodos = (items: TodoItem[]): TodoItem[] => {
    const result: TodoItem[] = [];
    items.forEach(item => {
      result.push(item);
      if (item.subtasks) {
        result.push(...flattenTodos(item.subtasks));
      }
    });
    return result;
  };

  const calendarEvents = flattenTodos(todos)
    .filter(todo => todo.dueDate)
    .map(todo => ({
      id: todo.id,
      title: todo.title,
      start: todo.dueDate!,
      allDay: true,
      color: todo.priority === 'high' ? '#dc3545' : todo.priority === 'medium' ? '#ffc107' : '#6c757d',
    }));

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.date);
    setEditingTodo(undefined);
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    const todo = flattenTodos(todos).find(t => t.id === arg.event.id);
    if (todo) {
      handleEditTodo(todo);
    }
  };

  // Get root todos (no parent)
  const rootTodos = todos.filter(t => !t.parentId).sort((a, b) => a.order - b.order);

  return (
    <div className="page-body">
      <Breadcrumbs
        title="My Calendar"
        mainTitle="Todo List & Calendar"
        parent="Calendar"
      />
      <Container fluid={true}>
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5>Todo List & Calendar</h5>
                <div>
                  <Button
                    color={view === 'list' ? 'primary' : 'secondary'}
                    className="me-2"
                    onClick={() => setView('list')}
                  >
                    <List size={16} className="me-1" />
                    List View
                  </Button>
                  <Button
                    color={view === 'calendar' ? 'primary' : 'secondary'}
                    className="me-2"
                    onClick={() => setView('calendar')}
                  >
                    <Calendar size={16} className="me-1" />
                    Calendar View
                  </Button>
                  <Button color="primary" onClick={handleAddTodo}>
                    <Plus size={16} className="me-1" />
                    Add Todo
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {view === 'list' ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={rootTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      {rootTodos.map((todo) => (
                        <SortableTodoItem
                          key={todo.id}
                          todo={todo}
                          onEdit={handleEditTodo}
                          onUpdateTodo={handleUpdateTodo}
                          onDelete={handleDeleteTodo}
                          onToggleComplete={handleToggleComplete}
                          onToggleExpand={handleToggleExpand}
                          onAddSubtask={handleAddSubtask}
                          onEditChecklistItem={handleEditChecklistItem}
                          expandedIds={expandedIds}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={calendarEvents}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <TodoFormModal
        isOpen={isModalOpen}
        toggle={() => {
          setIsModalOpen(false);
          setEditingTodo(undefined);
          setSelectedDate(null);
          setAddingSubtaskFor(null);
        }}
        todo={editingTodo && editingTodo.id ? editingTodo : undefined}
        onSave={handleSaveTodo}
        parentId={addingSubtaskFor || undefined}
      />

      <ChecklistItemModal
        isOpen={isChecklistModalOpen}
        toggle={() => {
          setIsChecklistModalOpen(false);
          setEditingChecklistItem(null);
          setEditingChecklistTodo(null);
        }}
        item={editingChecklistItem}
        onSave={handleSaveChecklistItem}
      />
    </div>
  );
};

export default MyCalendar;

