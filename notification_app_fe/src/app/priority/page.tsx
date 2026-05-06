'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Card, CardContent, Chip, 
  CircularProgress, Box, FormControl, InputLabel, Select, MenuItem, Fade
} from '@mui/material';
import axios from 'axios';
import { Logger } from '../../Logger';
import {
  expandSparseNotifications,
  getViewedNotificationIds,
  type NotificationRecord
} from '../../notificationFixtures';

const logger = new Logger('frontend', 'priority_inbox');
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

type Notification = NotificationRecord;

const TYPE_WEIGHT: Record<string, number> = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};

export default function PriorityInbox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    let isCurrent = true;

    const fetchPriorityNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/v1/notifications', {
          headers: { 'Authorization': 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('token') : 'DUMMY') },
        });
        const viewedIds = getViewedNotificationIds();
        const fetched = expandSparseNotifications(res.data.data.notifications || [])
          .filter((notification: Notification) => !viewedIds.has(notification.ID));
        fetched.sort((a: Notification, b: Notification) => {
          if (TYPE_WEIGHT[a.Type] !== TYPE_WEIGHT[b.Type]) {
            return (TYPE_WEIGHT[b.Type] || 0) - (TYPE_WEIGHT[a.Type] || 0);
          }
          return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
        });

        if (isCurrent) {
          setNotifications(fetched);
        }
        logger.info(`Fetched and sorted Priority Notifications`);
      } catch (error: unknown) {
        logger.error(`Failed to load priority notifications: ${getErrorMessage(error)}`);
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    fetchPriorityNotifications();

    return () => {
      isCurrent = false;
    };
  }, []);

  const getTheme = (type: string) => {
    if (type === 'Placement') return { color: '#047857', bg: '#d1fae5', border: '#34d399' };
    if (type === 'Result') return { color: '#92400e', bg: '#fef3c7', border: '#fbbf24' };
    return { color: '#075985', bg: '#e0f2fe', border: '#38bdf8' };
  };

  const displayList = notifications.slice(0, limit);

  return (
    <Box sx={{ minHeight: '100vh', background: '#f6f8fb', color: '#111827', pt: 5, pb: 10 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 1, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', letterSpacing: 0 }}>
              Priority Inbox
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
              Unread updates sorted by placement, result, event, then recency
            </Typography>
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 180, background: '#ffffff' }}>
            <InputLabel sx={{ color: '#6b7280' }}>Show Top</InputLabel>
            <Select
              value={limit}
              label="Show Top"
              onChange={(e) => setLimit(Number(e.target.value))}
              sx={{
                color: '#111827',
                borderRadius: '8px',
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9ca3af' },
                '.MuiSvgIcon-root ': { fill: '#4b5563 !important' }
              }}
            >
              <MenuItem value={5}>Top 5 Rank</MenuItem>
              <MenuItem value={10}>Top 10 Rank</MenuItem>
              <MenuItem value={15}>Top 15 Rank</MenuItem>
              <MenuItem value={20}>Top 20 Rank</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 4, letterSpacing: 0, textTransform: 'none' }}>
          Showing {displayList.length} of {notifications.length} unread priority notifications
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress sx={{ color: '#2563eb' }} size={48} thickness={4} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {displayList.map((notif, index) => (
              <Fade in timeout={500 + (index * 100)} key={notif.ID}>
                <Card 
                  sx={{ 
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderLeft: `4px solid ${getTheme(notif.Type).border}`,
                    borderLeftColor: getTheme(notif.Type).border,
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.10)',
                      borderColor: '#94a3b8',
                      borderLeftColor: getTheme(notif.Type).border
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography
                          variant="h4"
                          sx={{
                            minWidth: 68,
                            height: 48,
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            color: getTheme(notif.Type).color,
                            background: getTheme(notif.Type).bg,
                            border: `1px solid ${getTheme(notif.Type).border}`
                          }}
                        >
                          #{index + 1}
                        </Typography>
                        <Chip 
                          label={`${notif.Type.toUpperCase()} PRIORITY`} 
                          sx={{ 
                            background: getTheme(notif.Type).bg,
                            color: getTheme(notif.Type).color,
                            fontWeight: 900, 
                            border: `1px solid ${getTheme(notif.Type).border}`,
                            px: 1
                          }} 
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700 }}>
                        {new Date(notif.Timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', letterSpacing: 0, pl: { xs: 0, sm: 6 } }}>
                      {notif.Message}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            ))}
            {displayList.length === 0 && (
               <Box sx={{ p: 5, textAlign: 'center', color: '#6b7280' }}>No unread priority notifications.</Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
