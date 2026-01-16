export interface SecurityChecklistItem {
  item: string;
  severity: 'high' | 'medium' | 'low';
  phase: string;
}

export interface SecurityChecklist {
  title: string;
  phase: string;
  items: SecurityChecklistItem[];
}

export const securityChecklists: Record<string, SecurityChecklist> = {
  auth: {
    title: 'Authentication & Sessions',
    phase: 'production',
    items: [
      { item: 'Implement secure session handling with httpOnly cookies', severity: 'high', phase: 'auth' },
      { item: 'Add token refresh mechanism', severity: 'high', phase: 'auth' },
      { item: 'Set up CSRF protection', severity: 'high', phase: 'auth' },
      { item: 'Implement rate limiting on auth endpoints', severity: 'high', phase: 'auth' },
      { item: 'Add account lockout after failed attempts', severity: 'medium', phase: 'auth' },
      { item: 'Validate password strength requirements', severity: 'medium', phase: 'auth' },
    ],
  },
  api: {
    title: 'API Security',
    phase: 'architecture',
    items: [
      { item: 'Validate and sanitize all user inputs', severity: 'high', phase: 'api' },
      { item: 'Implement request rate limiting', severity: 'high', phase: 'api' },
      { item: 'Add proper error handling without exposing internals', severity: 'medium', phase: 'api' },
      { item: 'Set up API key rotation mechanism', severity: 'medium', phase: 'api' },
      { item: 'Log all API access for audit trails', severity: 'low', phase: 'api' },
    ],
  },
  database: {
    title: 'Database Security',
    phase: 'architecture',
    items: [
      { item: 'Enable Row Level Security (RLS) policies', severity: 'high', phase: 'database' },
      { item: 'Encrypt sensitive data at rest', severity: 'high', phase: 'database' },
      { item: 'Use parameterized queries (prevent SQL injection)', severity: 'high', phase: 'database' },
      { item: 'Set up regular backup schedule', severity: 'medium', phase: 'database' },
      { item: 'Implement data retention policies', severity: 'low', phase: 'database' },
    ],
  },
  payments: {
    title: 'Payment Security',
    phase: 'production',
    items: [
      { item: 'Verify webhook signatures from payment provider', severity: 'high', phase: 'payments' },
      { item: 'Never store raw credit card data', severity: 'high', phase: 'payments' },
      { item: 'Implement idempotency for payment operations', severity: 'high', phase: 'payments' },
      { item: 'Log all payment events for reconciliation', severity: 'medium', phase: 'payments' },
    ],
  },
  deployment: {
    title: 'Deployment & Infrastructure',
    phase: 'output',
    items: [
      { item: 'Set up HTTPS with valid SSL certificates', severity: 'high', phase: 'deployment' },
      { item: 'Configure security headers (CSP, HSTS, etc.)', severity: 'high', phase: 'deployment' },
      { item: 'Enable DDoS protection', severity: 'medium', phase: 'deployment' },
      { item: 'Set up security monitoring and alerts', severity: 'medium', phase: 'deployment' },
      { item: 'Implement secrets management (no hardcoded keys)', severity: 'high', phase: 'deployment' },
    ],
  },
};
