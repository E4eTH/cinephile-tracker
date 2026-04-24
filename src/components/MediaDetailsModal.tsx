import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Rating,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Schedule as DurationIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Movie as MovieIcon,
  Tv as TvIcon
} from '@mui/icons-material';
import { MediaItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MediaDetailsModalProps {
  open: boolean;
  onClose: () => void;
  item: MediaItem | null;
}

interface TMDBDetails {
  overview: string;
  genres: { id: number; name: string }[];
  runtime?: number;
  episode_run_time?: number[];
  release_date?: string;
  first_air_date?: string;
  tagline?: string;
  vote_average?: number;
}

export default function MediaDetailsModal({ open, onClose, item }: MediaDetailsModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [details, setDetails] = useState<TMDBDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && item?.tmdbId) {
      fetchDetails();
    } else {
      setDetails(null);
    }
  }, [open, item]);

  const fetchDetails = async () => {
    if (!item?.tmdbId) return;

    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const endpoint = item.type === 'movie' ? `movie/${item.tmdbId}` : `tv/${item.tmdbId}`;
      const response = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&language=es-ES`);
      const data = await response.json();
      setDetails(data);
    } catch (error) {
      console.error("Error fetching TMDB details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const duration = item.type === 'movie'
    ? (details?.runtime ? `${details.runtime} min` : 'N/A')
    : (details?.episode_run_time?.[0] ? `${details.episode_run_time[0]} min por ep.` : 'N/A');

  const releaseYear = item.type === 'movie'
    ? details?.release_date?.split('-')[0]
    : details?.first_air_date?.split('-')[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            backgroundImage: 'none',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Backdrop Image */}
        <Box
          sx={{
            height: { xs: 100, sm: 130, md: 150 },
            position: 'relative',
            flexShrink: 0,
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(15, 23, 42, 0.95) 100%)'
            }
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${item.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              opacity: 0.6
            }}
          />
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            zIndex: 1,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent
          sx={{
            mt: { xs: -5, sm: -8, md: -12 },
            position: 'relative',
            zIndex: 1,
            px: { xs: 2, sm: 3, md: 4 },
            pb: 2,
            overflow: 'hidden',
            flex: 1
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 4 }, alignItems: { xs: 'center', md: 'flex-start' } }}>
            {/* Poster */}
            <Box
              component={motion.div}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              sx={{
                width: { xs: 90, sm: 120, md: 160 },
                flexShrink: 0,
                mx: { xs: 'auto', md: 0 },
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                height: 'fit-content'
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, pt: { xs: 0, md: 2 }, width: '100%', overflow: 'hidden' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }, textAlign: { xs: 'center', md: 'left' } }}>
                {item.title}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5, alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Chip
                  icon={item.type === 'movie' ? <MovieIcon fontSize="small" /> : <TvIcon fontSize="small" />}
                  label={item.type === 'movie' ? 'Película' : 'Serie'}
                  size="small"
                  sx={{ bgcolor: 'rgba(99, 102, 241, 0.2)', color: 'primary.light', fontWeight: 600 }}
                />
                {releaseYear && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <CalendarIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{releaseYear}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <DurationIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{duration}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
                  <StarIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.rating}/10</Typography>
                </Box>
              </Box>

              {details?.tagline && (
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 1, textAlign: { xs: 'center', md: 'left' }, fontSize: '0.9rem' }}>
                  "{details.tagline}"
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                {details?.genres?.map(genre => (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }}
                  />
                ))}
              </Box>

              <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 700 }}>Sinopsis</Typography>
              {loading ? (
                <CircularProgress size={20} sx={{ color: 'primary.main' }} />
              ) : (
                <Box
                  sx={{
                    position: 'relative',
                    background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.4) 100%)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: '16px',
                    height: '100px',
                    overflowY: 'auto',
                    scrollBehavior: 'smooth',
                    p: 2,
                    mb: 2,
                    border: 'none',
                    boxShadow: `
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                      inset 0 0 20px rgba(0, 0, 0, 0.1),
                      0 8px 32px rgba(0, 0, 0, 0.2)
                    `,
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.5,
                    }}
                  >
                    {details?.overview || item.comment || 'No hay sinopsis disponible.'}
                  </Typography>
                </Box>
              )}

              {item.comment && details?.overview && (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 700 }}>Tu Comentario</Typography>
                  <Box
                    sx={{
                      position: 'relative',
                      background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.4) 100%)',
                      backdropFilter: 'blur(24px)',
                      borderRadius: '16px',
                      maxHeight: '80px',
                      overflowY: 'auto',
                      scrollBehavior: 'smooth',
                      p: 1.5,
                      border: 'none',
                      boxShadow: `
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                        inset 0 0 20px rgba(0, 0, 0, 0.1),
                        0 8px 32px rgba(0, 0, 0, 0.2)
                      `,
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: 'rgba(255,255,255,0.2)',
                      }
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.comment}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
}
