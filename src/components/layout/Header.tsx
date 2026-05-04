import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { User } from 'firebase/auth';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMobile: boolean;
  user: User | null;
  onUserClick: (event: React.MouseEvent<HTMLElement>) => void;
  onAddNew: () => void;
}

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  isMobile, 
  user, 
  onUserClick, 
  onAddNew 
}: HeaderProps) {
  return (
    <Box
      sx={{
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 6 },
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0
      }}
    >
      <Box sx={{ flex: 1, maxWidth: 500, mx: { xs: 1, md: 4 } }}>
        <TextField
          placeholder="Buscar películas o series..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '10px',
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                '& fieldset': { border: 'none' }
              }
            }
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {isMobile && (
          <IconButton onClick={onUserClick} sx={{ p: 0.5 }}>
            <Avatar
              src={user?.photoURL || undefined}
              sx={{
                bgcolor: 'primary.main',
                width: 32,
                height: 32,
                fontSize: '0.875rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        )}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddNew}
        >
          {!isMobile && "Agregar Nueva"}
        </Button>
      </Box>
    </Box>
  );
}
