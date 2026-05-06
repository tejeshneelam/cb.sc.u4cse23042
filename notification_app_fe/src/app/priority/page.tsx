'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Card, CardContent, Chip, 
  CircularProgress, Box, FormControl, InputLabel, Select, MenuItem, Fade
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
        headers: { 'Authorization': 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('token') : 'DUMMY') },
      });
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

  const getTheme = (type: string) => {
    if (type === 'Placement') return { color: '#00e676', bg: 'linear-gradient(135deg, #1b5e20 0%, #00e676 100%)' };
    if (type === 'Result') return { color: '#ffea00', bg: 'linear-gradient(135deg, #f57f17 0%, #ffea00 100%)' };
    return { color: '#00e5ff', bg: 'linear-gradient(135deg, #00b0ff 0%, #18ffff 100%)' };
  };

  const displayList = notifications.slice(0, limit);

  return (
    <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, #0d0a20, #000000)', color: 'white', pt: 5, pb: 10 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, p: 3, borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
          <Typography variant="h4" sx={{ fontWeight: '900', background: '-webkit-linear-gradient(45deg, #7C4DFF 30%, #448AFF 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0px 4px 20px rgba(68, 138, 255, 0.4)' }}>
            Priority Inbox
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Show Top</InputLabel>
            <Select
              value={limit}
              label="Show Top"
              onChange={(e) => setLimit(Number(e.target.value))}
              sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }, '.MuiSvgIcon-root ': { fill: "white !important" } }}
            >
              <MenuItem value={5}>🔥 Top 5 Rank</MenuItem>
              <MenuItem value={10}>🌟 Top 10 Rank</MenuItem>
              <MenuItem value={15}>📊 Top 15 Rank</MenuItem>
              <MenuItem value={20}>🌍 Top 20 Rank</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 4, pl: 2, letterSpacing: '1px', textTransform: 'uppercase' }}>
          Strictly sorted by Weight (Placement &gt; Result &gt; Event) and Recency
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress sx={{ color: '#7C4DFF' }} size={60} thickness={4} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {displayList.map((notif, index) => (
              <Fade in timeout={500 + (index * 100)} key={notif.ID}>
                <Card 
                  sx={{ 
                    borderRadius: '16px', 
                    background: 'rgba(20, 20, 30, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateX(2deg) rotateY(-2deg) scale(1.02)',
                      boxShadow: `-10px 15px 30px -10px ${getTheme(notif.Type).color}50`,
                      borderColor: getTheme(notif.Type).color
                    }
                  }}
                >
                  <Box sx={{ position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', background: getTheme(notif.Type).bg, zIndex: -1, borderRadius: '18px', filter: 'blur(8px)', opacity: 0.4 }} />

                  <CardContent sx={{ position: 'relative', zIndex: 1, background: 'rgba(20,20,30,0.9)', borderRadius: '16px', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'rgba(255,255,255,0.1)', fontStyle: 'italic' }}>
                          #{index + 1}
                        </Typography>
                        <Chip 
                          label={`${notif.Type.toUpperCase()} PRIORITY`} 
                          sx={{ 
                            background: getTheme(notif.Type).bg, 
                            color: '#000', 
                            fontWeight: 900, 
                            boxShadow: `0 0 15px ${getTheme(notif.Type).color}80`,
                            border: 'none',
                            px: 1
                          }} 
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                        {new Date(notif.Timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff', letterSpacing: '0.3px', pl: { xs: 0, sm: 6 } }}>
                      {notif.Message}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            ))}
            {displayList.length === 0 && (
               <Box sx={{ p: 5, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No priority queue found.</Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
