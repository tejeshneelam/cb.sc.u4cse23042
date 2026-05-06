'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Card, CardContent, Chip, 
  CircularProgress, Box, Tabs, Tab
} from '@mui/material';
import axios from 'axios';

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

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/v1/notifications', {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || 'DUMMY') }
        });
        setNotifications(res.data.data.notifications || []);
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const sortedPriority = [...notifications].sort((a, b) => {
    if (TYPE_WEIGHT[a.Type] !== TYPE_WEIGHT[b.Type]) {
      return (TYPE_WEIGHT[b.Type] || 0) - (TYPE_WEIGHT[a.Type] || 0);
    }
    return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
  });

  const getChipColor = (type: string) => {
    if (type === 'Placement') return 'success';
    if (type === 'Result') return 'warning';
    return 'info';
  };

  const displayList = tabValue === 0 ? notifications : sortedPriority.slice(0, 10);

  return (
    <Container maxWidth="sm" sx={{ mt: 5, pb: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Notifications
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="All Notifications" />
          <Tab label="Priority Inbox" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {displayList.map(notif => (
            <Card key={notif.ID} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={notif.Type} 
                    color={getChipColor(notif.Type) as any} 
                    size="small" 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notif.Timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body1">{notif.Message}</Typography>
              </CardContent>
            </Card>
          ))}
          {displayList.length === 0 && (
            <Typography align="center" color="text.secondary">No notifications found.</Typography>
          )}
        </Box>
      )}
    </Container>
  );
}
