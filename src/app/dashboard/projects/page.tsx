'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/contexts/DashboardContext';

type ViewMode = 'grid' | 'list';
type SortBy = 'recent' | 'name' | 'status';
type FilterStatus = 'all' | 'idea' | 'prd' | 'building' | 'launched';

const statusConfig = {
  idea: { label: 'Idea', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  prd: { label: 'PRD in Progress', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  building: { label: 'Building', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  launched: { label: 'Launched', color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
};

export default function ProjectsPage() {
  const { prds, isLoadingPRDs } = useDashboard();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Convert PRDs to projects
  const projects = useMemo(() => {
    return prds.map(prd => ({
      id: prd.id,
      name: prd.title || 'Untitled PRD',
      description: prd.idea_summary?.problem?.substring(0, 150) || '',
      status: (prd.status === 'completed' ? 'launched' :
               prd.status === 'review' ? 'building' :
               prd.status === 'in_progress' ? 'prd' : 'idea') as keyof typeof statusConfig,
      prdPhase: prd.current_phase,
      updatedAt: new Date(prd.updated_at || prd.created_at),
      createdAt: new Date(prd.created_at),
    }));
  }, [prds]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'status':
        const statusOrder = ['idea', 'prd', 'building', 'launched'];
        result.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
        break;
      case 'recent':
      default:
        result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    return result;
  }, [projects, filterStatus, searchQuery, sortBy]);

  const statusCounts = useMemo(() => {
    return {
      all: projects.length,
      idea: projects.filter(p => p.status === 'idea').length,
      prd: projects.filter(p => p.status === 'prd').length,
      building: projects.filter(p => p.status === 'building').length,
      launched: projects.filter(p => p.status === 'launched').length,
    };
  }, [projects]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">All Projects</h1>
          <p className="text-gray-500 mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>

        <Link
          href="/dashboard/prd/new"
          className="
            flex items-center gap-2
            bg-black text-white
            px-4 py-2.5 rounded-lg
            font-medium text-sm
            hover:bg-gray-800
            transition-colors
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2
                bg-gray-50 border border-gray-200 rounded-lg
                text-sm text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-shadow
              "
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            {(['all', 'idea', 'prd', 'building', 'launched'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${filterStatus === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {status === 'all' ? 'All' : statusConfig[status].label}
                <span className="ml-1.5 opacity-60">{statusCounts[status]}</span>
              </button>
            ))}
          </div>

          {/* Sort & View */}
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="
                px-3 py-2 bg-gray-100 border-0 rounded-lg
                text-sm text-gray-700
                focus:outline-none focus:ring-2 focus:ring-gray-900
                cursor-pointer
              "
            >
              <option value="recent">Recently Updated</option>
              <option value="name">Name A-Z</option>
              <option value="status">Status</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  p-1.5 rounded transition-colors
                  ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
                `}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  p-1.5 rounded transition-colors
                  ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
                `}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {isLoadingPRDs ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="w-20 h-5 bg-gray-200 rounded" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-1" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/prd/${project.id}`}
                className="
                  bg-white border border-gray-200 rounded-xl p-5
                  hover:border-gray-300 hover:shadow-md
                  transition-all
                  group
                "
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusConfig[project.status].dot} mt-1.5`} />
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[project.status].color}`}>
                    {statusConfig[project.status].label}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-black transition-colors line-clamp-1">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  {project.status === 'prd' && project.prdPhase && (
                    <span className="text-xs text-gray-500">Phase {project.prdPhase}/6</span>
                  )}
                  {project.status !== 'prd' && <span />}
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(project.updatedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/prd/${project.id}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${statusConfig[project.status].dot}`} />
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                          {project.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[project.status].color}`}>
                        {statusConfig[project.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {project.status === 'prd' && project.prdPhase ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${(project.prdPhase / 6) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">Phase {project.prdPhase}/6</span>
                        </div>
                      ) : project.status === 'launched' ? (
                        <span className="text-xs text-green-600">Complete</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatRelativeTime(project.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery || filterStatus !== 'all' ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matching projects</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">Create your first PRD to get started</p>
              <Link
                href="/dashboard/prd/new"
                className="inline-block px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Create Project
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}
