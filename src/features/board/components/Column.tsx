import { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type Task } from '../../../types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  defaultExpanded?: boolean;
  onClaimTask: (taskId: string) => void;
  onClickTask: (task: Task) => void;
}

export function Column({ id, title, tasks, defaultExpanded = true, onClaimTask, onClickTask }: ColumnProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem(`amygdylla_col_${id}`);
    return saved !== null ? saved === 'true' : defaultExpanded;
  });

  const toggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    localStorage.setItem(`amygdylla_col_${id}`, String(next));
  };

  const { setNodeRef, isOver } = useDroppable({ id });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isOver && !isExpanded) {
      timeout = setTimeout(() => {
        setIsExpanded(true);
        localStorage.setItem(`amygdylla_col_${id}`, 'true');
      }, 600); // 600ms hover delay before expanding
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isOver, isExpanded, id]);

  // Task grouping logic
  const now = Date.now();
  const currentWeekEnd = new Date();
  currentWeekEnd.setDate(currentWeekEnd.getDate() + (7 - currentWeekEnd.getDay())); 
  
  const overdue: Task[] = [];
  const thisWeek: Task[] = [];
  const older: Task[] = [];

  tasks.forEach(task => {
    const isDone = ['DONE', 'ARCHIVED'].includes(task.status);
    let group = 'older';
    
    if (task.deadline && new Date(task.deadline).getTime() < now && !isDone) {
      group = 'overdue';
    } else if (task.deadline && new Date(task.deadline).getTime() <= currentWeekEnd.getTime()) {
      group = 'thisWeek';
    } else if (!task.deadline && (now - new Date(task.created_at).getTime()) <= 7 * 24 * 60 * 60 * 1000) {
      group = 'thisWeek';
    }

    if (group === 'overdue') overdue.push(task);
    else if (group === 'thisWeek') thisWeek.push(task);
    else older.push(task);
  });

  const [showOlder, setShowOlder] = useState(false);

  if (!isExpanded) {
    return (
      <div 
        ref={setNodeRef}
        onClick={toggleExpand}
        className="w-12 self-stretch shrink-0 bg-bg-column border border-border-subtle rounded flex flex-col items-center py-4 cursor-pointer hover:bg-bg-card-hover transition-colors overflow-hidden"
      >
        <span className="text-text-muted text-xs font-bold mb-4 bg-bg-app px-2 py-0.5 rounded-full z-10">{tasks.length}</span>
        <div className="flex-1 flex items-center justify-center">
          <div className="font-display text-text-primary tracking-widest text-sm whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
            {title}
          </div>
        </div>
      </div>
    );
  }

  const renderTask = (task: Task) => (
    <TaskCard key={task.id} task={task} onClaim={() => onClaimTask(task.id)} onClick={() => onClickTask(task)} />
  );

  return (
    <div className="w-[320px] self-stretch shrink-0 flex flex-col bg-bg-column border border-border-subtle rounded overflow-hidden">
      <div 
        onClick={toggleExpand}
        className="p-3 border-b border-border-subtle flex justify-between items-center bg-bg-column hover:bg-bg-card-hover cursor-pointer sticky top-0 z-10 group transition-colors"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-display text-text-primary tracking-wide text-lg">{title}</h2>
          <span className="text-text-muted text-xs bg-bg-app px-2 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-text-dimmed">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="text-text-dimmed text-sm text-center py-8">No tasks</div>
          ) : tasks.length <= 10 ? (
             tasks.map(renderTask)
          ) : (
            <>
              {overdue.length > 0 && (
                <div className="mb-4">
                  <div className="text-[10px] uppercase font-bold text-status-blocked tracking-wider mb-2 px-1">Overdue</div>
                  {overdue.map(renderTask)}
                </div>
              )}
              {thisWeek.length > 0 && (
                <div className="mb-4">
                  <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider mb-2 px-1">This Week</div>
                  {thisWeek.map(renderTask)}
                </div>
              )}
              {older.length > 0 && (
                <div>
                  {!showOlder ? (
                    <button 
                      onClick={() => setShowOlder(true)}
                      className="w-full py-2 text-xs text-text-dimmed hover:text-text-primary hover:bg-bg-card-hover border border-dashed border-border-subtle rounded transition-colors"
                    >
                      Show {older.length} older tasks
                    </button>
                  ) : (
                    <>
                      <div className="text-[10px] uppercase font-bold text-text-dimmed tracking-wider mb-2 px-1 flex justify-between">
                        Older / Later
                        <button onClick={() => setShowOlder(false)} className="hover:text-text-primary">Hide</button>
                      </div>
                      {older.map(renderTask)}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
