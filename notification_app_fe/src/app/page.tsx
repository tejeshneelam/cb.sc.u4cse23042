'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Card, CardContent, Chip, 
  CircularProgress, Box, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import axios from 'axios';
import { Logger } from '../Logger';

const logger = new Logger('frontend', 'all_notifications');

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
  isRead?: boolean; // We add this locally to signify view status
}

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType) params.notification_type = filterType;

      const res = await axios.get('http://localhost:3001/api/v1/notifications', {
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || 'DUMMY') },
        params: params
      });
      // Attach local 'isRead = false' default indicator mapped over results
      const mapped = (res.data.data.notifications || []).map((n: Notification) => ({
        ...n,
        isRead: false
      }));
      setNotifications(mapped);
      logger.info(`Fetched all notifications with filter: ${filterType}`);
    } catch (error: any) {
      logger.error(`Failed to load notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterType]);

  const markAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications(prev => prev.map(n => n.ID === id ? { ...n, isRead: true } : n));
    logger.info(`Triggered mark-as-read manually for Notification ID: ${id}`);
  };

  const getChipColor = (type: string) => {
    if (type === 'Placement') return 'success';
    if (type === 'Result') return 'warning';
    return 'info';
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, pb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          All Notifications
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter Type</InputLabel>
          <Select
            value={filterType}
            label="Filter Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value=""><em>All Types</em></MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications.map(notif => (
            <Card 
              key={notif.ID} 
              variant="outlined" 
              onClick={(e) => markAsRead(notif.ID, e)}
              sx={{ 
                borderRadius: 2, 
                cursor: 'pointer',
                backgroundColor: notif.isRead ? '#ffffff' : '#f0f7ff',
                borderColor: notif.isRead ? 'divider' : 'primary.main',
                transition: '0.2s',
                '&:hover': {
                  boxShadow: 2
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={notif.Type} color={getChipColor(notif.Type) as any} size="small" />
                    {!notif.isRead && (
                      <Chip label="NEW" color="error" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notif.Timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: notif.isRead ? 'normal' : 500, color: notif.isRead ? 'text.secondary' : 'text.primary' }}>
                  {notif.Message}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {notifications.length === 0 && (
             <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>No notifications found for this filter.</Box>
          )}
        </Box>
      )}
    </Container>
  );
}
