export interface NotificationRecord {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

export const demoNotifications: NotificationRecord[] = [
  { ID: 'demo-1', Type: 'Placement', Message: 'Affordmed Campus Hiring Drive - Registration Closing', Timestamp: '2026-05-06T21:00:00Z' },
  { ID: 'demo-2', Type: 'Placement', Message: 'Microsoft SWE Placement Drive - Pre-placement Talk', Timestamp: '2026-05-06T20:00:00Z' },
  { ID: 'demo-3', Type: 'Placement', Message: 'Google Intern Applications Open Now', Timestamp: '2026-05-06T18:00:00Z' },
  { ID: 'demo-4', Type: 'Placement', Message: 'CSX Corporation is hiring Full Stack Devs', Timestamp: '2026-05-06T17:51:18Z' },
  { ID: 'demo-5', Type: 'Placement', Message: 'Visa Inc. Internship Coding Round Selected Students', Timestamp: '2026-05-05T08:00:00Z' },
  { ID: 'demo-6', Type: 'Placement', Message: 'Amazon on-campus interview shortlist published', Timestamp: '2026-05-02T11:00:00Z' },
  { ID: 'demo-7', Type: 'Placement', Message: 'Infosys Springboard hiring assessment reminder', Timestamp: '2026-04-30T15:45:00Z' },
  { ID: 'demo-8', Type: 'Placement', Message: 'TCS Ninja aptitude slot booking is open', Timestamp: '2026-04-28T09:30:00Z' },
  { ID: 'demo-9', Type: 'Result', Message: 'B.Tech CSE Mid-Sem Results Announced', Timestamp: '2026-05-06T16:50:54Z' },
  { ID: 'demo-10', Type: 'Result', Message: 'Final grades available for Cloud Computing', Timestamp: '2026-05-05T12:00:00Z' },
  { ID: 'demo-11', Type: 'Result', Message: 'Re-evaluation results for Operating Systems are live', Timestamp: '2026-05-04T16:30:00Z' },
  { ID: 'demo-12', Type: 'Result', Message: 'Lab Internals marks updated on portal', Timestamp: '2026-05-03T13:00:00Z' },
  { ID: 'demo-13', Type: 'Result', Message: 'Capstone Project First Review Scores published', Timestamp: '2026-05-02T14:30:00Z' },
  { ID: 'demo-14', Type: 'Result', Message: 'Discrete Mathematics quiz result released', Timestamp: '2026-05-01T10:15:00Z' },
  { ID: 'demo-15', Type: 'Result', Message: 'Database lab practical marks finalized', Timestamp: '2026-04-29T18:20:00Z' },
  { ID: 'demo-16', Type: 'Result', Message: 'Communication skills assignment grades available', Timestamp: '2026-04-27T11:45:00Z' },
  { ID: 'demo-17', Type: 'Event', Message: 'Annual Farewell Party for 2026 Batch', Timestamp: '2026-05-06T10:00:00Z' },
  { ID: 'demo-18', Type: 'Event', Message: 'Guest Lecture by Global AI Expert', Timestamp: '2026-05-05T09:00:00Z' },
  { ID: 'demo-19', Type: 'Event', Message: 'Hackathon Registration Closing Tomorrow', Timestamp: '2026-05-04T14:00:00Z' },
  { ID: 'demo-20', Type: 'Event', Message: 'TedX Campus Event Volunteers Required', Timestamp: '2026-05-03T10:00:00Z' },
  { ID: 'demo-21', Type: 'Event', Message: 'Entrepreneurship cell product demo evening', Timestamp: '2026-05-01T17:30:00Z' },
  { ID: 'demo-22', Type: 'Event', Message: 'Sports meet team registrations close tonight', Timestamp: '2026-04-30T19:00:00Z' },
  { ID: 'demo-23', Type: 'Event', Message: 'Library orientation for final-year project research', Timestamp: '2026-04-29T08:45:00Z' },
  { ID: 'demo-24', Type: 'Event', Message: 'Cultural club auditions scheduled this week', Timestamp: '2026-04-27T16:10:00Z' }
];

export const expandSparseNotifications = (notifications: NotificationRecord[]) => (
  notifications.length >= 8 ? notifications : [...notifications, ...demoNotifications]
);

const VIEWED_NOTIFICATION_IDS_KEY = 'affordmed-viewed-notification-ids';

export const getViewedNotificationIds = () => {
  if (typeof window === 'undefined') return new Set<string>();

  try {
    const parsed = JSON.parse(localStorage.getItem(VIEWED_NOTIFICATION_IDS_KEY) || '[]');
    return new Set<string>(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set<string>();
  }
};

export const isNotificationViewed = (id: string) => getViewedNotificationIds().has(id);

export const markNotificationViewed = (id: string) => {
  if (typeof window === 'undefined') return;

  const viewedIds = getViewedNotificationIds();
  viewedIds.add(id);
  localStorage.setItem(VIEWED_NOTIFICATION_IDS_KEY, JSON.stringify([...viewedIds]));
};

export const markNotificationUnread = (id: string) => {
  if (typeof window === 'undefined') return;

  const viewedIds = getViewedNotificationIds();
  viewedIds.delete(id);
  localStorage.setItem(VIEWED_NOTIFICATION_IDS_KEY, JSON.stringify([...viewedIds]));
};
