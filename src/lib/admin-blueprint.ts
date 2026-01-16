export interface AdminFeature {
  name: string;
  description: string;
}

export interface AdminModule {
  name: string;
  icon: string;
  priority: 'must' | 'should' | 'could';
  features: AdminFeature[];
}

export const adminBlueprint = {
  modules: [
    {
      name: 'User Management',
      icon: '👥',
      priority: 'must' as const,
      features: [
        { name: 'User list with search/filter', description: 'View all users with pagination' },
        { name: 'User details view', description: 'See user profile, activity, subscription' },
        { name: 'Edit user', description: 'Update user info, reset password' },
        { name: 'Suspend/ban user', description: 'Temporarily or permanently disable account' },
        { name: 'Impersonate user', description: 'Login as user for debugging (with audit log)' },
      ],
    },
    {
      name: 'Analytics Dashboard',
      icon: '📊',
      priority: 'must' as const,
      features: [
        { name: 'Key metrics overview', description: 'MRR, active users, churn rate' },
        { name: 'User growth chart', description: 'Signups over time' },
        { name: 'Revenue chart', description: 'Revenue trends and projections' },
        { name: 'Feature usage', description: 'Which features are most used' },
      ],
    },
    {
      name: 'Billing Management',
      icon: '💳',
      priority: 'must' as const,
      features: [
        { name: 'Subscription overview', description: 'All active subscriptions' },
        { name: 'Invoice history', description: 'View and resend invoices' },
        { name: 'Refund processing', description: 'Issue refunds with reason tracking' },
        { name: 'Coupon management', description: 'Create and manage discount codes' },
      ],
    },
    {
      name: 'Content Moderation',
      icon: '🛡️',
      priority: 'should' as const,
      features: [
        { name: 'Flagged content queue', description: 'Review reported content' },
        { name: 'Moderation actions', description: 'Approve, reject, or escalate' },
        { name: 'Auto-moderation rules', description: 'Set up keyword filters' },
        { name: 'Appeal handling', description: 'Process user appeals' },
      ],
    },
    {
      name: 'Support Tools',
      icon: '🎧',
      priority: 'should' as const,
      features: [
        { name: 'Support ticket queue', description: 'View and assign tickets' },
        { name: 'Canned responses', description: 'Template replies for common issues' },
        { name: 'Internal notes', description: 'Add notes to user accounts' },
        { name: 'Escalation workflow', description: 'Route complex issues to specialists' },
      ],
    },
    {
      name: 'System Settings',
      icon: '⚙️',
      priority: 'could' as const,
      features: [
        { name: 'Feature flags', description: 'Toggle features on/off' },
        { name: 'Email templates', description: 'Edit transactional emails' },
        { name: 'API keys management', description: 'Generate and revoke API keys' },
        { name: 'Audit log', description: 'Track all admin actions' },
      ],
    },
  ],

  generatePrompt: (prd: { name: string }) => {
    return `Build an admin dashboard for ${prd.name} with the following modules:

${adminBlueprint.modules.map(m => `
## ${m.name} (${m.priority.toUpperCase()})
${m.features.map(f => `- ${f.name}: ${f.description}`).join('\n')}
`).join('\n')}

Requirements:
- Use a sidebar navigation with icons
- Implement role-based access control (Admin, Support, Viewer)
- Add audit logging for all actions
- Include dark mode support
- Make it mobile-responsive
`;
  },
};
