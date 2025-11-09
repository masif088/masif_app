import React, { useState, useEffect, useRef } from 'react';
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  ViewsDirective,
  ViewDirective,
  EventSettingsModel,
  PopupOpenEventArgs,
  ActionEventArgs,
  Resize,
  DragAndDrop
} from '@syncfusion/ej2-react-schedule';
import { Button } from 'reactstrap';
import { TodoItem } from 'Types/TodoType';

interface SyncfusionCalendarProps {
  todos: TodoItem[];
  onEventClick?: (todo: TodoItem) => void;
  onDateClick?: (date: Date) => void;
  onEventCreate?: (todo: TodoItem) => void;
  onEventUpdate?: (todo: TodoItem) => void;
  onEventDelete?: (todoId: string) => void;
}

const SyncfusionCalendar: React.FC<SyncfusionCalendarProps> = ({
  todos,
  onEventClick,
  onDateClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete
}) => {
  const [currentView, setCurrentView] = useState<string>('Month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Prevent any form submission or page refresh on calendar clicks
  useEffect(() => {
    const calendarElement = calendarRef.current;
    if (!calendarElement) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Only prevent default for navigation-related elements
      if (target.tagName === 'A' || target.closest('a')) {
        const anchor = (target.tagName === 'A' ? target : target.closest('a')) as HTMLAnchorElement | null;
        if (anchor && anchor.href && anchor.href !== '#' && !anchor.href.startsWith('javascript:')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
      
      // If clicking on a button without type, prevent form submission
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = (target.tagName === 'BUTTON' ? target : target.closest('button')) as HTMLButtonElement | null;
        if (button && !button.type) {
          button.type = 'button';
        }
      }
    };

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Use a MutationObserver to watch for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as HTMLElement;
            
            // Prevent default on all anchor tags
            const anchors = element.querySelectorAll ? element.querySelectorAll('a') : [];
            anchors.forEach(anchor => {
              anchor.addEventListener('click', (e) => {
                if (anchor.href && anchor.href !== '#' && !anchor.href.startsWith('javascript:')) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }, true);
            });
            
            // Set button types
            const buttons = element.querySelectorAll ? element.querySelectorAll('button') : [];
            buttons.forEach(button => {
              if (!button.type) {
                button.type = 'button';
              }
            });
          }
        });
      });
    });

    // Add event listeners
    calendarElement.addEventListener('click', handleClick, true); // Use capture phase
    calendarElement.addEventListener('submit', handleSubmit, true);
    
    // Also prevent default on existing anchor tags
    const anchors = calendarElement.querySelectorAll('a');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        if (anchor.href && anchor.href !== '#' && !anchor.href.startsWith('javascript:')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    });

    // Observe for dynamically added elements
    observer.observe(calendarElement, {
      childList: true,
      subtree: true
    });

    return () => {
      calendarElement.removeEventListener('click', handleClick, true);
      calendarElement.removeEventListener('submit', handleSubmit, true);
      observer.disconnect();
    };
  }, []);

  // Convert todos to Syncfusion event format
  const convertTodosToEvents = (): any[] => {
    const flattenTodos = (items: TodoItem[]): TodoItem[] => {
      const result: TodoItem[] = [];
      items.forEach(item => {
        if (item.dueDate) {
          result.push(item);
        }
        if (item.subtasks) {
          result.push(...flattenTodos(item.subtasks));
        }
      });
      return result;
    };

    const flattenedTodos = flattenTodos(todos);
    return flattenedTodos.map(todo => ({
      Id: todo.id,
      Subject: todo.title,
      StartTime: new Date(todo.dueDate!),
      EndTime: new Date(new Date(todo.dueDate!).getTime() + 60 * 60 * 1000), // 1 hour default
      Description: todo.description || '',
      IsAllDay: true,
      RecurrenceRule: '',
      CategoryColor: todo.priority === 'high' ? '#dc3545' : todo.priority === 'medium' ? '#ffc107' : '#6c757d',
      // Custom fields - store todo data for later use
      TodoData: todo
    }));
  };

  const eventSettings: EventSettingsModel = {
    dataSource: convertTodosToEvents(),
    fields: {
      id: 'Id',
      subject: { name: 'Subject', title: 'Event Name' },
      startTime: { name: 'StartTime', title: 'Start Duration' },
      endTime: { name: 'EndTime', title: 'End Duration' },
      description: { name: 'Description' },
      isAllDay: { name: 'IsAllDay' }
    }
  };

  const handleEventClick = (args: any) => {
    args.cancel = true; // Disable default behavior
    // Prevent any navigation or refresh by stopping event propagation
    if (args.originalEvent) {
      args.originalEvent.preventDefault?.();
      args.originalEvent.stopPropagation?.();
      args.originalEvent.stopImmediatePropagation?.();
    }
    // Also try to prevent on the event object itself
    if (args.event) {
      args.event.preventDefault?.();
      args.event.stopPropagation?.();
    }
    if (args.event && args.event.TodoData && onEventClick) {
      onEventClick(args.event.TodoData);
    }
    return false; // Explicitly return false to prevent default
  };

  const handleCellClick = (args: any) => {
    args.cancel = true; // Disable default behavior - this prevents automatic navigation
    // Prevent any navigation or refresh by stopping event propagation
    if (args.originalEvent) {
      args.originalEvent.preventDefault?.();
      args.originalEvent.stopPropagation?.();
      args.originalEvent.stopImmediatePropagation?.();
    }
    // Also try to prevent on the event object itself
    if (args.event) {
      args.event.preventDefault?.();
      args.event.stopPropagation?.();
    }
    // Update selectedDate to the clicked date - this will navigate the calendar
    if (args.startTime) {
      setSelectedDate(new Date(args.startTime));
    }
    // Call our custom handler
    if (onDateClick) {
      onDateClick(args.startTime);
    }
    return false; // Explicitly return false to prevent default
  };

  const handleActionComplete = (args: ActionEventArgs) => {
    if (args.requestType === 'eventCreate' && args.addedRecords && args.addedRecords.length > 0) {
      const event = args.addedRecords[0];
      if (onEventCreate && event.TodoData) {
        onEventCreate(event.TodoData);
      }
    } else if (args.requestType === 'eventChange' && args.changedRecords && args.changedRecords.length > 0) {
      const event = args.changedRecords[0];
      if (onEventUpdate && event.TodoData) {
        onEventUpdate(event.TodoData);
      }
    } else if (args.requestType === 'eventRemove' && args.deletedRecords && args.deletedRecords.length > 0) {
      const event = args.deletedRecords[0];
      if (onEventDelete && event.Id) {
        onEventDelete(event.Id);
      }
    }
  };

  const handlePopupOpen = (args: PopupOpenEventArgs) => {
    // Disable default editor popup, we'll use our custom modal
    if (args.type === 'Editor') {
      args.cancel = true;
      // If event exists, trigger edit
      if (args.data && args.data.TodoData && onEventClick) {
        onEventClick(args.data.TodoData);
      }
    }
  };

  const handleNavigating = (args: any) => {
    // Prevent ALL navigation behavior that causes refresh
    // This prevents the calendar from navigating to "now" week/month when clicking cells
    // We want to prevent date navigation but allow view changes via toolbar
    if (args.action === 'dateNavigate') {
      // Prevent date navigation (clicking on a date cell to navigate to it)
      args.cancel = true;
      return false;
    }
    // Allow view navigation (changing between Day/Week/Month views via toolbar)
    // This is handled by the currentView state
  };

  return (
    <div ref={calendarRef} style={{ width: '100%', height: '600px' }}>
      <style>{`
        .e-schedule .e-toolbar .e-toolbar-item.e-add,
        .e-schedule .e-toolbar .e-toolbar-item.e-add::before,
        .e-schedule .e-toolbar .e-toolbar-item[aria-label*="Add"],
        .e-schedule .e-toolbar .e-toolbar-item[title*="Add"] {
          display: none !important;
        }
      `}</style>
      <ScheduleComponent
        width="100%"
        height="600px"
        selectedDate={selectedDate}
        currentView={currentView as any}
        eventSettings={eventSettings}
        eventClick={handleEventClick}
        cellClick={handleCellClick}
        actionComplete={handleActionComplete}
        popupOpen={handlePopupOpen}
        navigating={handleNavigating}
        showQuickInfo={false}
        enableAdaptiveUI={true}
        allowDragAndDrop={false}
        allowResizing={false}
      >
        <ViewsDirective>
          <ViewDirective option="Day" />
          <ViewDirective option="Week" />
          <ViewDirective option="WorkWeek" />
          <ViewDirective option="Month" />
          <ViewDirective option="Agenda" />
        </ViewsDirective>
        <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
      </ScheduleComponent>
    </div>
  );
};

export default SyncfusionCalendar;

