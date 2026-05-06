import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { Logger } from 'logging_middleware';
const logger = new Logger('backend', 'handler');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3001;
const mockNotifications = [
    { ID: '1', Type: 'Placement', Message: 'CSX Corporation hiring', Timestamp: '2026-04-22 17:51:18', isRead: false },
    { ID: '2', Type: 'Event', Message: 'farewell', Timestamp: '2026-04-22 17:51:06', isRead: true },
    { ID: '3', Type: 'Result', Message: 'mid-sem', Timestamp: '2026-04-22 17:50:54', isRead: false }
];
app.get('/api/v1/notifications', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        const response = await axios.get('http://20.207.122.201/evaluation-service/notifications', {
            headers: { Authorization: auth || 'Bearer DUMMY' }
        });
        logger.info('Fetched notifications successfully');
        res.json({ success: true, data: { notifications: response.data.notifications } });
    }
    catch (err) {
        logger.error(`Failed to fetch from real API: ${err.message}`);
        res.json({ success: true, data: { notifications: mockNotifications }, _mock: true });
    }
});
app.listen(PORT, () => logger.info(`Backend running on http://localhost:${PORT}`));
