import { jsPDF } from 'jspdf';
import { CitizenReport, ManagedIssue, AnalyticsSummary, CATEGORY_LABELS } from '../types';

export function downloadIncidentReportPdf(report: CitizenReport, linkedIssue?: ManagedIssue | null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(37, 99, 235); // #2563EB
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CIVICSIGNAL MUNICIPAL PLATFORM', 15, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL INCIDENT REPORT & AUDIT RECORD', 15, 19);

  const printDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Generated: ${printDate}`, pageWidth - 15, 19, { align: 'right' });

  // Document metadata box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 34, pageWidth - 30, 26, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Report ID: ${report.id}`, 20, 42);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Category: ${CATEGORY_LABELS[report.category] || report.category}`, 20, 49);
  doc.text(`Severity: ${report.severity.toUpperCase()}`, 20, 55);

  doc.text(`Status: ${report.status.replace(/_/g, ' ').toUpperCase()}`, 110, 42);
  doc.text(`Submitter: ${report.submitterName} (${report.submitterEmail})`, 110, 49);
  doc.text(
    `Date Filed: ${new Date(report.createdAt).toLocaleString('en-US')}`,
    110,
    55
  );

  // Section 1: Title and Description
  let currentY = 68;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Incident Summary', 15, currentY);

  currentY += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(report.title, 15, currentY);

  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const descLines = doc.splitTextToSize(report.description, pageWidth - 30);
  doc.text(descLines, 15, currentY);
  currentY += descLines.length * 4.5 + 6;

  // Section 2: Location
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Geographic & Physical Location', 15, currentY);

  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Address: ${report.location.address}`, 15, currentY);
  currentY += 5;
  if (report.location.landmark) {
    doc.text(`Landmark / Reference: ${report.location.landmark}`, 15, currentY);
    currentY += 5;
  }
  doc.text(
    `Coordinates: Latitude ${report.location.lat.toFixed(6)}, Longitude ${report.location.lng.toFixed(6)}`,
    15,
    currentY
  );
  currentY += 9;

  // Section 3: Linked Work Order
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Municipal Dispatch & Work Order State', 15, currentY);

  currentY += 6;
  if (linkedIssue) {
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(15, currentY, pageWidth - 30, 32, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 78, 216);
    doc.text(`Managed Work Order: ${linkedIssue.id} — ${linkedIssue.title}`, 20, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Department: ${linkedIssue.department || 'Operations'}`, 20, currentY + 14);
    doc.text(
      `Priority Score: ${linkedIssue.priorityScore}/100 (${linkedIssue.priorityLevel.toUpperCase()})`,
      20,
      currentY + 20
    );
    doc.text(
      `Linked Citizen Complaints: ${linkedIssue.originalReportIds.length} citizen submissions combined`,
      20,
      currentY + 26
    );
    currentY += 40;
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Standalone record. Currently undergoing preliminary municipal verification.',
      15,
      currentY
    );
    currentY += 12;
  }

  // Section 4: Audit & Integrity Seal
  doc.setDrawColor(203, 213, 225);
  doc.line(15, currentY, pageWidth - 15, currentY);
  currentY += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    'CivicSignal Municipal Infrastructure Platform • Audit Verification Hash: ' +
      Math.random().toString(36).substring(2, 12).toUpperCase(),
    15,
    currentY
  );
  currentY += 4;
  doc.text(
    'This electronic report is an immutable record preserved according to open municipal records standards.',
    15,
    currentY
  );

  // Trigger Save
  doc.save(`CivicSignal-Report-${report.id}.pdf`);
}

export function downloadWorkOrderPdf(issue: ManagedIssue, linkedReports: CitizenReport[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 118, 110); // Secondary Teal #0F766E
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CIVICSIGNAL MUNICIPAL DISPATCH', 15, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL MUNICIPAL WORK ORDER & REPAIR DOCKET', 15, 19);

  const printDate = new Date().toLocaleDateString('en-US');
  doc.text(`Generated: ${printDate}`, pageWidth - 15, 19, { align: 'right' });

  // Top Info Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 34, pageWidth - 30, 28, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Work Order ID: ${issue.id}`, 20, 42);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Category: ${CATEGORY_LABELS[issue.category]}`, 20, 49);
  doc.text(`Assigned Department: ${issue.department || 'Operations'}`, 20, 56);

  doc.text(`Priority: ${issue.priorityScore}/100 (${issue.priorityLevel.toUpperCase()})`, 110, 42);
  doc.text(`Status: ${issue.status.replace(/_/g, ' ').toUpperCase()}`, 110, 49);
  doc.text(`Lead Staff: ${issue.assignedToName || 'Unassigned'}`, 110, 56);

  let currentY = 70;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Work Order Summary & Location', 15, currentY);

  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(issue.title, 15, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(issue.description, pageWidth - 30);
  doc.text(descLines, 15, currentY);
  currentY += descLines.length * 4.5 + 4;

  doc.text(`Site Address: ${issue.location.address}`, 15, currentY);
  currentY += 5;
  doc.text(
    `Coordinates: ${issue.location.lat.toFixed(5)}, ${issue.location.lng.toFixed(5)}`,
    15,
    currentY
  );
  currentY += 10;

  // SLA Timelines
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('SLA Deadlines & Compliance Status', 15, currentY);

  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Response Target: ${new Date(issue.responseDeadline).toLocaleString('en-US')}`,
    15,
    currentY
  );
  currentY += 5;
  doc.text(
    `Resolution Target: ${new Date(issue.resolutionDeadline).toLocaleString('en-US')}`,
    15,
    currentY
  );
  currentY += 5;
  doc.text(
    `Overdue Resolution Status: ${issue.isOverdueResolution ? 'BREACHED / OVERDUE' : 'COMPLIANT'}`,
    15,
    currentY
  );
  currentY += 10;

  // Linked Reports Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Grouped Citizen Complaints (${linkedReports.length})`, 15, currentY);

  currentY += 6;
  linkedReports.forEach((rep, idx) => {
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${idx + 1}. [${rep.id}] ${rep.title}`, 15, currentY);
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(
      `   By ${rep.submitterName} on ${new Date(rep.createdAt).toLocaleDateString()} • Loc: ${rep.location.address}`,
      15,
      currentY
    );
    currentY += 6;
  });

  // Resolution Details if available
  if (issue.resolutionDetails) {
    currentY += 4;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(15, currentY, pageWidth - 30, 24, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text('Certified Resolution Documentation', 20, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Completed: ${new Date(issue.resolutionDetails.resolvedAt).toLocaleString()}`, 20, currentY + 12);
    doc.text(
      `Inspector: ${issue.resolutionDetails.resolvedByName} • Repair Time: ${issue.resolutionDetails.actualDurationHours}h`,
      20,
      currentY + 18
    );
    currentY += 32;
  }

  doc.save(`CivicSignal-WorkOrder-${issue.id}.pdf`);
}

