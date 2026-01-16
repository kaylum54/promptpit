'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { redirectToPortal } from '@/lib/stripe-client';

type SettingsTab = 'general' | 'billing' | 'notifications' | 'integrations';

interface UserSettings {
  display_name: string | null;
  email: string | null;
  timezone: string;
  language: string;
  notify_weekly_digest: boolean;
  notify_prd_complete: boolean;
  notify_team_updates: boolean;
  notify_marketing: boolean;
  tier: string;
  role: string;
  subscription_status: string | null;
  subscription_period_end: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await response.json();
        setSettings(data.settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const tabs = [
    { id: 'general' as const, label: 'General', icon: 'user' },
    { id: 'billing' as const, label: 'Billing', icon: 'card' },
    { id: 'notifications' as const, label: 'Notifications', icon: 'bell' },
    { id: 'integrations' as const, label: 'Integrations', icon: 'plug' },
  ];

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

  if (error || !settings) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error || 'Failed to load settings'}</p>
          <button
            onClick={() => window.location.reload()}
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
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <TabIcon name={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <GeneralSettings settings={settings} onUpdate={setSettings} />
      )}
      {activeTab === 'billing' && <BillingSettings settings={settings} />}
      {activeTab === 'notifications' && (
        <NotificationSettings settings={settings} onUpdate={setSettings} />
      )}
      {activeTab === 'integrations' && <IntegrationsSettings />}
    </div>
  );
}

