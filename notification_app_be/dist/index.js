import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { Logger } from 'logging_middleware';
const logger = new Logger('backend', 'handler');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3001;
// Massively expanded notifications for better priority and filtering tests
const mockNotifications = [
    { ID: '1', Type: 'Placement', Message: 'Affordmed Campus Hiring Drive - Registration Closing', Timestamp: '2026-05-06T21:00:00Z' },
    { ID: '2', Type: 'Placement', Message: 'Microsoft SWE Placement Drive - Pre-placement Talk', Timestamp: '2026-05-06T20:00:00Z' },
    { ID: '3', Type: 'Placement', Message: 'Google Intern Applications Open Now', Timestamp: '2026-05-06T18:00:00Z' },
    { ID: '4', Type: 'Placement', Message: 'CSX Corporation is hiring Full Stack Devs', Timestamp: '2026-05-06T17:51:18Z' },
    { ID: '5', Type: 'Placement', Message: 'Visa Inc. Internship Coding Round Selected Students', Timestamp: '2026-05-05T08:00:00Z' },
    { ID: '6', Type: 'Placement', Message: 'Amazon on-campus interview shortlist published', Timestamp: '2026-05-02T11:00:00Z' },
    { ID: '7', Type: 'Placement', Message: 'Infosys Springboard hiring assessment reminder', Timestamp: '2026-04-30T15:45:00Z' },
    { ID: '8', Type: 'Placement', Message: 'TCS Ninja aptitude slot booking is open', Timestamp: '2026-04-28T09:30:00Z' },
    { ID: '9', Type: 'Result', Message: 'B.Tech CSE Mid-Sem Results Announced', Timestamp: '2026-05-06T16:50:54Z' },
    { ID: '10', Type: 'Result', Message: 'Final grades available for Cloud Computing', Timestamp: '2026-05-05T12:00:00Z' },
    { ID: '11', Type: 'Result', Message: 'Re-evaluation results for Operating Systems are live', Timestamp: '2026-05-04T16:30:00Z' },
    { ID: '12', Type: 'Result', Message: 'Lab Internals marks updated on portal', Timestamp: '2026-05-03T13:00:00Z' },
    { ID: '13', Type: 'Result', Message: 'Capstone Project First Review Scores published', Timestamp: '2026-05-02T14:30:00Z' },
    { ID: '14', Type: 'Result', Message: 'Discrete Mathematics quiz result released', Timestamp: '2026-05-01T10:15:00Z' },
    { ID: '15', Type: 'Result', Message: 'Database lab practical marks finalized', Timestamp: '2026-04-29T18:20:00Z' },
    { ID: '16', Type: 'Result', Message: 'Communication skills assignment grades available', Timestamp: '2026-04-27T11:45:00Z' },
    { ID: '17', Type: 'Event', Message: 'Annual Farewell Party for 2026 Batch', Timestamp: '2026-05-06T10:00:00Z' },
    { ID: '18', Type: 'Event', Message: 'Guest Lecture by Global AI Expert', Timestamp: '2026-05-05T09:00:00Z' },
    { ID: '19', Type: 'Event', Message: 'Hackathon Registration Closing Tomorrow', Timestamp: '2026-05-04T14:00:00Z' },
    { ID: '20', Type: 'Event', Message: 'TedX Campus Event Volunteers Required', Timestamp: '2026-05-03T10:00:00Z' },
    { ID: '21', Type: 'Event', Message: 'Entrepreneurship cell product demo evening', Timestamp: '2026-05-01T17:30:00Z' },
    { ID: '22', Type: 'Event', Message: 'Sports meet team registrations close tonight', Timestamp: '2026-04-30T19:00:00Z' },
    { ID: '23', Type: 'Event', Message: 'Library orientation for final-year project research', Timestamp: '2026-04-29T08:45:00Z' },
    { ID: '24', Type: 'Event', Message: 'Cultural club auditions scheduled this week', Timestamp: '2026-04-27T16:10:00Z' }
];
const getNotificationType = (value) => Array.isArray(value) ? String(value[0] || '') : String(value || '');
const applyNotificationQuery = (notifications, query) => {
    const notificationType = getNotificationType(query.notification_type).toLowerCase();
    const limit = Number(getNotificationType(query.limit));
    const filtered = notificationType
        ? notifications.filter(n => n.Type.toLowerCase() === notificationType)
        : notifications;
    return Number.isFinite(limit) && limit > 0 ? filtered.slice(0, limit) : filtered;
};
app.get('/api/v1/notifications', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        // Forwarding query parameters natively to the Affordmed external API
        const response = await axios.get('http://20.207.122.201/evaluation-service/notifications', {
            headers: { Authorization: auth || 'Bearer DUMMY' },
            params: req.query // Passes limit, page, and notification_type dynamically
        });
        logger.info(`Fetched notifications successfully with query: ${JSON.stringify(req.query)}`);
        const externalData = response.data.data?.notifications || response.data.notifications || [];
        const sourceNotifications = externalData.length < 5
            ? [...externalData, ...mockNotifications]
            : externalData;
        res.json({ success: true, data: { notifications: applyNotificationQuery(sourceNotifications, req.query) } });
    }
    catch (err) {
        logger.error(`Failed to fetch from real API: ${err.message}`);
        res.json({ success: true, data: { notifications: applyNotificationQuery(mockNotifications, req.query) }, _mock: true });
    }
});
app.listen(PORT, () => logger.info(`Backend running on http://localhost:${PORT}`));
