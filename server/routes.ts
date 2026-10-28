import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { generateIssueIntelligence } from './ai.js';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

export const apiRouter = Router();

// Helper to extract actor from header or use default
function getActor(req: Request) {
  const actorId = (req.headers['x-user-id'] as string) || 'user-citizen-1';
  const user = db.getUserById(actorId);
  if (user) {
    return { id: user.id, name: user.name, role: user.role };
  }
  return { id: 'user-citizen-1', name: 'Sarah Jenkins', role: 'citizen' as const };
}

// --- Auth Routes ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found with this email. Please register.' });
  }
  return res.json({ user });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, name, role } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered. Please login.' });
  }
  // Default newly registered users to citizen role
  const assignedRole = role === 'staff' || role === 'admin' ? role : 'citizen';
  const user = db.createUser(email, name, assignedRole);
  return res.json({ user });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const actor = getActor(req);
  const user = db.getUserById(actor.id);
  return res.json({ user: user || null });
});

apiRouter.get('/users', (req: Request, res: Response) => {
  return res.json({ users: db.getUsers() });
});

// --- Reports Routes ---
apiRouter.get('/reports', (req: Request, res: Response) => {
  const { submitterId, status, category } = req.query;
  const reports = db.getReports({
    submitterId: submitterId as string,
    status: status as string,
    category: category as string,
  });
  return res.json({ reports });
});

apiRouter.get('/reports/:id', (req: Request, res: Response) => {
  const report = db.getReportById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const linkedIssue = report.managedIssueId ? db.getManagedIssueById(report.managedIssueId) : null;
  return res.json({ report, linkedIssue });
});

apiRouter.post('/reports', async (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const { title, category, description, severity, location, photoUrl } = req.body;

    if (!title || !category || !description || !location || !location.lat || !location.lng) {
      return res.status(400).json({ error: 'Title, category, description, and valid location are required' });
    }

    const result = await db.submitReport(
      {
        submitterId: actor.id,
        submitterName: actor.name,
        submitterEmail: db.getUserById(actor.id)?.email || 'citizen@civicsignal.org',
        title,
        category,
        description,
        severity: severity || 'medium',
        location,
        photoUrl: photoUrl || undefined,
      },
      actor
    );

    return res.json(result);
  } catch (err: any) {
    console.error('Error submitting report:', err);
    return res.status(500).json({ error: err.message || 'Failed to submit report' });
  }
});

// --- Managed Issues Routes ---
apiRouter.get('/managed-issues', (req: Request, res: Response) => {
  const { status, category, priority } = req.query;
  const issues = db.getManagedIssues({
    status: status as string,
    category: category as string,
    priority: priority as string,
  });
  return res.json({ issues });
});

apiRouter.get('/managed-issues/:id', (req: Request, res: Response) => {
  const issue = db.getManagedIssueById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  // Load all linked original citizen reports
  const linkedReports = issue.originalReportIds
    .map((id) => db.getReportById(id))
    .filter(Boolean);

  return res.json({ issue, linkedReports });
});