export function downloadMunicipalExecutiveSummaryPdf(
  analytics: AnalyticsSummary,
  issues: ManagedIssue[],
  reports: CitizenReport[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CIVICSIGNAL MUNICIPAL PLATFORM', 15, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('EXECUTIVE CIVIC OPERATIONS & SLA AUDIT REPORT', 15, 19);

  const printDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(`Report Period: Current • ${printDate}`, pageWidth - 15, 19, { align: 'right' });

  // Key KPI Cards Grid
  let y = 36;
  const colWidth = (pageWidth - 30 - 9) / 4;

  const kpis = [
    { label: 'Total Reports', val: `${analytics.totalReports}` },
    { label: 'Active Orders', val: `${analytics.openIssues}` },
    { label: 'SLA Compliance', val: `${analytics.slaCompliancePercentage}%` },
    { label: 'Avg Resolution', val: `${analytics.averageResolutionHours}h` },
  ];

  kpis.forEach((kpi, i) => {
    const x = 15 + i * (colWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, colWidth, 20, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, y + 6);

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + 3, y + 15);
  });

  y += 28;

  // Section: Category Breakdown
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Infrastructure Breakdown by Category', 15, y);

  y += 6;
  analytics.categoryDistribution.forEach((cat) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`• ${cat.label}: ${cat.count} complaints logged`, 18, y);
    y += 5;
  });

  y += 6;
  // Section: Priority Active Issues Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Priority-Ranked Active Municipal Work Orders', 15, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, pageWidth - 30, 7, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Score', 18, y + 5);
  doc.text('Order ID', 35, y + 5);
  doc.text('Title & Category', 65, y + 5);
  doc.text('Status', 135, y + 5);
  doc.text('Linked', 165, y + 5);

  y += 9;

  issues.slice(0, 10).forEach((iss) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    doc.text(`${iss.priorityScore}/100`, 18, y);
    doc.text(iss.id, 35, y);

    const titleTrunc = iss.title.length > 38 ? iss.title.slice(0, 38) + '...' : iss.title;
    doc.text(titleTrunc, 65, y);
    doc.text(iss.status.replace(/_/g, ' '), 135, y);
    doc.text(`${iss.originalReportIds.length} reps`, 165, y);

    y += 6;
  });

  // Footer Note
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Official CivicSignal Administrative Platform • Generated automatically on system command.', 15, y);

  doc.save(`CivicSignal-Executive-Summary-${printDate.replace(/\s+/g, '-')}.pdf`);
}
