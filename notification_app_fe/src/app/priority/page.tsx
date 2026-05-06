'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Card, CardContent, Chip, 
  CircularProgress, Box, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import axios from 'axios';
import { Logger } from '../../Logger';

const logger = new Logger('frontend', 'priority_inbox');

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

const TYPE_WEIGHT: Record<string, number> = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};

export default function PriorityInbox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState<number>(10);

  const fetchPriorityNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/v1/notifications', {
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || 'DUMMY') },
      });
      // Sort logic natively mimicking Stage 6 requirements
      const fetched = res.data.data.notifications || [];
      fetched.sort((a: Notification, b: Notification) => {
        if (TYPE_WEIGHT[a.Type] !== TYPE_WEIGHT[b.Type]) {
          return (TYPE_WEIGHT[b.Type] || 0) - (TYPE_WEIGHT[a.Type] || 0);
        }
        return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
      });
      
      setNotifications(fetched);
      logger.info(`Fetched and sorted Priority Notifications`);
    } catch (error: any) {
      logger.error(`Failed to load priority notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorityNotifications();
  }, []);

  const getChipColor = (type: string) => {
    if (type === 'Placement') return 'success';
    if (type === 'Result') return 'warning';
    return 'info';
  };

  const displayList = notifications.slice(0, limit);

  return (
    <Container maxWidth="md" sx={{ mt: 5, pb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Priority Inbox
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Limit Items</InputLabel>
          <Select
            value={limit}
            label="Limit Items"
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <MenuItem value={5}>Top 5</MenuItem>
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
            <MenuItem value={20}>Top 20</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Displaying top {limit} important notifications based on type weight and recency.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {displayList.map(notif => (
            <Card key={notif.ID} variant="outlined" sx={{ borderRadius: 2, borderLeft: '6px solid', borderColor: getChipColor(notif.Type) + '.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={notif.Type + ' Priority'} 
                    color={getChipColor(notif.Type) as any} 
                    size="small" 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notif.Timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {notif.Message}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {displayList.length === 0 && (
             <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>No priority queue found.</Box>
          )}
        </Box>
      )}
    </Container>
  );
}
