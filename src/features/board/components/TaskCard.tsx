import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Task } from '../../../types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !['DONE', 'ARCHIVED'].includes(task.status);

  const getBorderColor = () => {
    if (isOverdue) return 'border-t-status-blocked';
    switch (task.status) {
      case 'BLOCKED': return 'border-t-status-blocked';
      case 'READY':
      case 'RUNNING': return 'border-t-status-active';
      case 'DONE':
      case 'ARCHIVED': return 'border-t-status-done';
      default: return 'border-t-status-neutral';
    }
  };

  // Format time e.g., "3d ago"
  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    return `${days}d ago`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-bg-card hover:bg-bg-card-hover border border-border-subtle p-3 mb-2 rounded-sm cursor-grab active:cursor-grabbing flex flex-col gap-2 transition-colors border-t-[3px] ${getBorderColor()} ${isOverdue ? 'shadow-[0_0_8px_rgba(192,57,43,0.3)]' : ''}`}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-text-primary font-medium text-sm leading-snug">{task.title}</h3>
      </div>

      {task.description && (
        <p className="text-text-muted text-xs line-clamp-2 leading-tight">
          {task.description}
        </p>
      )}

      {task.status === 'BLOCKED' && task.blocker_reason && (
        <div className="bg-status-blocked/10 border border-status-blocked/30 text-status-blocked px-2 py-1 rounded-sm text-xs mt-1">
          {task.blocker_reason}
        </div>
      )}

      <div className="flex justify-between items-center mt-1">
        <span className="text-text-dimmed text-[10px]">
          {getRelativeTime(task.created_at)}
        </span>
        {task.deadline && (
          <span className={`text-[10px] ${isOverdue ? 'text-status-blocked font-bold' : 'text-text-muted'}`}>
            Due: {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
