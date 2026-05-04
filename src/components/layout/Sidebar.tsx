import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Movie as MovieIcon,
  LibraryBooks as LibraryIcon,
  Visibility as WatchingIcon,
  Bookmark as WishlistIcon,
  CheckCircle as CompletedIcon,
} from '@mui/icons-material';
import { User } from 'firebase/auth';
import { WatchStatus } from '../../types';

interface SidebarProps {
  user: User | null;
  activeView: 'all' | WatchStatus;
  setActiveView: (view: 'all' | WatchStatus) => void;
  onUserClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  view, 
  activeView, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  view: 'all' | WatchStatus, 
  activeView: string, 
  onClick: () => void 
}) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      px: 2,
      py: 1.5,
      borderRadius: 1.5,
      cursor: 'pointer',
      transition: 'all 0.2s',
      color: activeView === view ? 'primary.main' : 'text.secondary',
      bgcolor: activeView === view ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      border: activeView === view ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
      '&:hover': {
        bgcolor: activeView === view ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        color: 'text.primary'
      }
    }}
  >
    <Icon sx={{ fontSize: 20 }} />
    <Typography variant="body2" sx={{ fontWeight: activeView === view ? 600 : 500 }}>{label}</Typography>
  </Box>
);

export default function Sidebar({ user, activeView, setActiveView, onUserClick }: SidebarProps) {
  return (
    <Box
      className="glass"
      sx={{
        width: 280,
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        zIndex: 10
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6, px: 1 }}>
        <Box sx={{
          width: 36,
          height: 36,
          bgcolor: 'primary.main',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
        }}>
          <MovieIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Typography variant="h6" sx={{ letterSpacing: '-0.02em', fontWeight: 800 }}>CinePhile</Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="caption" sx={{ px: 1, mb: 1, color: 'text.secondary', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>
          Biblioteca
        </Typography>
        <NavItem icon={LibraryIcon} label="Todo" view="all" activeView={activeView} onClick={() => setActiveView('all')} />
        <NavItem icon={WatchingIcon} label="Viendo" view="watching" activeView={activeView} onClick={() => setActiveView('watching')} />
        <NavItem icon={WishlistIcon} label="Por ver" view="pending" activeView={activeView} onClick={() => setActiveView('pending')} />
        <NavItem icon={CompletedIcon} label="Visto" view="completed" activeView={activeView} onClick={() => setActiveView('completed')} />
      </Box>

      <Box
        sx={{
          pt: 3,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          transition: 'all 0.2s',
          p: 1,
          borderRadius: 1.5,
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            '& .user-avatar': { transform: 'scale(1.05)' }
          }
        }}
        onClick={onUserClick}
      >
        <Avatar
          className="user-avatar"
          src={user?.photoURL || undefined}
          sx={{
            bgcolor: 'primary.main',
            width: 40,
            height: 40,
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.displayName || user?.email?.split('@')[0] || 'Cinefilo'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
