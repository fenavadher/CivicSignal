import {
  CitizenReport,
  ManagedIssue,
  DuplicateCandidate,
  RecurringIssue,
  User,
  AuditLog,
  ApplicationSettings,
} from '../src/types.js';
import { calculatePriorityScore, DEFAULT_SCORING_WEIGHTS } from './priority.js';
import { calculateDeadlines, evaluateSlaStatus } from './sla.js';

export const SEED_USERS: User[] = [
  {
    id: 'user-citizen-1',
    email: 'citizen@civicsignal.org',
    name: 'Sarah Jenkins',
    role: 'citizen',
    department: 'Resident - Ward 4',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'user-staff-1',
    email: 'staff@civicsignal.org',
    name: 'Marcus Vance',
    role: 'staff',
    department: 'Public Works & Infrastructure',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'user-admin-1',
    email: 'admin@civicsignal.org',
    name: 'Elena Rostova',
    role: 'admin',
    department: 'Municipal Operations Bureau',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_SETTINGS: ApplicationSettings = {
  scoringWeights: DEFAULT_SCORING_WEIGHTS,
  duplicateDistanceThresholdMeters: 150,
  duplicateSimilarityThreshold: 0.35,
  recurringDistanceThresholdMeters: 120,
  recurringTimeWindowDays: 90,
  enableGeminiSemanticCheck: true,
};

export function createInitialSeedData(): {
  users: User[];
  reports: CitizenReport[];
  managedIssues: ManagedIssue[];
  duplicates: DuplicateCandidate[];
  recurring: RecurringIssue[];
  auditLogs: AuditLog[];
} {
  const now = Date.now();
  const dayMs = 24 * 3600 * 1000;
  const hourMs = 3600 * 1000;

  // Base coordinates: Metro Center (approx Seattle/Portland civic district)
  const baseLat = 47.6062;
  const baseLng = -122.3321;

  // 1. Group of 5 reports for the EXACT SAME POTHOLE at 4th & Main St
  const potholeReports: CitizenReport[] = [
    {
      id: 'rep-pot-1',
      submitterId: 'user-citizen-1',
      submitterName: 'Sarah Jenkins',
      submitterEmail: 'citizen@civicsignal.org',
      title: 'Deep axle-breaking pothole on 4th & Main',
      category: 'pothole_roads',
      description: 'Massive crater in the right lane heading north right at the 4th Avenue and Main Street intersection. Two cars already blew tires this morning.',
      severity: 'high',
      location: {
        lat: baseLat + 0.0012,
        lng: baseLng - 0.0008,
        address: '402 Main St, Downtown',
        landmark: 'Near City Central Cafe',
      },
      photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
      status: 'in_progress',
      managedIssueId: 'issue-main-pothole',
      isDemo: true,
      createdAt: new Date(now - 36 * hourMs).toISOString(),
      updatedAt: new Date(now - 12 * hourMs).toISOString(),
    },
    {
      id: 'rep-pot-2',
      submitterId: 'user-demo-2',
      submitterName: 'David Chen',
      submitterEmail: 'dchen@example.com',
      title: 'Dangerous road crater outside cafe on Main',
      category: 'pothole_roads',
      description: 'Pothole right in front of Central Cafe on Main St. Water collected inside it makes it hard to see at night. Highly dangerous for cyclists.',
      severity: 'high',
      location: {
        lat: baseLat + 0.00124,
        lng: baseLng - 0.00082,
        address: '410 Main St',
        landmark: 'Opposite Central Cafe',
      },
      photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      status: 'in_progress',
      managedIssueId: 'issue-main-pothole',
      isDemo: true,
      createdAt: new Date(now - 30 * hourMs).toISOString(),
      updatedAt: new Date(now - 12 * hourMs).toISOString(),
    },
    {
      id: 'rep-pot-3',
      submitterId: 'user-demo-3',
      submitterName: 'Priya Patel',
      submitterEmail: 'priya.p@example.com',
      title: '4th Ave & Main asphalt hole damaging rims',
      category: 'pothole_roads',
      description: 'Hit a deep hole on the roadway coming off 4th onto Main. Needs immediate asphalt patch before commute rush.',
      severity: 'medium',
      location: {
        lat: baseLat + 0.00118,
        lng: baseLng - 0.00078,
        address: 'Intersection 4th Ave & Main St',
        landmark: 'Traffic light post #14',
      },
      status: 'in_progress',
      managedIssueId: 'issue-main-pothole',
      isDemo: true,
      createdAt: new Date(now - 22 * hourMs).toISOString(),
      updatedAt: new Date(now - 12 * hourMs).toISOString(),
    },
    {
      id: 'rep-pot-4',
      submitterId: 'user-demo-4',
      submitterName: 'Robert Martinez',
      submitterEmail: 'robert.m@example.com',
      title: 'Sunken road pavement on Main St near 4th',
      category: 'pothole_roads',
      description: 'Road surface collapsed about 6 inches deep across 2 feet wide right by 402 Main St.',
      severity: 'high',
      location: {
        lat: baseLat + 0.00122,
        lng: baseLng - 0.00085,
        address: '404 Main St',
      },
      status: 'in_progress',
      managedIssueId: 'issue-main-pothole',
      isDemo: true,
      createdAt: new Date(now - 14 * hourMs).toISOString(),
      updatedAt: new Date(now - 12 * hourMs).toISOString(),
    },
    {
      id: 'rep-pot-5',
      submitterId: 'user-demo-5',
      submitterName: 'Amina Al-Mansoor',
      submitterEmail: 'amina.m@example.com',
      title: 'Pothole hazard on Northbound 4th at Main',
      category: 'pothole_roads',
      description: 'Just reported this because cars are swerving into oncoming bike lanes to dodge the huge hole right at 4th & Main.',
      severity: 'critical',
      location: {
        lat: baseLat + 0.00121,
        lng: baseLng - 0.00079,
        address: '4th & Main Corner',
      },
      status: 'submitted', // In duplicate queue for review!
      isDemo: true,
      createdAt: new Date(now - 2 * hourMs).toISOString(),
      updatedAt: new Date(now - 2 * hourMs).toISOString(),
    },
  ];

  // 2. Multiple reports of garbage in Elm St Alley
  const garbageReports: CitizenReport[] = [
    {
      id: 'rep-gar-1',
      submitterId: 'user-citizen-1',
      submitterName: 'Sarah Jenkins',
      submitterEmail: 'citizen@civicsignal.org',
      title: 'Overflowing commercial dumpsters blocking alleyway',
      category: 'garbage_accumulation',
      description: 'Piles of uncollected restaurant garbage bags and cardboard spilling out into Elm Alley. Attracting rodents and strong odor.',
      severity: 'medium',
      location: {
        lat: baseLat - 0.0025,
        lng: baseLng + 0.0031,
        address: '128 Elm St (Rear Alley)',
        landmark: 'Behind Market Arcade',
      },
      photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600',
      status: 'verified',
      managedIssueId: 'issue-elm-garbage',
      isDemo: true,
      createdAt: new Date(now - 18 * hourMs).toISOString(),
      updatedAt: new Date(now - 6 * hourMs).toISOString(),
    },
    {
      id: 'rep-gar-2',
      submitterId: 'user-demo-6',
      submitterName: 'Lucas Gray',
      submitterEmail: 'lgray@example.com',
      title: 'Illegal dumping and trash buildup on Elm Street rear',
      category: 'garbage_accumulation',
      description: 'Trash collection missed the entire alley behind 132 Elm. Piles of garbage blocking delivery truck access.',
      severity: 'medium',
      location: {
        lat: baseLat - 0.00245,
        lng: baseLng + 0.00315,
        address: '132 Elm St Rear Service Lane',
      },
      status: 'submitted', // Candidate for duplicate queue
      isDemo: true,
      createdAt: new Date(now - 4 * hourMs).toISOString(),
      updatedAt: new Date(now - 4 * hourMs).toISOString(),
    },
  ];

  // 3. Repeated streetlight complaints
  const streetlightReports: CitizenReport[] = [
    {
      id: 'rep-str-1',
      submitterId: 'user-demo-7',
      submitterName: 'Grace Hopper',
      submitterEmail: 'ghopper@example.com',
      title: 'Streetlights dark across entire block on Park Ave',
      category: 'broken_streetlights',
      description: 'Three consecutive street lamps are completely unlit from 7th to 8th on Park Ave. Very pitch black sidewalk near school crosswalk.',
      severity: 'high',
      location: {
        lat: baseLat + 0.0045,
        lng: baseLng + 0.0018,
        address: '750 Park Ave (Near Lincoln Middle School)',
        landmark: 'Pole numbers SL-881, SL-882, SL-883',
      },
      photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
      status: 'assigned',
      managedIssueId: 'issue-park-streetlights',
      isDemo: true,
      createdAt: new Date(now - 28 * hourMs).toISOString(),
      updatedAt: new Date(now - 8 * hourMs).toISOString(),
    },
    {
      id: 'rep-str-2',
      submitterId: 'user-citizen-1',
      submitterName: 'Sarah Jenkins',
      submitterEmail: 'citizen@civicsignal.org',
      title: 'Dark streetlight fixture buzzing at Park & 8th',
      category: 'broken_streetlights',
      description: 'Light fixture flickers then goes dark, making strange electrical hum near crosswalk.',
      severity: 'high',
      location: {
        lat: baseLat + 0.00455,
        lng: baseLng + 0.0019,
        address: '780 Park Ave',
      },
      status: 'submitted',
      isDemo: true,
      createdAt: new Date(now - 6 * hourMs).toISOString(),
      updatedAt: new Date(now - 6 * hourMs).toISOString(),
    },
  ];

  // 4. Recurring issue: Pothole on Oak St previously repaired 42 days ago!
  const recurringReport: CitizenReport = {
    id: 'rep-rec-1',
    submitterId: 'user-citizen-1',
    submitterName: 'Sarah Jenkins',
    submitterEmail: 'citizen@civicsignal.org',
    title: 'Pothole patch broke open again on 12th & Oak',
    category: 'pothole_roads',
    description: 'The cold asphalt patch applied last month has already washed out after rain. The exact same hole has returned and is now deeper.',
    severity: 'high',
    location: {
      lat: baseLat - 0.0038,
      lng: baseLng - 0.0042,
      address: '1205 Oak St, Historic District',
      landmark: 'Next to fire hydrant',
    },
    photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600',
    status: 'under_review',
    isDemo: true,
    createdAt: new Date(now - 10 * hourMs).toISOString(),
    updatedAt: new Date(now - 10 * hourMs).toISOString(),
  };

  // 5. Overdue High-Priority Issue: Major water pipe leak
  const overdueReport: CitizenReport = {
    id: 'rep-wat-1',
    submitterId: 'user-demo-8',
    submitterName: 'Tom Bradley',
    submitterEmail: 'tbradley@example.com',
    title: 'Water main fracture bubbling through sidewalk on Central Blvd',
    category: 'water_infrastructure',
    description: 'Continuous stream of clean water gushing from under the curb. Road foundation eroding, pooling into bike lane.',
    severity: 'critical',
    location: {
      lat: baseLat + 0.0005,
      lng: baseLng + 0.0022,
      address: '220 Central Blvd (Near General Hospital)',
      landmark: 'Hospital transit stop',
    },
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=600',
    status: 'in_progress',
    managedIssueId: 'issue-central-water',
    isDemo: true,
    createdAt: new Date(now - 32 * hourMs).toISOString(),
    updatedAt: new Date(now - 5 * hourMs).toISOString(),
  };

  // 6. Distinct unrelated reports (should NOT merge!)
  const unrelatedReports: CitizenReport[] = [
    {
      id: 'rep-unrel-1',
      submitterId: 'user-demo-9',
      submitterName: 'Chloe Bennett',
      submitterEmail: 'chloe.b@example.com',
      title: 'Broken tree branch dangling over pedestrian path on West Pine',
      category: 'other',
      description: 'Heavy oak limb cracked in windstorm, hanging low over pathway. Needs tree trimming crew.',
      severity: 'medium',
      location: {
        lat: baseLat + 0.0085,
        lng: baseLng - 0.0092,
        address: '890 West Pine St',
        landmark: 'Pine Park Entrance',
      },
      status: 'verified',
      managedIssueId: 'issue-pine-branch',
      isDemo: true,
      createdAt: new Date(now - 15 * hourMs).toISOString(),
      updatedAt: new Date(now - 15 * hourMs).toISOString(),
    },
    {
      id: 'rep-unrel-2',
      submitterId: 'user-demo-10',
      submitterName: 'Victor Ramos',
      submitterEmail: 'vramos@example.com',
      title: 'Displaced concrete slab tripping hazard',
      category: 'damaged_sidewalks',
      description: 'Tree root pushed sidewalk panel up by 3 inches. Wheelchair access blocked.',
      severity: 'low',
      location: {
        lat: baseLat - 0.0062,
        lng: baseLng + 0.0055,
        address: '1540 South Bay Way',
      },
      status: 'submitted',
      isDemo: true,
      createdAt: new Date(now - 8 * hourMs).toISOString(),
      updatedAt: new Date(now - 8 * hourMs).toISOString(),
    },
  ];

  // 7. Resolved historical issue on Oak St (for recurring detection)
  const pastResolvedIssue: ManagedIssue = {
    id: 'issue-hist-oak-1',
    title: 'Pothole repair at 1205 Oak St',
    category: 'pothole_roads',
    description: 'Road surface hole repaired with temporary asphalt mix.',
    location: {
      lat: baseLat - 0.00378,
      lng: baseLng - 0.00418,
      address: '1205 Oak St, Historic District',
    },
    severity: 'medium',
    priorityScore: 52,
    priorityLevel: 'medium',
    scoreBreakdown: {
      baseSeverity: 50,
      timeOpenFactor: 40,
      relatedReportsFactor: 20,
      locationFactor: 30,
      recurringFactor: 0,
      slaOverdueFactor: 0,
      explanation: 'Historical resolved work order',
    },
    originalReportIds: ['rep-hist-1'],
    primaryReportId: 'rep-hist-1',
    assignedTo: 'user-staff-1',
    assignedToName: 'Marcus Vance',
    department: 'Public Works - Roadway Maintenance',
    status: 'resolved',
    responseDeadline: new Date(now - 45 * dayMs + 4 * hourMs).toISOString(),
    resolutionDeadline: new Date(now - 45 * dayMs + 24 * hourMs).toISOString(),
    isOverdueResponse: false,
    isOverdueResolution: false,
    resolutionDetails: {
      resolutionNotes: 'Filled with standard cold patch asphalt compaction. Level with grade.',
      resolvedAt: new Date(now - 42 * dayMs).toISOString(),
      resolvedBy: 'user-staff-1',
      resolvedByName: 'Marcus Vance',
      actualDurationHours: 18.5,
    },
    isRecurring: false,
    recurrenceCount: 0,
    isDemo: true,
    createdAt: new Date(now - 45 * dayMs).toISOString(),
    updatedAt: new Date(now - 42 * dayMs).toISOString(),
  };

  // Compile all reports
  const allReports = [
    ...potholeReports,
    ...garbageReports,
    ...streetlightReports,
    recurringReport,
    overdueReport,
    ...unrelatedReports,
  ];

  // Managed Issues:
  // Issue 1: Main St Pothole (Groups 4 confirmed reports rep-pot-1 to rep-pot-4)
  const potDeadline = calculateDeadlines('pothole_roads', 'high', new Date(now - 36 * hourMs).toISOString());
  const potPriority = calculatePriorityScore(
    'high',
    new Date(now - 36 * hourMs).toISOString(),
    4,
    false,
    false,
    '402 Main St, Downtown'
  );

  const managedIssuePothole: ManagedIssue = {
    id: 'issue-main-pothole',
    title: 'Severe Roadway Pothole Cluster on 4th & Main',
    category: 'pothole_roads',
    description: 'Multiple citizen reports confirm deep asphalt crater on right lane northbound at 4th & Main. Vehicle rim damage reported.',
    location: {
      lat: baseLat + 0.0012,
      lng: baseLng - 0.0008,
      address: '402 Main St & 4th Ave, Downtown',
      landmark: 'Near City Central Cafe',
    },
    severity: 'high',
    priorityScore: potPriority.score,
    priorityLevel: potPriority.level,
    scoreBreakdown: potPriority.breakdown,
    originalReportIds: ['rep-pot-1', 'rep-pot-2', 'rep-pot-3', 'rep-pot-4'],
    primaryReportId: 'rep-pot-1',
    assignedTo: 'user-staff-1',
    assignedToName: 'Marcus Vance',
    department: 'Public Works - Roadway Maintenance',
    status: 'in_progress',
    responseDeadline: potDeadline.responseDeadline,
    resolutionDeadline: potDeadline.resolutionDeadline,
    isOverdueResponse: false,
    isOverdueResolution: false,
    internalNotes: [
      {
        id: 'note-1',
        authorName: 'Marcus Vance',
        authorRole: 'staff',
        text: 'Grouped 4 identical reports. Crew #4 scheduled for hot asphalt pour at 14:00 today.',
        timestamp: new Date(now - 12 * hourMs).toISOString(),
      },
    ],
    isRecurring: false,
    recurrenceCount: 0,
    isDemo: true,
    createdAt: new Date(now - 36 * hourMs).toISOString(),
    updatedAt: new Date(now - 12 * hourMs).toISOString(),
  };

  // Issue 2: Central Blvd Water Main (CRITICAL OVERDUE)
  const waterDeadline = calculateDeadlines('water_infrastructure', 'critical', new Date(now - 32 * hourMs).toISOString());
  const waterSla = evaluateSlaStatus('in_progress', waterDeadline.responseDeadline, waterDeadline.resolutionDeadline);
  const waterPriority = calculatePriorityScore(
    'critical',
    new Date(now - 32 * hourMs).toISOString(),
    1,
    false,
    true, // Overdue!
    '220 Central Blvd (Near General Hospital)'
  );

  const managedIssueWater: ManagedIssue = {
    id: 'issue-central-water',
    title: 'Critical Water Main Fracture near General Hospital',
    category: 'water_infrastructure',
    description: 'Continuous pressurized water escaping beneath curb on Central Blvd. Approaching foundation of hospital access route.',
    location: {
      lat: baseLat + 0.0005,
      lng: baseLng + 0.0022,
      address: '220 Central Blvd (Near General Hospital)',
      landmark: 'Hospital transit stop',
    },
    severity: 'critical',
    priorityScore: waterPriority.score,
    priorityLevel: waterPriority.level,
    scoreBreakdown: waterPriority.breakdown,
    originalReportIds: ['rep-wat-1'],
    primaryReportId: 'rep-wat-1',
    assignedTo: 'user-staff-1',
    assignedToName: 'Marcus Vance',
    department: 'Water & Sewer Authority',
    status: 'in_progress',
    responseDeadline: waterDeadline.responseDeadline,
    resolutionDeadline: waterDeadline.resolutionDeadline,
    isOverdueResponse: waterSla.isOverdueResponse,
    isOverdueResolution: true, // Specifically overdue for demo
    internalNotes: [
      {
        id: 'note-2',
        authorName: 'Marcus Vance',
        authorRole: 'staff',
        text: 'Valve isolation team dispatched. Awaiting high-capacity suction pump to locate subterranean break.',
        timestamp: new Date(now - 4 * hourMs).toISOString(),
      },
    ],
    isRecurring: false,
    recurrenceCount: 0,
    isDemo: true,
    createdAt: new Date(now - 32 * hourMs).toISOString(),
    updatedAt: new Date(now - 5 * hourMs).toISOString(),
  };

  // Issue 3: Elm Street Garbage
  const garDeadline = calculateDeadlines('garbage_accumulation', 'medium', new Date(now - 18 * hourMs).toISOString());
  const garPriority = calculatePriorityScore('medium', new Date(now - 18 * hourMs).toISOString(), 1, false, false, '128 Elm St (Rear Alley)');

  const managedIssueGarbage: ManagedIssue = {
    id: 'issue-elm-garbage',
    title: 'Commercial Waste Alley Overflow on Elm St',
    category: 'garbage_accumulation',
    description: 'Blocked alleyway from uncollected commercial bins behind Market Arcade.',
    location: {
      lat: baseLat - 0.0025,
      lng: baseLng + 0.0031,
      address: '128 Elm St (Rear Alley)',
      landmark: 'Behind Market Arcade',
    },
    severity: 'medium',
    priorityScore: garPriority.score,
    priorityLevel: garPriority.level,
    scoreBreakdown: garPriority.breakdown,
    originalReportIds: ['rep-gar-1'],
    primaryReportId: 'rep-gar-1',
    department: 'Department of Sanitation',
    status: 'verified',
    responseDeadline: garDeadline.responseDeadline,
    resolutionDeadline: garDeadline.resolutionDeadline,
    isOverdueResponse: false,
    isOverdueResolution: false,
    isRecurring: false,
    recurrenceCount: 0,
    isDemo: true,
    createdAt: new Date(now - 18 * hourMs).toISOString(),
    updatedAt: new Date(now - 6 * hourMs).toISOString(),
  };

  // Issue 4: Park Ave Streetlights
  const strDeadline = calculateDeadlines('broken_streetlights', 'high', new Date(now - 28 * hourMs).toISOString());
  const strPriority = calculatePriorityScore('high', new Date(now - 28 * hourMs).toISOString(), 1, false, false, '750 Park Ave (Near Lincoln Middle School)');

  const managedIssueStreetlights: ManagedIssue = {
    id: 'issue-park-streetlights',
    title: 'Multi-pole Streetlight Outage on Park Ave School Corridor',
    category: 'broken_streetlights',
    description: 'Three unlit luminaires creating blackout zone on school crosswalk.',
    location: {
      lat: baseLat + 0.0045,
      lng: baseLng + 0.0018,
      address: '750 Park Ave (Near Lincoln Middle School)',
      landmark: 'Pole numbers SL-881, SL-882, SL-883',
    },
    severity: 'high',
    priorityScore: strPriority.score,
    priorityLevel: strPriority.level,
    scoreBreakdown: strPriority.breakdown,
    originalReportIds: ['rep-str-1'],
    primaryReportId: 'rep-str-1',
    assignedTo: 'user-staff-1',
    assignedToName: 'Marcus Vance',
    department: 'Public Utilities - Electrical & Lighting',
    status: 'assigned',
    responseDeadline: strDeadline.responseDeadline,
    resolutionDeadline: strDeadline.resolutionDeadline,
    isOverdueResponse: false,
    isOverdueResolution: false,
    isRecurring: false,
    recurrenceCount: 0,
    isDemo: true,
    createdAt: new Date(now - 28 * hourMs).toISOString(),
    updatedAt: new Date(now - 8 * hourMs).toISOString(),
  };

  const managedIssues = [
    managedIssuePothole,
    managedIssueWater,
    managedIssueGarbage,
    managedIssueStreetlights,
    pastResolvedIssue,
  ];

  // Duplicate candidates pending review in the queue!
  const duplicateCandidates: DuplicateCandidate[] = [
    {
      id: 'dup-cand-1',
      primaryReportId: 'rep-pot-1',
      candidateReportId: 'rep-pot-5', // 5th pothole report
      primaryReport: potholeReports[0],
      candidateReport: potholeReports[4],
      distanceMeters: 22,
      textSimilarity: 0.62,
      categoryCompatibility: true,
      compositeScore: 94,
      isAiAssisted: true,
      aiExplanation: 'Geographic separation is only 22m at 4th & Main. Both submissions report the same hazardous pothole forcing traffic into oncoming lanes. Recommended action: Approve duplicate grouping into active Managed Issue.',
      recommendedAction: 'likely_duplicate',
      status: 'pending',
      createdAt: new Date(now - 2 * hourMs).toISOString(),
    },
    {
      id: 'dup-cand-2',
      primaryReportId: 'rep-gar-1',
      candidateReportId: 'rep-gar-2', // 2nd garbage report
      primaryReport: garbageReports[0],
      candidateReport: garbageReports[1],
      distanceMeters: 14,
      textSimilarity: 0.54,
      categoryCompatibility: true,
      compositeScore: 88,
      isAiAssisted: true,
      aiExplanation: 'Immediate physical proximity (14 meters) along the Elm Street rear service corridor. Both describe uncollected commercial waste spilling into the alleyway.',
      recommendedAction: 'likely_duplicate',
      status: 'pending',
      createdAt: new Date(now - 4 * hourMs).toISOString(),
    },
    {
      id: 'dup-cand-3',
      primaryReportId: 'rep-str-1',
      candidateReportId: 'rep-str-2', // 2nd streetlight report
      primaryReport: streetlightReports[0],
      candidateReport: streetlightReports[1],
      distanceMeters: 38,
      textSimilarity: 0.48,
      categoryCompatibility: true,
      compositeScore: 78,
      isAiAssisted: true,
      aiExplanation: 'Both reports address the darkened Park Ave segment near 8th. The second report specifically notes a buzzing ballast on fixture SL-883.',
      recommendedAction: 'human_review',
      status: 'pending',
      createdAt: new Date(now - 6 * hourMs).toISOString(),
    },
  ];

  // Recurring issue detection records
  const recurringIssues: RecurringIssue[] = [
    {
      id: 'rec-1',
      currentReportId: 'rep-rec-1',
      currentReport: recurringReport,
      previousIssueId: 'issue-hist-oak-1',
      previousIssue: pastResolvedIssue,
      distanceMeters: 8,
      previousResolvedAt: pastResolvedIssue.resolutionDetails!.resolvedAt,
      daysSinceResolved: 42,
      recurrenceCount: 2,
      status: 'detected',
      notes: 'Repeat asphalt breakout at 1205 Oak St within 42 days of cold patch resolution. Recommend full sub-base excavation rather than temporary patch.',
      createdAt: new Date(now - 10 * hourMs).toISOString(),
    },
  ];

  // Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: 'audit-1',
      timestamp: new Date(now - 36 * hourMs).toISOString(),
      actorId: 'user-citizen-1',
      actorName: 'Sarah Jenkins',
      actorRole: 'citizen',
      action: 'SUBMIT_REPORT',
      entityType: 'report',
      entityId: 'rep-pot-1',
      details: 'Submitted new civic report "Deep axle-breaking pothole on 4th & Main"',
    },
    {
      id: 'audit-2',
      timestamp: new Date(now - 24 * hourMs).toISOString(),
      actorId: 'user-staff-1',
      actorName: 'Marcus Vance',
      actorRole: 'staff',
      action: 'APPROVE_DUPLICATE_GROUPING',
      entityType: 'managed_issue',
      entityId: 'issue-main-pothole',
      details: 'Approved grouping report rep-pot-2 into Managed Issue issue-main-pothole',
      reason: 'Confirmed identical road crater location via coordinate check and photo verification.',
    },
    {
      id: 'audit-3',
      timestamp: new Date(now - 12 * hourMs).toISOString(),
      actorId: 'user-staff-1',
      actorName: 'Marcus Vance',
      actorRole: 'staff',
      action: 'CHANGE_STATUS',
      entityType: 'managed_issue',
      entityId: 'issue-main-pothole',
      details: 'Updated status from VERIFIED to IN_PROGRESS. Dispatched Crew #4.',
    },
    {
      id: 'audit-4',
      timestamp: new Date(now - 10 * hourMs).toISOString(),
      actorId: 'system',
      actorName: 'CivicSignal Recurring Engine',
      actorRole: 'admin',
      action: 'FLAG_RECURRING',
      entityType: 'managed_issue',
      entityId: 'rep-rec-1',
      details: 'Detected recurring incident within 8 meters of resolved issue issue-hist-oak-1 (resolved 42 days ago)',
    },
    {
      id: 'audit-5',
      timestamp: new Date(now - 1 * hourMs).toISOString(),
      actorId: 'user-admin-1',
      actorName: 'Elena Rostova',
      actorRole: 'admin',
      action: 'SEED_DEMO_DATA',
      entityType: 'system',
      entityId: 'system',
      details: 'Loaded standard municipal demonstration dataset for verification and QA testing',
    },
  ];

  return {
    users: SEED_USERS,
    reports: allReports,
    managedIssues,
    duplicates: duplicateCandidates,
    recurring: recurringIssues,
    auditLogs,
  };
}
