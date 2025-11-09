import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, CardBody, CardHeader, Button } from 'reactstrap';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import { SyncfusionCalendar } from 'src/components/calendar/syncfusion';
import { TodoItem, ChecklistItem } from 'Types/TodoType';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, Alert, FormGroup, Label, Input, Badge } from 'reactstrap';
import { toast } from 'react-toastify';
import { X, Plus, Edit2, Trash2, Calendar, CheckSquare, ChevronDown, ChevronRight, Eye } from 'react-feather';

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

// Todo Form Modal Component (simplified version from main calendar)
interface TodoFormModalProps {
  isOpen: boolean;
  toggle: () => void;
  todo?: TodoItem;
  onSave: (todo: TodoItem) => void;
  selectedDate?: Date | null;
}

const TodoFormModal: React.FC<TodoFormModalProps> = ({ isOpen, toggle, todo, onSave, selectedDate }) => {
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

  React.useEffect(() => {
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
      const defaultDate = selectedDate 
        ? new Date(selectedDate).toISOString().slice(0, 16)
        : '';
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: defaultDate,
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
  }, [todo, isOpen, selectedDate]);

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
      parentId: todo?.parentId,
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
        {todo ? 'Edit Todo' : 'Add New Todo'}
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
                <div key={item.id} className="d-flex align-items-center mb-2 p-2" style={{ border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }}>
                  <Input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklistItem(item.id)}
                    className="me-2"
                    style={{ marginTop: 0 }}
                  />
                  <div className="flex-grow-1">
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
                    onClick={() => handleRemoveChecklistItem(item.id)}
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
    </Modal>
  );
};

