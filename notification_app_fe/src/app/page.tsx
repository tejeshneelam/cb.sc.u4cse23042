'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Card, CardContent, Chip, 
  CircularProgress, Box, FormControl, InputLabel, Select, MenuItem, Fade, Button
} from '@mui/material';
import axios from 'axios';
import { Logger } from '../Logger';
import {
  expandSparseNotifications,
  isNotificationViewed,
  markNotificationUnread,
  markNotificationViewed,
  type NotificationRecord
} from '../notificationFixtures';

const logger = new Logger('frontend', 'all_notifications');
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

interface Notification extends NotificationRecord {
  isRead?: boolean;
}

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    let isCurrent = true;

    const fetchNotifications = async () => {
      try {
        const params: Record<string, string> = {};
        if (filterType) params.notification_type = filterType;

        const res = await axios.get('http://localhost:3001/api/v1/notifications', {
          headers: { 'Authorization': 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('token') : 'DUMMY') },
          params: params
        });
        const expanded = expandSparseNotifications(res.data.data.notifications || []);
        const mapped = expanded.map((n: NotificationRecord) => ({
          ...n,
          isRead: isNotificationViewed(n.ID)
        }));
        const visibleNotifications = filterType
          ? mapped.filter((n: Notification) => n.Type?.toLowerCase() === filterType.toLowerCase())
          : mapped;
        visibleNotifications.sort((a: Notification, b: Notification) => (
          new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
        ));

        if (isCurrent) {
          setNotifications(visibleNotifications);
        }
        logger.info(`Fetched all notifications with filter: ${filterType}`);
      } catch (error: unknown) {
        logger.error(`Failed to load: ${getErrorMessage(error)}`);
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      isCurrent = false;
    };
  }, [filterType]);

  const markAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    markNotificationViewed(id);
    setNotifications(prev => prev.map(n => n.ID === id ? { ...n, isRead: true } : n));
    logger.info(`Triggered mark-as-read manually for Notification ID: ${id}`);
  };

  const markAsUnread = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    markNotificationUnread(id);
    setNotifications(prev => prev.map(n => n.ID === id ? { ...n, isRead: false } : n));
    logger.info(`Triggered mark-as-unread manually for Notification ID: ${id}`);
  };

  const getTheme = (type: string) => {
    if (type === 'Placement') return { color: '#047857', bg: '#d1fae5', border: '#34d399' };
    if (type === 'Result') return { color: '#92400e', bg: '#fef3c7', border: '#fbbf24' };
    return { color: '#075985', bg: '#e0f2fe', border: '#38bdf8' };
  };

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <Box sx={{ minHeight: '100vh', background: '#f6f8fb', color: '#111827', pt: 5, pb: 10 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', letterSpacing: 0 }}>
              All Updates
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
              {unreadCount} unread · {notifications.length} total
            </Typography>
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 180, background: '#ffffff' }}>
            <InputLabel sx={{ color: '#6b7280' }}>Filter Category</InputLabel>
            <Select
              value={filterType}
              label="Filter Category"
              onChange={(e) => setFilterType(e.target.value)}
              sx={{
                color: '#111827',
                borderRadius: '8px',
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9ca3af' },
                '.MuiSvgIcon-root ': { fill: '#4b5563 !important' }
              }}
            >
              <MenuItem value=""><em>All Types</em></MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress sx={{ color: '#2563eb' }} size={48} thickness={4} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.map((notif, index) => (
              <Fade in timeout={500 + (index * 100)} key={notif.ID}>
                <Card 
                  onClick={(e) => !notif.isRead && markAsRead(notif.ID, e)}
                  sx={{ 
                    borderRadius: '8px',
                    cursor: notif.isRead ? 'default' : 'pointer',
                    background: '#ffffff',
                    border: '1px solid',
                    borderLeft: `4px solid ${getTheme(notif.Type).border}`,
                    borderColor: notif.isRead ? '#e5e7eb' : '#cbd5e1',
                    borderLeftColor: getTheme(notif.Type).border,
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                    boxShadow: notif.isRead ? 'none' : '0 10px 24px rgba(15, 23, 42, 0.08)',
                    opacity: notif.isRead ? 0.72 : 1,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.10)',
                      borderColor: '#94a3b8',
                      borderLeftColor: getTheme(notif.Type).border
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip 
                          label={notif.Type.toUpperCase()} 
                          sx={{ 
                            background: getTheme(notif.Type).bg,
                            color: getTheme(notif.Type).color,
                            fontWeight: 800, 
                            letterSpacing: 0,
                            border: `1px solid ${getTheme(notif.Type).border}`
                          }} 
                          size="small" 
                        />
                        {!notif.isRead && (
                          <Chip label="UNREAD" size="small" sx={{ background: '#eef2ff', color: '#3730a3', height: 22, fontSize: '0.68rem', fontWeight: 900, border: '1px solid #c7d2fe' }} />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700 }}>
                          {new Date(notif.Timestamp).toLocaleString()}
                        </Typography>
                        {notif.isRead ? (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => markAsUnread(notif.ID, e)}
                            sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 700 }}
                          >
                            Mark unread
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => markAsRead(notif.ID, e)}
                            sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                          >
                            Mark read
                          </Button>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: notif.isRead ? 500 : 800, color: notif.isRead ? '#6b7280' : '#111827', letterSpacing: 0 }}>
                      {notif.Message}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            ))}
            {notifications.length === 0 && (
               <Box sx={{ p: 5, textAlign: 'center', color: '#6b7280' }}>No notifications found.</Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
