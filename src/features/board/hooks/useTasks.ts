import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { type Task } from '../../../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, comments(content)')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
    } else if (data) {
      setTasks(data as Task[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => {
              if (prev.some(t => t.id === payload.new.id)) {
                return prev.map(t => t.id === payload.new.id ? payload.new as Task : t);
              }
              return [payload.new as Task, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTask = async (title: string, details?: Partial<Task>) => {
    // Optimistic insert
    const tempId = crypto.randomUUID();
    const newTask: Task = {
      id: tempId,
      title,
      description: details?.description || '',
      status: details?.status || 'TRIAGE',
      author: 'Anurag',
      assignee: null,
      blocker_reason: null,
      created_at: new Date().toISOString(),
      deadline: details?.deadline || null,
      updated_at: new Date().toISOString()
    };
    
    setTasks(prev => [newTask, ...prev]);
    
    const { error } = await supabase
      .from('tasks')
      .insert({ 
        id: tempId, 
        title, 
        author: 'Anurag', 
        status: details?.status || 'TRIAGE',
        description: details?.description || '',
        assignee: null,
        deadline: details?.deadline || null
      });
      
    if (error) {
      console.error('Error adding task:', error);
      // Revert optimistic update
      setTasks(prev => prev.filter(t => t.id !== tempId));
    } else {
        // Realtime will send the actual record back, but we can wait for that
        // Alternatively we can fetchTasks
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    const { error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
      
    if (error) {
      console.error('Error updating task:', error);
      fetchTasks(); // Revert on error
    }
  };

  const deleteTask = async (id: string) => {
    // Optimistic delete
    setTasks(prev => prev.filter(t => t.id !== id));
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting task:', error);
      fetchTasks();
    }
  };

  return { tasks, loading, addTask, updateTask, deleteTask };
}
