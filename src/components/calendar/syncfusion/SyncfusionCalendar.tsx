import React, { useState } from 'react';
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
    if (args.event && args.event.TodoData && onEventClick) {
      onEventClick(args.event.TodoData);
    }
  };

  const handleCellClick = (args: any) => {
    args.cancel = true; // Disable default behavior
    if (onDateClick) {
      onDateClick(args.startTime);
    }
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

  return (
    <div style={{ width: '100%', height: '600px' }}>
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
        selectedDate={new Date()}
        currentView={currentView as any}
        eventSettings={eventSettings}
        eventClick={handleEventClick}
        cellClick={handleCellClick}
        actionComplete={handleActionComplete}
        popupOpen={handlePopupOpen}
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

