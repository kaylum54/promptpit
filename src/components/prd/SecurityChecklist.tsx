'use client';

import { useState } from 'react';
import { securityChecklists } from '@/lib/security-checklists';

interface SecurityChecklistProps {
  currentPhase?: string;
}

export function SecurityChecklist({ currentPhase = 'all' }: SecurityChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const relevantChecklists = Object.entries(securityChecklists).filter(
    ([key, checklist]) => {
      if (currentPhase === 'all') return true;
      return checklist.phase.toLowerCase().includes(currentPhase.toLowerCase());
    }
  );

  const toggleItem = (checklistKey: string, itemIndex: number) => {
    const key = `${checklistKey}-${itemIndex}`;
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const totalItems = relevantChecklists.reduce((sum, [, cl]) => sum + cl.items.length, 0);
  const checkedCount = checkedItems.size;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
            🔒
          </div>
          <div>
            <h3 className="text-black font-semibold">Security Checklist</h3>
            <p className="text-sm text-gray-500">Phase-by-phase security guidance</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-black">{progress}%</div>
          <div className="text-xs text-gray-500">{checkedCount}/{totalItems} complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gray-400 to-black transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-6">
        {relevantChecklists.map(([key, checklist]) => (
          <div key={key}>
            <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              {checklist.title}
              <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-500">
                {checklist.phase}
              </span>
            </h4>
            <div className="space-y-2">
              {checklist.items.map((item, index) => {
                const itemKey = `${key}-${index}`;
                const isChecked = checkedItems.has(itemKey);

                return (
                  <button
                    key={index}
                    onClick={() => toggleItem(key, index)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${isChecked ? 'bg-gray-100 border border-gray-300' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isChecked ? 'bg-black text-white' : 'border border-gray-400'}`}>
                      {isChecked && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${isChecked ? 'text-gray-500 line-through' : 'text-black'}`}>
                        {item.item}
                      </div>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${item.severity === 'high' ? 'bg-gray-200 text-black font-medium' : item.severity === 'medium' ? 'bg-gray-100 text-gray-600' : 'bg-gray-500/20 text-gray-600'}`}>
                        {item.severity}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
