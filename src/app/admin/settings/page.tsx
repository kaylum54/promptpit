'use client';

import { useState, useEffect } from 'react';

interface Settings {
  guest_daily_limit: string;
  free_monthly_limit: string;
  pro_monthly_limit: string;
  maintenance_mode: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setSettings(data.settings))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage('Settings saved successfully');
      } else {
        setMessage('Failed to save settings');
      }
    } catch {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(key: keyof Settings, value: string) {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Platform Settings</h1>
        <div className="bg-bg-surface border border-border-DEFAULT rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-bg-elevated rounded" />
            <div className="h-10 bg-bg-elevated rounded" />
            <div className="h-10 bg-bg-elevated rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Platform Settings</h1>
        <p className="text-text-secondary">Configure usage limits and platform options</p>
      </div>

      {message && (
        <div className={"mb-6 p-4 rounded-lg " + (message.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
          {message}
        </div>
      )}

      <div className="bg-bg-surface border border-border-DEFAULT rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-text-primary border-b border-border-DEFAULT pb-2">Usage Limits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Guest Daily Limit</label>
            <input
              type="number"
              value={settings?.guest_daily_limit || ''}
              onChange={(e) => updateSetting('guest_daily_limit', e.target.value)}
              className="w-full px-4 py-2 bg-bg-base border border-border-DEFAULT rounded-lg text-text-primary"
            />
            <p className="text-xs text-text-muted mt-1">Debates per day for guests</p>
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Free Monthly Limit</label>
            <input
              type="number"
              value={settings?.free_monthly_limit || ''}
              onChange={(e) => updateSetting('free_monthly_limit', e.target.value)}
              className="w-full px-4 py-2 bg-bg-base border border-border-DEFAULT rounded-lg text-text-primary"
            />
            <p className="text-xs text-text-muted mt-1">Debates per month for free users</p>
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Pro Monthly Limit</label>
            <input
              type="number"
              value={settings?.pro_monthly_limit || ''}
              onChange={(e) => updateSetting('pro_monthly_limit', e.target.value)}
              className="w-full px-4 py-2 bg-bg-base border border-border-DEFAULT rounded-lg text-text-primary"
            />
            <p className="text-xs text-text-muted mt-1">Debates per month for pro users</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-text-primary border-b border-border-DEFAULT pb-2 pt-4">Maintenance</h2>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.maintenance_mode === 'true'}
              onChange={(e) => updateSetting('maintenance_mode', e.target.checked ? 'true' : 'false')}
              className="w-5 h-5 rounded border-border-DEFAULT bg-bg-base"
            />
            <span className="text-text-primary">Maintenance Mode</span>
          </label>
          <p className="text-sm text-text-muted">Disable new debates when enabled</p>
        </div>

        <div className="pt-4 border-t border-border-DEFAULT">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-bg-surface border border-border-DEFAULT rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Stripe Configuration</h2>
        <p className="text-text-secondary mb-4">Manage pricing and subscriptions in the Stripe Dashboard.</p>
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30"
        >
          Open Stripe Dashboard
          <span>&rarr;</span>
        </a>
      </div>
    </div>
  );
}