// General Settings
function GeneralSettings({
  settings,
  onUpdate,
}: {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
}) {
  const [formData, setFormData] = useState({
    display_name: settings.display_name || '',
    timezone: settings.timezone || 'UTC',
    language: settings.language || 'en',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      onUpdate({ ...settings, ...formData });
      setSaveMessage({ type: 'success', text: 'Settings saved successfully' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Profile</h3>

        <div className="flex items-start gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl font-medium text-gray-600">
              {formData.display_name?.charAt(0)?.toUpperCase() || settings.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Change Avatar
            </button>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={settings.email || ''}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50"
              placeholder="your@email.com"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Preferences</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {saveMessage && (
            <p className={`text-sm flex items-center gap-2 ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {saveMessage.type === 'success' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {saveMessage.text}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-xl p-6">
        <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data</p>
        <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}

// Billing Settings
function BillingSettings({ settings }: { settings: UserSettings }) {
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  const isPro = settings.tier === 'pro';
  const nextBillingDate = settings.subscription_period_end
    ? new Date(settings.subscription_period_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const handleManageBilling = async () => {
    setBillingError(null);
    setIsManagingBilling(true);
    try {
      await redirectToPortal();
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : 'Failed to open billing portal');
      setIsManagingBilling(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Current Plan</h3>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPro ? 'bg-purple-100' : 'bg-gray-200'}`}>
              {isPro ? (
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{isPro ? 'Pro Plan' : 'Free Plan'}</p>
              <p className="text-sm text-gray-500">{isPro ? '$9/month' : 'Limited features'}</p>
            </div>
          </div>
          {isPro ? (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              settings.subscription_status === 'active'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {settings.subscription_status?.toUpperCase() || 'ACTIVE'}
            </span>
          ) : (
            <Link
              href="/pricing"
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>

        {isPro && (
          <div className="space-y-3">
            {nextBillingDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Next billing date</span>
                <span className="text-gray-900 font-medium">{nextBillingDate}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Member since</span>
              <span className="text-gray-900 font-medium">
                {new Date(settings.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method */}
      {isPro && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Payment Method</h3>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">**** **** **** 4242</p>
                <p className="text-xs text-gray-500">Expires 12/2027</p>
              </div>
            </div>
            <button
              onClick={handleManageBilling}
              disabled={isManagingBilling}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              {isManagingBilling ? 'Opening...' : 'Update'}
            </button>
          </div>
        </div>
      )}

      {/* Cancel Subscription */}
      {isPro && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Cancel Subscription</h3>
          <p className="text-sm text-gray-500 mb-4">Your subscription will remain active until the end of the billing period.</p>
          <button
            onClick={handleManageBilling}
            disabled={isManagingBilling}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isManagingBilling ? 'Opening...' : 'Manage Subscription'}
          </button>
          {billingError && (
            <p className="mt-2 text-sm text-red-600">{billingError}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Notification Settings
function NotificationSettings({
  settings,
  onUpdate,
}: {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
}) {
  const [notifications, setNotifications] = useState({
    notify_weekly_digest: settings.notify_weekly_digest,
    notify_prd_complete: settings.notify_prd_complete,
    notify_team_updates: settings.notify_team_updates,
    notify_marketing: settings.notify_marketing,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications({ ...notifications, [key]: newValue });
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue }),
      });

      if (response.ok) {
        onUpdate({ ...settings, [key]: newValue });
      } else {
        // Revert on error
        setNotifications({ ...notifications, [key]: !newValue });
      }
    } catch {
      // Revert on error
      setNotifications({ ...notifications, [key]: !newValue });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Email Notifications</h3>

        <div className="space-y-4">
          <NotificationToggle
            label="Weekly Digest"
            description="Receive a weekly summary of your project activity"
            checked={notifications.notify_weekly_digest}
            onChange={() => handleToggle('notify_weekly_digest')}
            disabled={isSaving}
          />
          <NotificationToggle
            label="PRD Completed"
            description="Get notified when a PRD generation is complete"
            checked={notifications.notify_prd_complete}
            onChange={() => handleToggle('notify_prd_complete')}
            disabled={isSaving}
          />
          <NotificationToggle
            label="Team Updates"
            description="Notifications about team member activity"
            checked={notifications.notify_team_updates}
            onChange={() => handleToggle('notify_team_updates')}
            disabled={isSaving}
          />
          <NotificationToggle
            label="Marketing & Tips"
            description="Product updates, tips, and promotional offers"
            checked={notifications.notify_marketing}
            onChange={() => handleToggle('notify_marketing')}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

// Integrations Settings
function IntegrationsSettings() {
  const integrations = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect your repositories for automatic build tracking',
      icon: 'github',
      connected: false,
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Export PRDs directly to your Notion workspace',
      icon: 'notion',
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and updates in Slack',
      icon: 'slack',
      connected: false,
    },
    {
      id: 'linear',
      name: 'Linear',
      description: 'Create issues from your PRD features',
      icon: 'linear',
      connected: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-amber-700">Integrations are coming soon. Stay tuned!</p>
      </div>
      {integrations.map((integration) => (
        <div key={integration.id} className="bg-white border border-gray-200 rounded-xl p-6 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <IntegrationIcon name={integration.icon} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{integration.name}</p>
                <p className="text-sm text-gray-500">{integration.description}</p>
              </div>
            </div>
            <button
              disabled
              className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper Components
function NotificationToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`
          relative w-11 h-6 rounded-full transition-colors disabled:opacity-50
          ${checked ? 'bg-black' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

function TabIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    user: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    card: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    bell: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    plug: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  };
  return icons[name] || null;
}

function IntegrationIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    github: (
      <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
    notion: (
      <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 2.03c-.42-.326-.98-.7-2.055-.607L3.01 2.71c-.466.046-.56.28-.374.466l1.823 1.032zm.793 3.172v13.851c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.166V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.186c-.094-.187 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.453-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933l3.222-.187z" />
      </svg>
    ),
    slack: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
      </svg>
    ),
    linear: (
      <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2.514 10.773a9.51 9.51 0 0 0 10.713 10.713.476.476 0 0 0 .337-.81L3.324 10.436a.476.476 0 0 0-.81.337zM4.013 7.59l12.397 12.397a.476.476 0 0 0 .69-.048 9.51 9.51 0 0 0-13.04-13.039.476.476 0 0 0-.047.69zM7.59 4.013a.476.476 0 0 0-.69.048 9.51 9.51 0 0 0 13.039 13.039.476.476 0 0 0 .048-.69L7.59 4.013z" />
      </svg>
    ),
  };
  return icons[name] || null;
}