apiRouter.post('/managed-issues', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const { reportId, title, department } = req.body;
    if (!reportId) return res.status(400).json({ error: 'reportId is required' });

    const issue = db.createManagedIssueFromReport(reportId, title, department, actor);
    return res.json({ issue });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.patch('/managed-issues/:id', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const { updates, reason } = req.body;
    const issue = db.updateManagedIssue(req.params.id, updates || req.body, actor, reason);
    return res.json({ issue });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/managed-issues/:id/group', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const { reportId, reason } = req.body;
    if (!reportId) return res.status(400).json({ error: 'reportId is required' });

    const issue = db.groupReportIntoIssue(req.params.id, reportId, actor, reason || 'Staff confirmed duplicate incident');
    return res.json({ issue });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/managed-issues/:id/ungroup', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const { reportId, reason } = req.body;
    if (!reportId) return res.status(400).json({ error: 'reportId is required' });

    const issue = db.ungroupReportFromIssue(req.params.id, reportId, actor, reason || 'Staff split unrelated report');
    return res.json({ issue });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/managed-issues/:id/resolve', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const { resolutionNotes, resolutionPhotoUrl, actualDurationHours } = req.body;
    const issue = db.getManagedIssueById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const createdTime = new Date(issue.createdAt).getTime();
    const duration = actualDurationHours || Math.round(Math.max(1, (Date.now() - createdTime) / (3600 * 1000)));

    const updated = db.updateManagedIssue(
      req.params.id,
      {
        status: 'resolved',
        resolutionDetails: {
          resolutionNotes: resolutionNotes || 'Repair completed according to municipal specification.',
          resolutionPhotoUrl: resolutionPhotoUrl || undefined,
          resolvedAt: new Date().toISOString(),
          resolvedBy: actor.id,
          resolvedByName: actor.name,
          actualDurationHours: duration,
        },
      },
      actor,
      `Marked resolved with repair documentation: ${resolutionNotes || 'Repair complete'}`
    );

    return res.json({ issue: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/managed-issues/:id/notes', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Note text is required' });

    const issue = db.getManagedIssueById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (!issue.internalNotes) issue.internalNotes = [];
    issue.internalNotes.push({
      id: `note-${Date.now()}`,
      authorName: actor.name,
      authorRole: actor.role,
      text,
      timestamp: new Date().toISOString(),
    });

    db.updateManagedIssue(issue.id, { internalNotes: issue.internalNotes }, actor, 'Added internal note');
    return res.json({ issue });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// --- Duplicate Candidates Routes ---
apiRouter.get('/duplicates', (req: Request, res: Response) => {
  const { status } = req.query;
  const duplicates = db.getDuplicateCandidates(status as any);
  return res.json({ duplicates });
});

apiRouter.post('/duplicates/:id/review', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const { decision, reason, targetManagedIssueId } = req.body;
    if (!['approved', 'rejected', 'flagged_recurring'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision' });
    }

    const reviewed = db.reviewDuplicateCandidate(
      req.params.id,
      decision,
      actor,
      reason || `Decision: ${decision}`,
      targetManagedIssueId
    );
    return res.json({ candidate: reviewed });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// --- Recurring Issues Routes ---
apiRouter.get('/recurring', (req: Request, res: Response) => {
  const recurring = db.getRecurringIssues();
  return res.json({ recurring });
});

// --- Audit Logs Routes ---
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  return res.json({ logs: db.getAuditLogs(limit) });
});

// --- Settings & SLA Routes ---
apiRouter.get('/settings', (req: Request, res: Response) => {
  return res.json({
    settings: db.getSettings(),
    slaRules: db.getSlaRules(),
  });
});

apiRouter.patch('/settings', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const updated = db.updateSettings(req.body, actor);
    return res.json({ settings: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// --- Seed Reset Route ---
apiRouter.post('/seed/reset', (req: Request, res: Response) => {
  const actor = getActor(req);
  db.resetToSeed(actor);
  return res.json({ success: true, message: 'Demonstration data loaded successfully.' });
});

// --- Analytics Routes ---
apiRouter.get('/analytics', (req: Request, res: Response) => {
  return res.json({ analytics: db.getAnalyticsSummary() });
});

// --- AI Dispatch Intelligence ---
apiRouter.post('/ai/analyze-issue', async (req: Request, res: Response) => {
  const { title, category, description, severity, address } = req.body;
  const analysis = await generateIssueIntelligence(title, category, description, severity, address);
  return res.json({ analysis });
});

// --- Full Project ZIP Export Endpoint ---
apiRouter.get('/export-project', async (req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    const rootDir = process.cwd();

    function addDirToZip(currentDir: string, zipFolder: JSZip) {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        // Skip node_modules, dist, git, and hidden cache dirs
        if (
          item === 'node_modules' ||
          item === 'dist' ||
          item === '.git' ||
          item === '.turbo' ||
          item === '.vite'
        ) {
          continue;
        }

        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) addDirToZip(fullPath, subFolder);
        } else {
          // Read file and add to zip
          const fileContent = fs.readFileSync(fullPath);
          zipFolder.file(item, fileContent);
        }
      }
    }

    addDirToZip(rootDir, zip);

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="CivicSignal-Platform-Source.zip"');
    return res.send(buffer);
  } catch (err: any) {
    console.error('Error creating project zip:', err);
    return res.status(500).json({ error: 'Failed to generate project archive' });
  }
});
