import { useState } from 'react';

import { type User } from '../../../types';

const AUTH_KEY = 'amygdylla_kanban_auth';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    return (stored as User) || null;
  });

  const login = (user: User) => {
    localStorage.setItem(AUTH_KEY, user);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setCurrentUser(null);
  };

  return { currentUser, login, logout };
}
