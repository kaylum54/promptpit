'use client';

import { useState, useEffect } from 'react';

type ActivityType = 'created' | 'updated' | 'status_changed' | 'commented' | 'exported' | 'shared' | 'archived' | 'debate' | 'chat';

interface Activity {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  details?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ActivityType>('all');
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const activityConfig: Record<ActivityType, { icon: JSX.Element; color: string; label: string }> = {
    created: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: 'bg-green-100 text-green-600',
      label: 'Created',
    },
    updated: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600',
      label: 'Updated',
    },
    status_changed: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
      color: 'bg-amber-100 text-amber-600',
      label: 'Status Changed',
    },
    commented: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-600',
      label: 'Commented',
    },
    exported: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      color: 'bg-gray-100 text-gray-600',
      label: 'Exported',
    },
    shared: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      color: 'bg-cyan-100 text-cyan-600',
      label: 'Shared',
    },
    archived: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      color: 'bg-red-100 text-red-600',
      label: 'Archived',
    },
    debate: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'bg-indigo-100 text-indigo-600',
      label: 'Debate',
    },
    chat: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      color: 'bg-teal-100 text-teal-600',
      label: 'Chat',
    },
  };

  // Fetch activities on mount and when filter changes
  useEffect(() => {
    fetchActivities(true);
  }, [filter]);

  const fetchActivities = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setOffset(0);
      } else {
        setIsLoadingMore(true);
      }

      const currentOffset = reset ? 0 : offset;
      const typeParam = filter === 'all' ? '' : `&type=${filter}`;
      const response = await fetch(`/api/activity?limit=${limit}&offset=${currentOffset}${typeParam}`);

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();

      if (reset) {
        setActivities(data.activities || []);
      } else {
        setActivities(prev => [...prev, ...(data.activities || [])]);
      }

      setHasMore(data.hasMore || false);
      setOffset(currentOffset + limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'created':
        return (
          <>
            created <span className="font-medium text-gray-900">{activity.project?.name}</span>
          </>
        );
      case 'updated':
        return (
          <>
            updated <span className="font-medium text-gray-900">{activity.project?.name}</span>
            {activity.details && <span className="text-gray-400"> - {activity.details}</span>}
          </>
        );
      case 'status_changed':
        return (
          <>
            changed status of <span className="font-medium text-gray-900">{activity.project?.name}</span>
            {activity.oldValue && activity.newValue && (
              <>
                {' from '}
                <span className="text-gray-500">{activity.oldValue}</span>
                {' to '}
                <span className="text-gray-900 font-medium">{activity.newValue}</span>
              </>
            )}
          </>
        );
      case 'commented':
        return (
          <>
            commented on <span className="font-medium text-gray-900">{activity.project?.name}</span>
            {activity.details && <span className="text-gray-400 italic"> &quot;{activity.details}&quot;</span>}
          </>
        );
      case 'exported':
        return (
          <>
            exported <span className="font-medium text-gray-900">{activity.project?.name}</span>
            {activity.details && <span className="text-gray-400"> - {activity.details}</span>}
          </>
        );
      case 'shared':
        return (
          <>
            shared <span className="font-medium text-gray-900">{activity.project?.name}</span>
            {activity.details && <span className="text-gray-400"> with {activity.details}</span>}
          </>
        );
      case 'archived':
        return (
          <>
            archived <span className="font-medium text-gray-900">{activity.project?.name}</span>
          </>
        );
      case 'debate':
        return (
          <>
            started a debate: <span className="font-medium text-gray-900">{activity.project?.name}</span>
          </>
        );
      case 'chat':
        return (
          <>
            {activity.details || 'started a chat'}: <span className="font-medium text-gray-900">{activity.project?.name}</span>
          </>
        );
      default:
        return (
          <>
            performed an action on <span className="font-medium text-gray-900">{activity.project?.name || 'Unknown'}</span>
          </>
        );
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchActivities(true)}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Activity</h1>
        <p className="text-gray-500 mt-1">Track all changes and updates across your projects</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Activity
        </button>
        {(Object.keys(activityConfig) as ActivityType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {activityConfig[type].label}
          </button>
        ))}
      </div>

      {/* Activity Timeline */}
      {Object.keys(groupedActivities).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedActivities)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayActivities]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-400 mb-4">{formatDateHeader(date)}</h3>
                <div className="space-y-1">
                  {dayActivities
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((activity, idx) => (
                      <div
                        key={activity.id}
                        className="relative flex gap-4 pb-4"
                      >
                        {/* Timeline Line */}
                        {idx < dayActivities.length - 1 && (
                          <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />
                        )}

                        {/* Activity Icon */}
                        <div className={`w-10 h-10 rounded-full ${activityConfig[activity.type]?.color || 'bg-gray-100 text-gray-600'} flex items-center justify-center flex-shrink-0 relative z-10`}>
                          {activityConfig[activity.type]?.icon || (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>

                        {/* Activity Content */}
                        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-gray-600">
                                <span className="font-medium text-gray-900">{activity.user.name}</span>{' '}
                                {getActivityDescription(activity)}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            When you create projects, make changes, or collaborate with your team, all activity will appear here.
          </p>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchActivities(false)}
            disabled={isLoadingMore}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {isLoadingMore && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Load more activity
          </button>
        </div>
      )}
    </div>
  );
}
