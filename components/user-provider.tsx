'use client';

import { useUserId } from '@/hooks/useUserId';

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const userId = useUserId();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading user...</div>
      </div>
    );
  }

  return <>{children}</>;
}