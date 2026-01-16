'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardContext, type DashboardContextType } from '@/contexts/DashboardContext';
import type { Chat, PRD } from '@/lib/types';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro';
}

interface Project {
  id: string;
  name: string;
  status: 'idea' | 'prd' | 'building' | 'launched';
  updatedAt: Date;
}

// =============================================
// Dashboard Layout
// =============================================
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [prds, setPrds] = useState<PRD[]>([]);
  const [isLoadingPRDs, setIsLoadingPRDs] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  // Convert PRDs to Project format for sidebar
  const projects: Project[] = prds.map(prd => ({
    id: prd.id,
    name: prd.title || 'Untitled PRD',
    status: prd.status === 'completed' ? 'launched' :
            prd.status === 'review' ? 'building' :
            prd.status === 'in_progress' ? 'prd' : 'idea',
    updatedAt: new Date(prd.updated_at || prd.created_at),
  }));

  // Extract current chat ID from URL
  useEffect(() => {
    const match = pathname.match(/\/dashboard\/chat\/([^/]+)/);
    setCurrentChatId(match ? match[1] : null);
  }, [pathname]);

  // Fetch user info
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user/usage');
        if (res.ok) {
          const data = await res.json();
          if (!data.isGuest) {
            // Use displayName if available, otherwise extract from email
            const displayName = data.displayName ||
              (data.email ? data.email.split('@')[0] : 'User');
            setUser({
              name: displayName,
              email: data.email || 'user@example.com',
              plan: data.tier === 'pro' ? 'pro' : 'free',
            });
          } else {
            setUser({
              name: 'Guest',
              email: 'guest@promptpit.com',
              plan: 'free',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser({
          name: 'Guest',
          email: 'guest@promptpit.com',
          plan: 'free',
        });
      }
    }
    fetchUser();
  }, []);

  // Fetch chats
  const refreshChats = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  // Fetch PRDs
  const refreshPRDs = useCallback(async () => {
    setIsLoadingPRDs(true);
    try {
      const res = await fetch('/api/prd');
      if (res.ok) {
        const data = await res.json();
        setPrds(data.prds || []);
      }
    } catch (error) {
      console.error('Error fetching PRDs:', error);
    } finally {
      setIsLoadingPRDs(false);
    }
  }, []);

  useEffect(() => {
    refreshPRDs();
  }, [refreshPRDs]);

  // Create new chat
  const createNewChat = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        await refreshChats();
        return data.id;
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
    return null;
  }, [refreshChats]);

  const handleNewProject = () => {
    router.push('/dashboard/prd/new');
  };

  const handleSignOut = () => {
    setUser(null);
    // Redirect to Auth0 logout endpoint (v4 uses /auth/logout)
    window.location.href = '/auth/logout';
  };

  const contextValue: DashboardContextType = {
    chats,
    isLoadingChats,
    refreshChats,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    prds,
    isLoadingPRDs,
    refreshPRDs,
    sidebarOpen,
    setSidebarOpen,
    user,
  };

  // Default user if not loaded yet
  const sidebarUser = user || {
    name: 'Loading...',
    email: '',
    plan: 'free' as const,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="h-screen flex bg-[#FAFAFA] overflow-hidden">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 border border-gray-200 bg-white rounded-lg shadow-sm"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Sidebar */}
        <div
          className={`
            fixed lg:relative inset-y-0 left-0 z-40
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0'}
          `}
        >
          <Sidebar
            projects={projects}
            user={sidebarUser}
            onNewProject={handleNewProject}
            onSignOut={handleSignOut}
          />
        </div>

        {/* Sidebar backdrop (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {/* Breadcrumb or page title could go here */}
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </button>

              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{sidebarUser.name}</p>
                  <p className="text-xs text-gray-500">{sidebarUser.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {sidebarUser.avatar ? (
                    <img src={sidebarUser.avatar} alt={sidebarUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {sidebarUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
