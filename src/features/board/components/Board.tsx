import { useState, useEffect } from 'react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { type Task, type Status, type User } from '../../../types';

const COLUMNS: { id: Status; title: string; defaultExpanded: boolean }[] = [
  { id: 'TRIAGE', title: 'Triage', defaultExpanded: false },
  { id: 'TODO', title: 'TODO', defaultExpanded: false },
  { id: 'SCHEDULED', title: 'Scheduled', defaultExpanded: false },
  { id: 'READY', title: 'On Table', defaultExpanded: false },
  { id: 'RUNNING', title: 'In Progress', defaultExpanded: false },
  { id: 'BLOCKED', title: 'Blocked', defaultExpanded: false },
  { id: 'DONE', title: 'Done', defaultExpanded: false },
  { id: 'ARCHIVED', title: 'Archived', defaultExpanded: false },
];

interface BoardProps {
  tasks: Task[];
  currentUser: User;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  hiddenStatuses?: Status[];
}

export function Board({ tasks, currentUser, onUpdateTask, onDeleteTask, hiddenStatuses = [] }: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<Status>('TRIAGE');
  const [isMobile, setIsMobile] = useState(false);
  const [pendingBlocker, setPendingBlocker] = useState<{ taskId: string } | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (hiddenStatuses.includes(activeTab)) {
      const firstVisible = COLUMNS.find(col => !hiddenStatuses.includes(col.id));
      if (firstVisible) setActiveTab(firstVisible.id);
    }
  }, [hiddenStatuses, activeTab]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Over can be a column or another task
    const overId = over.id as string;
    const isOverColumn = COLUMNS.some(c => c.id === overId);
    
    let newStatus: Status;
    if (isOverColumn) {
      newStatus = overId as Status;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (!overTask) return;
      newStatus = overTask.status;
    }

    if (task.status !== newStatus) {
      if (newStatus === 'BLOCKED') {
        setPendingBlocker({ taskId });
      } else {
        onUpdateTask(taskId, { 
          status: newStatus, 
          blocker_reason: task.status === 'BLOCKED' ? null : task.blocker_reason 
        });
      }
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-bg-app">
        {/* Mobile Tabs */}
        <div className="flex overflow-x-auto border-b border-border-subtle bg-bg-app shrink-0 scrollbar-hide py-2 px-2 gap-2">
          {COLUMNS.filter(col => !hiddenStatuses.includes(col.id)).map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            const isActive = activeTab === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setActiveTab(col.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  isActive ? 'bg-bronze text-carbon' : 'bg-bg-column text-text-muted hover:bg-bg-card-hover border border-border-subtle'
                }`}
              >
                <span>{col.title}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-carbon/20' : 'bg-bg-app'}`}>
                  {colTasks.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-bg-app">
          {tasks.filter(t => t.status === activeTab).map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => setEditingTask(task)}
            />
          ))}
          {tasks.filter(t => t.status === activeTab).length === 0 && (
            <div className="text-center text-text-dimmed py-10">No tasks in {activeTab}</div>
          )}
        </div>
        
        {editingTask && (
          <TaskModal 
            task={editingTask} 
            currentUser={currentUser} 
            onClose={() => setEditingTask(null)}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
          />
        )}
      </div>
    );
  }

  // Desktop Horizontal Scroll
  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-bg-app flex gap-3 p-4 items-start">
        {COLUMNS.filter(col => !hiddenStatuses.includes(col.id)).map(col => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasks.filter(t => t.status === col.id)}
            defaultExpanded={col.defaultExpanded}
            onClickTask={(task) => setEditingTask(task)}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
      
      {editingTask && (
        <TaskModal 
          task={editingTask} 
          currentUser={currentUser} 
          onClose={() => setEditingTask(null)}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}
      {pendingBlocker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bg-app/90 backdrop-blur-sm">
          <div className="bg-bg-column border border-status-blocked/30 rounded-lg shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4">
            <h3 className="text-xl font-display text-status-blocked">Task Blocked</h3>
            <p className="text-sm text-text-muted">Please provide a reason why this task is blocked.</p>
            <input 
              autoFocus
              type="text" 
              placeholder="e.g. Waiting on API response..."
              className="w-full bg-bg-app border border-border-subtle rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-status-blocked"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value;
                  if (val.trim()) {
                    onUpdateTask(pendingBlocker.taskId, { status: 'BLOCKED', blocker_reason: val.trim() });
                    setPendingBlocker(null);
                  }
                } else if (e.key === 'Escape') {
                  setPendingBlocker(null);
                }
              }}
            />
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setPendingBlocker(null)} className="px-4 py-2 text-sm text-text-primary hover:bg-bg-card-hover border border-border-subtle rounded transition-colors">
                Cancel
              </button>
              <button 
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                  if (input.value.trim()) {
                    onUpdateTask(pendingBlocker.taskId, { status: 'BLOCKED', blocker_reason: input.value.trim() });
                    setPendingBlocker(null);
                  }
                }}
                className="px-4 py-2 bg-status-blocked text-[#fff] text-sm font-bold rounded hover:opacity-90 transition-opacity"
              >
                Set Blocked
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
