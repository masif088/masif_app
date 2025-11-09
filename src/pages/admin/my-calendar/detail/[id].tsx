import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, CardHeader, CardBody, Button, Badge, Input, Label, Spinner } from 'reactstrap';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import { TodoItem, ChecklistItem } from 'Types/TodoType';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronRight, CheckSquare, Calendar, ArrowLeft } from 'react-feather';

// Storage key for JSON persistence
const STORAGE_KEY = 'todo_list_data';

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

// Find todo by ID (recursive)
const findTodoById = (items: TodoItem[], id: string): TodoItem | null => {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.subtasks) {
      const found = findTodoById(item.subtasks, id);
      if (found) return found;
    }
  }
  return null;
};

// Full Detail View Component (Recursive)
interface FullDetailViewProps {
  todo: TodoItem;
  level?: number;
}

const FullDetailView: React.FC<FullDetailViewProps> = ({ todo, level = 0 }) => {
  const [expanded, setExpanded] = useState(level === 0); // Auto-expand root level
  
  const completedChecklist = todo.checklist?.filter(item => item.completed).length || 0;
  const totalChecklist = todo.checklist?.length || 0;
  const completedSubtasks = todo.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;
  const hasNested = (todo.checklist && todo.checklist.length > 0) || (todo.subtasks && todo.subtasks.length > 0);

  const priorityColors = {
    low: 'secondary',
    medium: 'warning',
    high: 'danger'
  };

  return (
    <div className="mb-3" style={{ marginLeft: `${level * 20}px` }}>
      <Card className="mb-2" style={{ borderLeft: level > 0 ? `4px solid var(--bs-${priorityColors[todo.priority]})` : 'none' }}>
        <CardBody className="p-3">
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
              checked={todo.completed}
              disabled
              className="me-2"
            />
            <span className="fw-bold" style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
            <Badge color={priorityColors[todo.priority]} className="ms-2">
              {todo.priority}
            </Badge>
            {todo.completed && (
              <Badge color="success" className="ms-2">Completed</Badge>
            )}
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

          {todo.description && (
            <div className="mb-2">
              <Label className="small fw-bold">Description:</Label>
              <p className="mb-0 small">{todo.description}</p>
            </div>
          )}

          {todo.dueDate && (
            <div className="mb-2">
              <Label className="small fw-bold">Due Date:</Label>
              <p className="mb-0 small">
                <Calendar size={14} className="me-1" />
                {new Date(todo.dueDate).toLocaleString()}
              </p>
            </div>
          )}

          {todo.tags && todo.tags.length > 0 && (
            <div className="mb-2">
              <Label className="small fw-bold">Tags:</Label>
              <div>
                {todo.tags.map((tag, idx) => (
                  <Badge key={idx} color="primary" className="me-1 mb-1 small">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {expanded && (
            <div className="mt-3">
              {/* Checklist Section */}
              {todo.checklist && todo.checklist.length > 0 && (
                <div className="mb-3">
                  <Label className="fw-bold small">
                    <CheckSquare size={14} className="me-1" />
                    Checklist ({completedChecklist}/{totalChecklist}):
                  </Label>
                  <div className="mt-2">
                    {todo.checklist.map((item) => (
                      <div key={item.id} className="d-flex align-items-center mb-1 p-2" style={{ border: '1px solid #e0e0e0', borderRadius: '4px', backgroundColor: item.completed ? '#f5f5f5' : '#fff' }}>
                        <Input
                          type="checkbox"
                          checked={item.completed}
                          disabled
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
                </div>
              )}

              {/* Subtasks Section */}
              {todo.subtasks && todo.subtasks.length > 0 && (
                <div className="mb-3">
                  <Label className="fw-bold small">Subtasks ({completedSubtasks}/{totalSubtasks}):</Label>
                  <div className="mt-2">
                    {todo.subtasks.map((subtask) => (
                      <FullDetailView
                        key={subtask.id}
                        todo={subtask}
                        level={level + 1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const TodoDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTodo();
    }
  }, [id]);

  const loadTodo = () => {
    try {
      setLoading(true);
      const todos = loadTodos();
      const foundTodo = findTodoById(todos, id as string);
      
      if (foundTodo) {
        setTodo(foundTodo);
      } else {
        toast.error('Todo not found');
        router.push('/admin/my-calendar/syncfusion-test');
      }
    } catch (error) {
      console.error('Error loading todo:', error);
      toast.error('Failed to load todo details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/my-calendar/syncfusion-test');
  };

  if (loading) {
    return (
      <div className="page-body">
        <Container fluid={true}>
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-3">Loading todo details...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="page-body">
        <Container fluid={true}>
          <div className="text-center py-5">
            <h3>Todo not found</h3>
            <Button color="primary" onClick={handleBack} className="mt-3">
              <ArrowLeft size={16} className="me-1" />
              Back to Calendar
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-body">
      <Breadcrumbs
        title="Todo Detail"
        mainTitle={`Todo Detail - ${todo.title}`}
        parent="Calendar"
      />
      <Container fluid={true}>
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5>Full Details - {todo.title}</h5>
                <Button color="secondary" onClick={handleBack}>
                  <ArrowLeft size={16} className="me-1" />
                  Back to Calendar
                </Button>
              </CardHeader>
              <CardBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <FullDetailView todo={todo} level={0} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TodoDetailPage;

