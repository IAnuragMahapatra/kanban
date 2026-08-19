import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { type User } from '../../../types';

export function usePresence(currentUser: User | null) {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: currentUser,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state) as User[];
        setOnlineUsers(users);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser]);

  return { onlineUsers };
}
