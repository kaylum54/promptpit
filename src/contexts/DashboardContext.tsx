'use client';

import { createContext, useContext } from 'react';
import type { Chat, PRD } from '@/lib/types';

// =============================================
// Dashboard Context Types
// =============================================
interface UserData {
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro';
}

export interface DashboardContextType {
  chats: Chat[];
  isLoadingChats: boolean;
  refreshChats: () => Promise<void>;
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  createNewChat: () => Promise<string | null>;
  prds: PRD[];
  isLoadingPRDs: boolean;
  refreshPRDs: () => Promise<void>;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: UserData | null;
}

export const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardLayout');
  }
  return context;
}
