import {
  CitizenReport,
  ManagedIssue,
  DuplicateCandidate,
  RecurringIssue,
  AuditLog,
  ApplicationSettings,
  AnalyticsSummary,
  User,
  UserRole,
} from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const savedUser = localStorage.getItem('civicsignal_user');
  if (savedUser) {
    try {
      const u = JSON.parse(savedUser);
      if (u?.id) {
        headers['x-user-id'] = u.id;
      }
    } catch (e) {
      // ignore
    }
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(email: string, name: string, role?: UserRole): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User | null }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return res.json();
  },

  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
    return res.json();
  },

  // Reports
  async getReports(params?: { submitterId?: string; status?: string; category?: string }): Promise<{ reports: CitizenReport[] }> {
    const query = new URLSearchParams();
    if (params?.submitterId) query.set('submitterId', params.submitterId);
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);

    const res = await fetch(`${API_BASE}/reports?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async getReportById(id: string): Promise<{ report: CitizenReport; linkedIssue: ManagedIssue | null }> {
    const res = await fetch(`${API_BASE}/reports/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Report not found');
    return res.json();
  },

  async submitReport(data: {
    title: string;
    category: string;
    description: string;
    severity: string;
    location: { lat: number; lng: number; address: string; landmark?: string };
    photoUrl?: string;
  }): Promise<{ report: CitizenReport; duplicateCandidates: DuplicateCandidate[]; recurringIncident?: RecurringIssue }> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit report');
    }
    return res.json();
  },

  // Managed Issues
  async getManagedIssues(params?: { status?: string; category?: string; priority?: string }): Promise<{ issues: ManagedIssue[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.priority) query.set('priority', params.priority);

    const res = await fetch(`${API_BASE}/managed-issues?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async getManagedIssueById(id: string): Promise<{ issue: ManagedIssue; linkedReports: CitizenReport[] }> {
    const res = await fetch(`${API_BASE}/managed-issues/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Issue not found');
    return res.json();
  },

  async createManagedIssue(data: { reportId: string; title?: string; department?: string }): Promise<{ issue: ManagedIssue }> {
    const res = await fetch(`${API_BASE}/managed-issues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create managed issue');
    }
    return res.json();
  },

  async updateManagedIssue(id: string, updates: Partial<ManagedIssue>, reason?: string): Promise<{ issue: ManagedIssue }> {
    const res = await fetch(`${API_BASE}/managed-issues/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ updates, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update issue');
    }
    return res.json();
  },

  async groupReport(issueId: string, reportId: string, reason: string): Promise<{ issue: ManagedIssue }> {
    const res = await fetch(`${API_BASE}/managed-issues/${issueId}/group`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reportId, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to group report');
    }
    return res.json();
  },

  async ungroupReport(issueId: string, reportId: string, reason: string): Promise<{ issue: ManagedIssue }> {
    const res = await fetch(`${API_BASE}/managed-issues/${issueId}/ungroup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reportId, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to ungroup report');
    }
    return res.json();
  },

  async resolveManagedIssue(
    id: string,
    data: { resolutionNotes: string; resolutionPhotoUrl?: string; actualDurationHours?: number }
  ): Promise<{ issue: ManagedIssue }> {
    const res = await fetch(`${API_BASE}/managed-issues/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to resolve issue');
    }
    return res.json();
  },

  async addInternalNote(issueId: string, text: string): Promise<{ issue: ManagedIssue }> {
    const res = await fetch(`${API_BASE}/managed-issues/${issueId}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add note');
    }
    return res.json();
  },

  // Duplicate Reviews
  async getDuplicates(status?: string): Promise<{ duplicates: DuplicateCandidate[] }> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/duplicates${query}`, { headers: getHeaders() });
    return res.json();
  },

  async reviewDuplicate(
    id: string,
    data: { decision: 'approved' | 'rejected' | 'flagged_recurring'; reason: string; targetManagedIssueId?: string }
  ): Promise<{ candidate: DuplicateCandidate }> {
    const res = await fetch(`${API_BASE}/duplicates/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to review duplicate');
    }
    return res.json();
  },

  // Recurring
  async getRecurringIssues(): Promise<{ recurring: RecurringIssue[] }> {
    const res = await fetch(`${API_BASE}/recurring`, { headers: getHeaders() });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(limit = 100): Promise<{ logs: AuditLog[] }> {
    const res = await fetch(`${API_BASE}/audit-logs?limit=${limit}`, { headers: getHeaders() });
    return res.json();
  },

  // Settings
  async getSettings(): Promise<{ settings: ApplicationSettings; slaRules: any[] }> {
    const res = await fetch(`${API_BASE}/settings`, { headers: getHeaders() });
    return res.json();
  },

  async updateSettings(settings: Partial<ApplicationSettings>): Promise<{ settings: ApplicationSettings }> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update settings');
    }
    return res.json();
  },

  // Seed Reset
  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/seed/reset`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<{ analytics: AnalyticsSummary }> {
    const res = await fetch(`${API_BASE}/analytics`, { headers: getHeaders() });
    return res.json();
  },

  // AI Dispatch Analysis
  async analyzeIssueWithAi(data: {
    title: string;
    category: string;
    description: string;
    severity: string;
    address: string;
  }): Promise<{ analysis: any }> {
    const res = await fetch(`${API_BASE}/ai/analyze-issue`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
