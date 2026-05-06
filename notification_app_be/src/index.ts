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
    { ID: '1', Type: 'Placement', Message: 'CSX Corporation hiring', Timestamp: '2026-04-22 17:51:18' },
    { ID: '2', Type: 'Event', Message: 'farewell', Timestamp: '2026-04-22 17:51:06' },
    { ID: '3', Type: 'Result', Message: 'mid-sem', Timestamp: '2026-04-22 17:50:54' },
    { ID: '4', Type: 'Placement', Message: 'Google intern', Timestamp: '2026-04-23 10:00:00' },
    { ID: '5', Type: 'Result', Message: 'Final grades', Timestamp: '2026-04-24 12:00:00' }
];

app.get('/api/v1/notifications', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        
        // Forwarding query parameters natively to the Affordmed external API
        const response = await axios.get('http://20.207.122.201/evaluation-service/notifications', {
            headers: { Authorization: auth || 'Bearer DUMMY' },
            params: req.query // Passes limit, page, and notification_type dynamically
        });
        
        logger.info(`Fetched notifications successfully with query: ${JSON.stringify(req.query)}`);
        res.json({ success: true, data: { notifications: response.data.notifications } });
    } catch (err: any) {
        logger.error(`Failed to fetch from real API: ${err.message}`);
        
        // Mock fallback logic 
        let filteredMock = [...mockNotifications];
        if (req.query.notification_type) {
            filteredMock = filteredMock.filter(n => n.Type.toLowerCase() === (req.query.notification_type as string).toLowerCase());
        }
        
        res.json({ success: true, data: { notifications: filteredMock }, _mock: true });
    }
});

app.listen(PORT, () => logger.info(`Backend running on http://localhost:${PORT}`));