// Subtask Item Component (Recursive)
interface SubtaskItemProps {
  subtask: TodoItem;
  onUpdate: (updatedSubtask: TodoItem) => void;
  level?: number;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({ subtask, onUpdate, level = 0 }) => {
  const [checklistInput, setChecklistInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [expanded, setExpanded] = useState(false);

  const completedChecklist = subtask.checklist?.filter(item => item.completed).length || 0;
  const totalChecklist = subtask.checklist?.length || 0;
  const completedSubtasks = subtask.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = subtask.subtasks?.length || 0;
  const hasNested = (subtask.checklist && subtask.checklist.length > 0) || (subtask.subtasks && subtask.subtasks.length > 0);

  const handleAddChecklist = () => {
    if (checklistInput.trim()) {
      const newItem: ChecklistItem = {
        id: generateId(),
        text: checklistInput.trim(),
        completed: false
      };
      const updatedChecklist = [...(subtask.checklist || []), newItem];
      const updatedSubtask = {
        ...subtask,
        checklist: updatedChecklist,
        updatedAt: new Date().toISOString()
      };
      onUpdate(updatedSubtask);
      setChecklistInput('');
    }
  };

  const handleToggleChecklist = (itemId: string) => {
    const updatedChecklist = subtask.checklist!.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updatedSubtask = {
      ...subtask,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedSubtask);
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      const newSubtask: TodoItem = {
        id: generateId(),
        title: subtaskInput.trim(),
        description: '',
        priority: 'medium',
        completed: false,
        parentId: subtask.id,
        order: (subtask.subtasks?.length || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checklist: [],
        subtasks: []
      };
      const updatedSubtasks = [...(subtask.subtasks || []), newSubtask];
      const updatedSubtask = {
        ...subtask,
        subtasks: updatedSubtasks,
        updatedAt: new Date().toISOString()
      };
      onUpdate(updatedSubtask);
      setSubtaskInput('');
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtask.subtasks!.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed, updatedAt: new Date().toISOString() } : st
    );
    const updatedSubtask = {
      ...subtask,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedSubtask);
  };

  const handleUpdateNestedSubtask = (updatedNestedSubtask: TodoItem) => {
    const updatedSubtasks = subtask.subtasks!.map(st =>
      st.id === updatedNestedSubtask.id ? updatedNestedSubtask : st
    );
    const updatedSubtask = {
      ...subtask,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedSubtask);
  };

  return (
    <div className="mb-3 p-3" style={{ border: '1px solid #e0e0e0', borderRadius: '4px', marginLeft: `${level * 20}px`, backgroundColor: '#f9f9f9' }}>
      <div className="d-flex align-items-center mb-2">
        {hasNested && (
          <Button
            color="link"
            className="p-0 me-2"
            onClick={() => setExpanded(!expanded)}
            style={{ padding: 0, minWidth: 'auto' }}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
        )}
        <Input
          type="checkbox"
          checked={subtask.completed}
          onChange={() => {
            const updatedSubtask = {
              ...subtask,
              completed: !subtask.completed,
              updatedAt: new Date().toISOString()
            };
            onUpdate(updatedSubtask);
          }}
          className="me-2"
        />
        <span className="fw-bold" style={{ textDecoration: subtask.completed ? 'line-through' : 'none' }}>
          {subtask.title}
        </span>
        {totalChecklist > 0 && (
          <Badge color="primary" className="ms-2">
            <CheckSquare size={12} className="me-1" />
            {completedChecklist}/{totalChecklist}
          </Badge>
        )}
        {totalSubtasks > 0 && (
          <Badge color="secondary" className="ms-2">
            {completedSubtasks}/{totalSubtasks} subtasks
          </Badge>
        )}
      </div>

      {expanded && (
        <div className="mt-3">
          {/* Checklist Section */}
          <div className="mb-3">
            <Label className="fw-bold small">
              <CheckSquare size={14} className="me-1" />
              Checklist ({completedChecklist}/{totalChecklist || 0}):
            </Label>
            <div className="d-flex mb-2 mt-2">
              <Input
                type="text"
                size="sm"
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklist())}
                placeholder="Add checklist item"
                style={{ fontSize: '0.875rem' }}
              />
              <Button color="primary" size="sm" onClick={handleAddChecklist} className="ms-2">
                <Plus size={14} />
              </Button>
            </div>
            {subtask.checklist && subtask.checklist.length > 0 && (
              <div className="mt-2">
                {subtask.checklist.map((item) => (
                  <div key={item.id} className="d-flex align-items-center mb-1 p-2" style={{ border: '1px solid #e0e0e0', borderRadius: '4px', backgroundColor: item.completed ? '#f5f5f5' : '#fff' }}>
                    <Input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="me-2"
                      style={{ marginTop: 0 }}
                    />
                    <div className="flex-grow-1">
                      <div style={{ textDecoration: item.completed ? 'line-through' : 'none', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {item.text}
                      </div>
                      {item.note && (
                        <div className="text-muted small mt-1" style={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
                          {item.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="mb-3">
            <Label className="fw-bold small">Subtasks ({completedSubtasks}/{totalSubtasks || 0}):</Label>
            <div className="d-flex mb-2 mt-2">
              <Input
                type="text"
                size="sm"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                placeholder="Add subtask"
                style={{ fontSize: '0.875rem' }}
              />
              <Button color="primary" size="sm" onClick={handleAddSubtask} className="ms-2">
                <Plus size={14} />
              </Button>
            </div>
            {subtask.subtasks && subtask.subtasks.length > 0 && (
              <div className="mt-2">
                {subtask.subtasks.map((nestedSubtask) => (
                  <SubtaskItem
                    key={nestedSubtask.id}
                    subtask={nestedSubtask}
                    onUpdate={handleUpdateNestedSubtask}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Todo Detail Modal Component
interface TodoDetailModalProps {
  isOpen: boolean;
  toggle: () => void;
  todo: TodoItem | null;
  onEdit: () => void;
  onDelete: (todoId: string) => void;
  onUpdate: (todo: TodoItem) => void;
  onViewFullDetails: () => void;
}

const TodoDetailModal: React.FC<TodoDetailModalProps> = ({ isOpen, toggle, todo, onEdit, onDelete, onUpdate, onViewFullDetails }) => {
  const [checklistInput, setChecklistInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');

  React.useEffect(() => {
    setChecklistInput('');
    setSubtaskInput('');
  }, [todo, isOpen]);

  if (!todo) return null;

  const priorityColors = {
    low: 'secondary',
    medium: 'warning',
    high: 'danger'
  };

  const completedChecklist = todo.checklist?.filter(item => item.completed).length || 0;
  const totalChecklist = todo.checklist?.length || 0;
  const completedSubtasks = todo.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      onDelete(todo.id);
      toggle();
    }
  };

  const handleAddChecklist = () => {
    if (checklistInput.trim()) {
      const newItem: ChecklistItem = {
        id: generateId(),
        text: checklistInput.trim(),
        completed: false
      };
      const updatedChecklist = [...(todo.checklist || []), newItem];
      const updatedTodo = {
        ...todo,
        checklist: updatedChecklist,
        updatedAt: new Date().toISOString()
      };
      onUpdate(updatedTodo);
      setChecklistInput('');
    }
  };

  const handleToggleChecklist = (itemId: string) => {
    const updatedChecklist = todo.checklist!.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updatedTodo = {
      ...todo,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedTodo);
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      const newSubtask: TodoItem = {
        id: generateId(),
        title: subtaskInput.trim(),
        description: '',
        priority: 'medium',
        completed: false,
        parentId: todo.id,
        order: (todo.subtasks?.length || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checklist: [],
        subtasks: []
      };
      const updatedSubtasks = [...(todo.subtasks || []), newSubtask];
      const updatedTodo = {
        ...todo,
        subtasks: updatedSubtasks,
        updatedAt: new Date().toISOString()
      };
      onUpdate(updatedTodo);
      setSubtaskInput('');
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = todo.subtasks!.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed, updatedAt: new Date().toISOString() } : st
    );
    const updatedTodo = {
      ...todo,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedTodo);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        <div className="d-flex align-items-center">
          <h5 className="mb-0 me-2">{todo.title}</h5>
          <Badge color={priorityColors[todo.priority]} className="me-2">
            {todo.priority}
          </Badge>
          {todo.completed && (
            <Badge color="success">Completed</Badge>
          )}
        </div>
      </ModalHeader>
      <ModalBody>
        {todo.description && (
          <div className="mb-3">
            <Label className="fw-bold">Description:</Label>
            <p className="mb-0">{todo.description}</p>
          </div>
        )}

        {todo.dueDate && (
          <div className="mb-3">
            <Label className="fw-bold">Due Date:</Label>
            <p className="mb-0">
              <Calendar size={16} className="me-1" />
              {new Date(todo.dueDate).toLocaleString()}
            </p>
          </div>
        )}

        {todo.tags && todo.tags.length > 0 && (
          <div className="mb-3">
            <Label className="fw-bold">Tags:</Label>
            <div className="mt-1">
              {todo.tags.map((tag, idx) => (
                <Badge key={idx} color="primary" className="me-1 mb-1">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <Label className="fw-bold">
            <CheckSquare size={16} className="me-1" />
            Checklist ({completedChecklist}/{totalChecklist || 0}):
          </Label>
          <div className="d-flex mb-2 mt-2">
            <Input
              type="text"
              value={checklistInput}
              onChange={(e) => setChecklistInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklist())}
              placeholder="Add checklist item and press Enter"
            />
            <Button color="primary" onClick={handleAddChecklist} className="ms-2">
              <Plus size={16} />
            </Button>
          </div>
          {todo.checklist && todo.checklist.length > 0 && (
            <div className="mt-2">
              {todo.checklist.map((item) => (
                <div key={item.id} className="d-flex align-items-center mb-2 p-2" style={{ border: '1px solid #e0e0e0', borderRadius: '4px', backgroundColor: item.completed ? '#f5f5f5' : '#fff' }}>
                  <Input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklist(item.id)}
                    className="me-2"
                    style={{ marginTop: 0 }}
                  />
                  <div className="flex-grow-1">
                    <div style={{ textDecoration: item.completed ? 'line-through' : 'none', fontWeight: item.completed ? 'normal' : '500', lineHeight: '1.4' }}>
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
        </div>

        <div className="mb-3">
          <Label className="fw-bold">Subtasks ({completedSubtasks}/{totalSubtasks || 0}):</Label>
          <div className="d-flex mb-2 mt-2">
            <Input
              type="text"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
              placeholder="Add subtask and press Enter"
            />
            <Button color="primary" onClick={handleAddSubtask} className="ms-2">
              <Plus size={16} />
            </Button>
          </div>
          {todo.subtasks && todo.subtasks.length > 0 && (
            <div className="mt-2">
              {todo.subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  onUpdate={(updatedSubtask) => {
                    const updatedSubtasks = todo.subtasks!.map(st =>
                      st.id === updatedSubtask.id ? updatedSubtask : st
                    );
                    const updatedTodo = {
                      ...todo,
                      subtasks: updatedSubtasks,
                      updatedAt: new Date().toISOString()
                    };
                    onUpdate(updatedTodo);
                  }}
                  level={0}
                />
              ))}
            </div>
          )}
        </div>

        {todo.createdAt && (
          <div className="mb-3">
            <Label className="fw-bold">Created:</Label>
            <p className="mb-0 text-muted small">{new Date(todo.createdAt).toLocaleString()}</p>
          </div>
        )}

        {todo.updatedAt && (
          <div className="mb-3">
            <Label className="fw-bold">Last Updated:</Label>
            <p className="mb-0 text-muted small">{new Date(todo.updatedAt).toLocaleString()}</p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="info" onClick={onViewFullDetails}>
          <Eye size={16} className="me-1" />
          View Full Details
        </Button>
        <Button color="danger" onClick={handleDelete}>
          <Trash2 size={16} className="me-1" />
          Delete
        </Button>
        <Button color="primary" onClick={onEdit}>
          <Edit2 size={16} className="me-1" />
          Edit
        </Button>
        <Button color="secondary" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

const SyncfusionCalendarTest: React.FC = () => {
  const router = useRouter();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | undefined>();
  const [viewingTodo, setViewingTodo] = useState<TodoItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadedTodos = loadTodos();
    setTodos(loadedTodos);
  }, []);

  const saveTodosToStorage = useCallback((updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  }, []);

  const handleEventClick = (todo: TodoItem) => {
    setViewingTodo(todo);
    setSelectedDate(null);
    setIsDetailModalOpen(true);
  };

  const handleEditFromDetail = () => {
    if (viewingTodo) {
      setEditingTodo(viewingTodo);
      setIsDetailModalOpen(false);
      setIsModalOpen(true);
    }
  };

  const handleViewFullDetails = () => {
    if (viewingTodo) {
      router.push(`/admin/my-calendar/detail/${viewingTodo.id}`);
    }
  };

  const handleDateClick = (date: Date) => {
    setEditingTodo(undefined);
    setSelectedDate(date);
    setIsModalOpen(true);
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
      // Add new todo
      const newTodo: TodoItem = {
        ...todoData,
        order: todos.length > 0 ? Math.max(...todos.map(t => t.order)) + 1 : 0,
      };
      saveTodosToStorage([...todos, newTodo]);
      toast.success('Todo added successfully');
    }
  };

  const handleEventDelete = (todoId: string) => {
    const deleteTodoFromTree = (items: TodoItem[]): TodoItem[] => {
      return items
        .filter(item => item.id !== todoId)
        .map(item => ({
          ...item,
          subtasks: item.subtasks ? deleteTodoFromTree(item.subtasks) : []
        }));
    };
    const updatedTodos = deleteTodoFromTree(todos);
    saveTodosToStorage(updatedTodos);
    toast.success('Todo deleted successfully');
  };

  return (
    <div className="page-body">
      <Breadcrumbs
        title="Syncfusion Calendar Test"
        mainTitle="Syncfusion Calendar"
        parent="Calendar"
      />
      <Container fluid={true}>
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h5>Syncfusion Calendar - Test Page</h5>
              </CardHeader>
              <CardBody>
                <SyncfusionCalendar
                  todos={todos}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
                  onEventDelete={handleEventDelete}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <TodoDetailModal
        isOpen={isDetailModalOpen}
        toggle={() => {
          setIsDetailModalOpen(false);
          setViewingTodo(null);
        }}
        todo={viewingTodo}
        onEdit={handleEditFromDetail}
        onDelete={handleEventDelete}
        onViewFullDetails={handleViewFullDetails}
        onUpdate={(updatedTodo) => {
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
          setViewingTodo(updatedTodo);
          toast.success('Todo updated successfully');
        }}
      />

      <TodoFormModal
        isOpen={isModalOpen}
        toggle={() => {
          setIsModalOpen(false);
          setEditingTodo(undefined);
          setSelectedDate(null);
        }}
        todo={editingTodo}
        onSave={handleSaveTodo}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default SyncfusionCalendarTest;

