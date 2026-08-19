import { useState } from 'react';
import { type Task, type User, type Status } from '../../../types';
import { useComments } from '../hooks/useComments';

interface TaskModalProps {
  task: Task;
  currentUser: User;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onDecompose?: (task: Task) => Promise<void>;
}

export function TaskModal({ task, currentUser, onClose, onUpdate, onDelete, onDecompose }: TaskModalProps) {
  const [description, setDescription] = useState(task.description);
  const [deadline, setDeadline] = useState(task.deadline ? task.deadline.split('T')[0] : '');
  const [newComment, setNewComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDecomposing, setIsDecomposing] = useState(false);

  const { comments, addComment } = useComments(task.id);

  const handleSave = () => {
    onUpdate(task.id, {
      description,
      deadline: deadline ? new Date(deadline).toISOString() : null
    });
    onClose();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(newComment.trim(), currentUser);
      setNewComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  const handleDecompose = async () => {
    if (!onDecompose) return;
    setIsDecomposing(true);
    try {
      await onDecompose(task);
      onClose();
    } catch (error) {
      console.error("Failed to decompose:", error);
      alert("Failed to decompose task. Check console for details.");
    } finally {
      setIsDecomposing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-app/80 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-bg-column border border-border-subtle rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-border-subtle flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-text-muted bg-bg-app px-2 py-0.5 rounded">{task.status}</span>
            </div>
            <h2 className="text-xl font-display text-text-primary">{task.title}</h2>
          </div>
          <button onClick={onClose} className="text-text-dimmed hover:text-text-primary text-2xl leading-none">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-6 scrollbar-thin">

          {/* Main Column */}
          <div className="flex-1 flex flex-col gap-8">
            <div className="flex flex-col shrink-0">
              <label className="block text-xs uppercase font-bold text-text-muted mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                className="w-full h-48 bg-bg-app border border-border-subtle rounded p-3 text-sm text-text-primary focus:outline-none focus:border-bronze resize-none"
              />
            </div>

            {/* Comments Section */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-xs uppercase font-bold text-text-muted mb-3 shrink-0">Activity</label>
              <div className="flex flex-col gap-3 mb-4 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="bg-bg-card border border-border-subtle rounded p-3 flex flex-col gap-1 shrink-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-text-primary">{c.author}</span>
                      <span className="text-[10px] text-text-dimmed">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-text-primary">{c.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-auto shrink-0">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-bg-app border border-border-subtle rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-bronze"
                />
                <button type="submit" className="px-4 py-2 bg-bg-card hover:bg-bg-card-hover border border-border-subtle text-text-primary text-sm font-medium rounded transition-colors">
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-48 flex flex-col gap-4 shrink-0">

            <div>
              <label className="block text-xs uppercase font-bold text-text-muted mb-2">Status</label>
              <select
                value={task.status}
                onChange={(e) => onUpdate(task.id, { status: e.target.value as Status })}
                className="w-full bg-bg-app border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary focus:outline-none"
              >
                <option value="TRIAGE">Triage</option>
                <option value="TODO">TODO</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="READY">On Table</option>
                <option value="RUNNING">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Done</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-text-muted mb-2">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-bg-app border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary focus:outline-none"
              />
            </div>

          <div className="mt-auto pt-6">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 text-status-blocked border border-status-blocked/30 hover:bg-status-blocked/10 rounded text-sm transition-colors"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle bg-bg-column flex justify-between items-center gap-3">
          <div>
            {task.status === 'TRIAGE' && onDecompose && (
              <button
                onClick={handleDecompose}
                disabled={isDecomposing}
                className="px-4 py-1.5 border border-bronze text-bronze text-sm font-bold rounded hover:bg-bronze/10 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDecomposing ? (
                  <span className="animate-pulse">Decomposing...</span>
                ) : (
                  <span>Decompose with AI</span>
                )}
              </button>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 bg-bronze text-carbon text-sm font-bold rounded hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bg-app/90 backdrop-blur-sm">
          <div className="bg-bg-column border border-status-blocked/30 rounded-lg shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4">
            <h3 className="text-xl font-display text-status-blocked">Delete Task</h3>
            <p className="text-sm text-text-muted">Are you sure you want to permanently delete "{task.title}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm text-text-primary hover:bg-bg-card-hover border border-border-subtle rounded transition-colors">
                Cancel
              </button>
              <button onClick={() => { onDelete(task.id); onClose(); }} className="px-4 py-2 bg-status-blocked text-[#fff] text-sm font-bold rounded hover:opacity-90 transition-opacity">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
