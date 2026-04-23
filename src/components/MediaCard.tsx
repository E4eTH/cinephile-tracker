import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon,
  CheckCircle as CompletedIcon,
  PlayCircle as WatchingIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { MediaItem, WatchStatus } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onRemove: (id: string) => void;
  onStatusUpdate: (id: string, status: WatchStatus) => void;
}

const statusBadgeConfig = {
  pending: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  watching: { label: 'Viendo', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
  completed: { label: 'Completado', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
} as const;

export default function MediaCard({ item, onRemove, onStatusUpdate }: MediaCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const status = statusBadgeConfig[item.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%' }}
    >
      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          aspectRatio: '2/3', 
          // Fallback for environments where aspect-ratio might not trigger height correctly
          minHeight: { xs: '200px', sm: '250px' },
          borderRadius: 1, 
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          bgcolor: 'rgba(30, 41, 59, 0.4)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(99, 102, 241, 0.5)',
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
            transform: 'translateY(-4px)'
          }
        }}
      >
        {/* Background Image */}
        <Box 
          sx={{ 
            position: 'absolute', 
            inset: 0, 
            maskImage: 'linear-gradient(to top, transparent, black 40%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${item.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          }}
        />

        {/* Gradient Overlay */}
        <Box 
          className="gradient-blur"
          sx={{ 
            position: 'absolute', 
            inset: 0, 
            opacity: 0.9 
          }}
        />

        {/* Top Status Badge */}
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
          <Box 
            sx={{ 
              px: 1, 
              py: 0.25, 
              borderRadius: 20, 
              fontSize: '10px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              color: status.color,
              bgcolor: status.bg,
              border: `1px solid ${status.border}`,
              backdropFilter: 'blur(8px)'
            }}
          >
            {status.label}
          </Box>
        </Box>

        {/* Action Menu Button */}
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton 
            size="small" 
            onClick={handleClick}
            sx={{ 
              color: 'white', 
              bgcolor: 'rgba(0,0,0,0.3)', 
              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
              backdropFilter: 'blur(4px)'
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Bottom Content */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: { xs: 1.5, md: 2.5 } }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 700, 
              lineHeight: 1.2, 
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {item.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              {item.type === 'movie' ? 'Película' : 'Serie'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>•</Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {item.rating}/10
            </Typography>
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: { 
              mt: 1, 
              bgcolor: 'rgba(15, 23, 42, 0.95)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              minWidth: 180
            }
          }
        }}
      >
        <MenuItem onClick={() => { onStatusUpdate(item.id, 'watching'); handleClose(); }} sx={{ py: 1.5 }}>
          <ListItemIcon><WatchingIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}>Viendo</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onStatusUpdate(item.id, 'pending'); handleClose(); }} sx={{ py: 1.5 }}>
          <ListItemIcon><PendingIcon fontSize="small" sx={{ color: 'warning.main' }} /></ListItemIcon>
          <ListItemText slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}>Pendiente</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onStatusUpdate(item.id, 'completed'); handleClose(); }} sx={{ py: 1.5 }}>
          <ListItemIcon><CompletedIcon fontSize="small" sx={{ color: 'success.main' }} /></ListItemIcon>
          <ListItemText slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}>Completado</ListItemText>
        </MenuItem>
        <Box sx={{ my: 0.5, height: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
        <MenuItem onClick={() => { onRemove(item.id); handleClose(); }} sx={{ color: 'error.main', py: 1.5 }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </motion.div>
  );
}
