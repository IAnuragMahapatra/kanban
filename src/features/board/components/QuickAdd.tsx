import React, { useState, useEffect, useRef } from 'react';
import { type Task, type User, type Status } from '../../../types';

interface QuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, details: Partial<Task>) => void;
}

export function QuickAdd({ isOpen, onClose, onAdd }: QuickAddProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState<User | ''>('');
  const [status, setStatus] = useState<Status>('TRIAGE');
  const [deadline, setDeadline] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setAssignee('');
      setStatus('TRIAGE');
      setDeadline('');
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), {
        description,
        assignee: assignee || null,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-app/80 backdrop-blur-sm" onKeyDown={handleKeyDown}>
      <div className="bg-bg-column border border-border-subtle rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-border-subtle flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold text-text-muted bg-bg-app px-2 py-0.5 rounded">NEW TASK</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title..."
              className="w-full bg-transparent border-none outline-none text-xl font-display text-text-primary placeholder:text-text-dimmed"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
          <button onClick={onClose} className="text-text-dimmed hover:text-text-primary text-2xl leading-none">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-6 scrollbar-thin">
          
          {/* Main Column */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1 flex flex-col">
              <label className="block text-xs uppercase font-bold text-text-muted mb-2 shrink-0">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                className="w-full flex-1 bg-bg-app border border-border-subtle rounded p-3 text-sm text-text-primary focus:outline-none focus:border-bronze resize-none"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-48 flex flex-col gap-4 shrink-0">
            <div>
              <label className="block text-xs uppercase font-bold text-text-muted mb-2">Assignee</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value as User | '')}
                className="w-full bg-bg-app border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary focus:outline-none"
              >
                <option value="">Unassigned</option>
                <option value="Anurag">Anurag</option>
                <option value="Srinibas">Srinibas</option>
                <option value="Ayush">Ayush</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-text-muted mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
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
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle bg-bg-column flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => handleSubmit()} 
            disabled={!title.trim()}
            className="px-4 py-1.5 bg-bronze text-carbon text-sm font-bold rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
