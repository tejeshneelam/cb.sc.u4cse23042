'use client';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.94)',
          color: '#111827',
          borderBottom: '1px solid #e5e7eb',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
          zIndex: 1300
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 116, sm: 68 },
            px: { xs: 2, sm: 4 },
            py: { xs: 1.25, sm: 0 },
            gap: { xs: 1.25, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' }
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: '#1d4ed8', color: '#ffffff', display: 'grid', placeItems: 'center', fontWeight: 900, flexShrink: 0 }}>
              A
            </Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 900,
                letterSpacing: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: { xs: '1.25rem', sm: '1.25rem' }
              }}
            >
              AffordMed Portal
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: 'grid', sm: 'flex' },
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'none' },
              gap: 1,
              flexShrink: 0,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            <Button
              component={Link}
              href="/"
              sx={{
                color: pathname === '/' ? '#1d4ed8' : '#4b5563',
                background: pathname === '/' ? '#eff6ff' : 'transparent',
                fontWeight: pathname === '/' ? 800 : 600,
                borderRadius: '6px',
                px: { xs: 1, sm: 2 },
                minHeight: { xs: 38, sm: 36 },
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { background: '#eff6ff' }
              }}
            >
              All Updates
            </Button>
            <Button
              component={Link}
              href="/priority"
              sx={{
                color: pathname === '/priority' ? '#1d4ed8' : '#4b5563',
                background: pathname === '/priority' ? '#eff6ff' : 'transparent',
                fontWeight: pathname === '/priority' ? 800 : 600,
                borderRadius: '6px',
                px: { xs: 1, sm: 2 },
                minHeight: { xs: 38, sm: 36 },
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { background: '#eff6ff' }
              }}
            >
              Priority Inbox
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ height: { xs: 116, sm: 68 }, flexShrink: 0 }} />
    </>
  );
}
