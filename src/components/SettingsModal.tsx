import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  Grid,
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  Timer as TimerIcon,
  Category as CategoryIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { User, updateProfile } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';
import ImageUpload from './ImageUpload';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  items: MediaItem[];
}

// Move StatCard outside the main component
const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string | number, color: string }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      transition: 'all 0.2s',
      height: '100%',
      '&:hover': {
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        transform: 'translateY(-2px)'
      }
    }}
  >
    <Box sx={{ 
      width: 40, 
      height: 40, 
      borderRadius: '50%', 
      bgcolor: `${color}20`, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      mb: 0.5
    }}>
      <Icon sx={{ color: color, fontSize: 20 }} />
    </Box>
    <Typography 
      variant={typeof value === 'string' && value.length > 10 ? 'h6' : 'h5'} 
      sx={{ 
        fontWeight: 800, 
        textAlign: 'center', 
        lineHeight: 1.1,
        wordBreak: 'normal',
        overflowWrap: 'anywhere',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '2.2em',
        fontSize: typeof value === 'string' && value.length > 12 ? '0.85rem' : (typeof value === 'string' && value.length > 8 ? '1rem' : '1.25rem')
      }}
    >
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', mt: 'auto' }}>
      {label}
    </Typography>
  </Paper>
);

export default function SettingsModal({ open, onClose, user, items }: SettingsModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && open) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      setIsEditing(false);
    }
  }, [user, open]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, {
        displayName,
        photoURL
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate statistics
  const watchedMovies = items.filter(item => item.type === 'movie' && item.status === 'completed');
  const watchedSeries = items.filter(item => item.type === 'series' && item.status === 'completed');
  
  const totalMovies = watchedMovies.length;
  const totalSeries = watchedSeries.length;
  
  const totalMinutes = items.reduce((acc, item) => {
    // If it's a movie and it's completed, add runtime
    if (item.type === 'movie' && item.status === 'completed' && item.runtime) {
      return acc + item.runtime;
    }
    
    // If it's a series, count episodes seen even if not 'completed' yet
    if (item.type === 'series' && item.runtime) {
      // Heuristic: (season - 1) * 12 + current episode
      const estimatedEpisodes = ((item.season || 1) - 1) * 12 + (item.episode || 0);
      return acc + (item.runtime * estimatedEpisodes);
    }
    return acc;
  }, 0);

  const totalHours = Math.floor(totalMinutes / 60);

  // Genre statistics
  const genreCounts: { [key: string]: number } = {};
  items.forEach(item => {
    if (item.status === 'completed' && item.genres) {
      item.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });

  const mostWatchedGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            backgroundImage: 'none',
            borderRadius: 2.5,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden'
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: 1, 
        pb: 1,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: 'primary.main', 
            borderRadius: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <PersonIcon sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Ajustes de Perfil</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 3, px: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={photoURL}
              sx={{
                width: 110,
                height: 110,
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                border: '3px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.02)' }
              }}
            >
              {displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                bottom: 5,
                right: 5,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '2px solid rgba(15, 23, 42, 1)',
                zIndex: 2
              }}
              onClick={() => {
                if (isEditing) {
                  // Cancelar: revertir cambios locales
                  setDisplayName(user?.displayName || '');
                  setPhotoURL(user?.photoURL || '');
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? <CloseIcon fontSize="small" /> : <EditIcon fontSize="small" />}
            </IconButton>
          </Box>

          <Box sx={{ width: '100%', mt: 2 }}>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ width: '100%', mt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      label="Nombre Público"
                      fullWidth
                      variant="outlined"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      slotProps={{
                        input: { sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' } }
                      }}
                    />
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 600 }}>
                        Foto de Perfil
                      </Typography>
                      <ImageUpload onUploadSuccess={(url) => setPhotoURL(url)} />
                    </Box>

                    <Button 
                      variant="contained" 
                      startIcon={<CheckIcon />} 
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, mt: 1 }}
                    >
                      {saving ? 'Actualizando...' : 'Guardar Cambios'}
                    </Button>
                  </Box>
                </motion.div>
              ) : (
                <motion.div
                  key="profile-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {displayName || 'Usuario'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.7 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Tu Actividad
          </Typography>
          <Divider sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={MovieIcon} label="Películas" value={totalMovies} color="#6366f1" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={TvIcon} label="Series" value={totalSeries} color="#10b981" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={TimerIcon} label="Horas" value={totalHours} color="#f59e0b" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={CategoryIcon} label="Género" value={mostWatchedGenre} color="#ec4899" />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="text" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
