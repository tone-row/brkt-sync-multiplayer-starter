'use client';

import { nanoid } from 'nanoid';
import { useState, useEffect } from 'react';

const USER_ID_KEY = 'brkt-user-id';

export function useUserId() {
  const [state, setState] = useState<{ userId: string | null; isHydrated: boolean }>({
    userId: null,
    isHydrated: false,
  });

  useEffect(() => {
    // This runs only on the client after hydration
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = nanoid();
      localStorage.setItem(USER_ID_KEY, id);
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ userId: id, isHydrated: true });
  }, []);

  // Return null until hydration is complete to avoid mismatch
  return state.isHydrated ? state.userId : null;
}