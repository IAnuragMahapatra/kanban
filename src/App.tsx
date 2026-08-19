import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { useAuth } from './features/auth/hooks/useAuth';
import { useTasks } from './features/board/hooks/useTasks';
import { AuthGate } from './features/auth/components/AuthGate';
import { AppShell, type SortOption } from './components/layout/AppShell';
import { Board } from './features/board/components/Board';
import { QuickAdd } from './features/board/components/QuickAdd';
import { type Status } from './types';

function App() {
  const { currentUser, login } = useAuth();
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
  
  const [search, setSearch] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);


  const [hiddenStatuses, setHiddenStatuses] = useState<Status[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('Manual');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentUser) {
    return <AuthGate onSelect={login} />;
  }

  if (loading) {
    return <div className="min-h-screen bg-bg-app flex items-center justify-center text-text-muted">Loading...</div>;
  }

  let finalTasks = [...tasks];



  if (search.trim()) {
    const fuse = new Fuse(finalTasks, {
      keys: ['title', 'description', 'blocker_reason', 'comments.content'],
      threshold: 0.3,
      ignoreLocation: true
    });
    finalTasks = fuse.search(search).map(r => r.item);
  }

  if (sortBy !== 'Manual') {
    finalTasks.sort((a, b) => {
      if (sortBy === 'Deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'Creation Date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Newest first
      }
      if (sortBy === 'Alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }

  return (
    <>
      <AppShell 
        onSearch={setSearch}
        onAddTrigger={() => setIsQuickAddOpen(true)}
        hiddenStatuses={hiddenStatuses}
        setHiddenStatuses={setHiddenStatuses}
        sortBy={sortBy}
        setSortBy={setSortBy}
      >
        <Board 
          tasks={finalTasks} 
          currentUser={currentUser} 
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          hiddenStatuses={hiddenStatuses}
        />
      </AppShell>

      <QuickAdd 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
        onAdd={(title, details) => addTask(title, details)}
      />
    </>
  );
}

export default App;
