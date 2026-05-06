'use client';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          AffordMed Portal
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            component={Link} 
            href="/" 
            sx={{ fontWeight: pathname === '/' ? 'bold' : 'normal', opacity: pathname === '/' ? 1 : 0.7 }}
          >
            All Updates
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            href="/priority" 
            sx={{ fontWeight: pathname === '/priority' ? 'bold' : 'normal', opacity: pathname === '/priority' ? 1 : 0.7 }}
          >
            Priority Inbox
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
