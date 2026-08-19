import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { type Comment } from '../../../types';

export function useComments(taskId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching comments:', error);
      } else if (data) {
        setComments(data as Comment[]);
      }
      setLoading(false);
    };

    fetchComments();

    const channel = supabase
      .channel(`comments-${taskId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `task_id=eq.${taskId}` },
        (payload: any) => {
          setComments((prev) => {
            if (prev.some(c => c.id === payload.new.id)) {
              return prev.map(c => c.id === payload.new.id ? payload.new as Comment : c);
            }
            return [...prev, payload.new as Comment];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  const addComment = async (content: string, author: string) => {
    const tempId = crypto.randomUUID();
    const newComment: Comment = {
      id: tempId,
      task_id: taskId,
      author: author as any,
      content,
      created_at: new Date().toISOString(),
    };
    
    setComments(prev => [...prev, newComment]);
    
    const { error } = await supabase
      .from('comments')
      .insert({ id: tempId, task_id: taskId, author, content });
      
    if (error) {
      console.error('Error adding comment:', error);
      setComments(prev => prev.filter(c => c.id !== tempId));
    }
  };

  return { comments, loading, addComment };
}
