'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Card, CardContent, Chip, 
  CircularProgress, Box, FormControl, InputLabel, Select, MenuItem, Fade
} from '@mui/material';
import axios from 'axios';
import { Logger } from '../Logger';

const logger = new Logger('frontend', 'all_notifications');

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
  isRead?: boolean;
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
        headers: { 'Authorization': 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('token') : 'DUMMY') },
        params: params
      });
      const mapped = (res.data.data.notifications || []).map((n: Notification) => ({
        ...n,
        isRead: false
      }));
      setNotifications(mapped);
      logger.info(`Fetched all notifications with filter: ${filterType}`);
    } catch (error: any) {
      logger.error(`Failed to load: ${error.message}`);
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

  const getTheme = (type: string) => {
    if (type === 'Placement') return { color: '#00e676', bg: 'linear-gradient(135deg, #1b5e20 0%, #00e676 100%)' };
    if (type === 'Result') return { color: '#ffea00', bg: 'linear-gradient(135deg, #f57f17 0%, #ffea00 100%)' };
    return { color: '#00e5ff', bg: 'linear-gradient(135deg, #00b0ff 0%, #18ffff 100%)' };
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at top left, #0a0a0a, #1a1a2e)', color: 'white', pt: 5, pb: 10 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, p: 3, borderRadius: '16px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h4" sx={{ fontWeight: '900', background: '-webkit-linear-gradient(45deg, #FF8E53 30%, #FF2A5A 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0px 4px 20px rgba(255, 42, 90, 0.4)' }}>
            All Notifications
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Filter Category</InputLabel>
            <Select
              value={filterType}
              label="Filter Category"
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }, '.MuiSvgIcon-root ': { fill: "white !important" } }}
            >
              <MenuItem value=""><em>All Types</em></MenuItem>
              <MenuItem value="Placement">🚀 Placement</MenuItem>
              <MenuItem value="Result">📊 Result</MenuItem>
              <MenuItem value="Event">🎉 Event</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress sx={{ color: '#FF2A5A' }} size={60} thickness={4} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {notifications.map((notif, index) => (
              <Fade in timeout={500 + (index * 100)} key={notif.ID}>
                <Card 
                  onClick={(e) => markAsRead(notif.ID, e)}
                  sx={{ 
                    borderRadius: '20px', 
                    cursor: 'pointer',
                    background: notif.isRead ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid',
                    borderColor: notif.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.2)',
                    transform: 'perspective(500px) translateZ(0px)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    boxShadow: notif.isRead ? 'none' : '0 10px 30px -10px rgba(0,0,0,0.5)',
                    '&:hover': {
                      transform: 'perspective(500px) translateZ(10px) translateY(-5px)',
                      boxShadow: `0 20px 40px -10px ${getTheme(notif.Type).color}40`,
                      borderColor: getTheme(notif.Type).color
                    }
                  }}
                >
                  <CardContent sx={{ position: 'relative', overflow: 'hidden', p: 3 }}>
                    {!notif.isRead && (
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: getTheme(notif.Type).bg, boxShadow: `0 0 15px ${getTheme(notif.Type).color}` }} />
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pl: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip 
                          label={notif.Type.toUpperCase()} 
                          sx={{ 
                            background: getTheme(notif.Type).bg, 
                            color: '#000', 
                            fontWeight: 800, 
                            letterSpacing: '1px',
                            boxShadow: `0 0 10px ${getTheme(notif.Type).color}`,
                            border: 'none'
                          }} 
                          size="small" 
                        />
                        {!notif.isRead && (
                          <Chip label="NEW" size="small" sx={{ background: '#FF2A5A', color: 'white', height: 20, fontSize: '0.65rem', fontWeight: 900, animation: 'pulse 2s infinite' }} />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                        {new Date(notif.Timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ pl: 2, fontWeight: notif.isRead ? 400 : 700, color: notif.isRead ? 'rgba(255,255,255,0.6)' : '#fff', letterSpacing: '0.5px' }}>
                      {notif.Message}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            ))}
            {notifications.length === 0 && (
               <Box sx={{ p: 5, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No signals detected in this cluster.</Box>
            )}
            <style>{`
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 42, 90, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(255, 42, 90, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 42, 90, 0); }
              }
            `}</style>
          </Box>
        )}
      </Container>
    </Box>
  );
}
