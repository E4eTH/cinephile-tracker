import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Fab,
  useMediaQuery,
  useTheme as useMuiTheme,
  Grid,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import {
  Add as AddIcon,
  Movie as MovieIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, WatchStatus } from '../types';
import AddMediaModal from '../components/AddMediaModal';
import MediaDetailsModal from '../components/MediaDetailsModal';
import MediaCard from '../components/MediaCard';
import SettingsModal from '../components/SettingsModal';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useAuth } from '../hooks/useAuth';
import { useMedia } from '../hooks/useMedia';

export default function Library() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const { 
    items, 
    loading: itemsLoading, 
    addMedia, 
    updateMedia, 
    removeMedia, 
    updateStatus,
    loadMore,
    loadingMore,
    hasMore
  } = useMedia(user?.uid);

  const [activeView, setActiveView] = useState<'all' | WatchStatus>('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState(0); // 0: All, 1: Movies, 2: Series
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Memoized filtered items for performance scalability
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = mediaTypeFilter === 0 || 
                         (mediaTypeFilter === 1 && item.type === 'movie') || 
                         (mediaTypeFilter === 2 && item.type === 'series');
      const matchesStatus = activeView === 'all' || item.status === activeView;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [items, searchQuery, mediaTypeFilter, activeView]);

  const handleSave = async (newItem: Omit<MediaItem, 'id' | 'createdAt' | 'userId'> | MediaItem) => {
    try {
      if ('id' in newItem) {
        const { id, ...data } = newItem;
        await updateMedia(id, data);
      } else {
        await addMedia(newItem);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving document: ", error);
    }
  };

  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect if not logged in (handled by useAuth + useEffect usually, but here for safety)
  if (!user && !authLoading) {
    navigate('/');
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', overflowX: 'hidden' }}>
      {!isMobile && (
        <Sidebar 
          user={user} 
          activeView={activeView} 
          setActiveView={setActiveView} 
          onUserClick={handleUserClick} 
        />
      )}

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isMobile={isMobile}
          user={user}
          onUserClick={handleUserClick}
          onAddNew={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        />

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 6 } }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', mb: 4, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>Mi Colección</Typography>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 500, opacity: 0.7 }}>
                ({filteredItems.length})
              </Typography>
            </Box>

            <Tabs
              value={mediaTypeFilter}
              onChange={(_, val) => setMediaTypeFilter(val)}
              sx={{
                minHeight: 'auto',
                '& .MuiTabs-indicator': { height: 2, borderRadius: 2 },
                '& .MuiTab-root': {
                  minHeight: 'auto',
                  py: 1,
                  px: 2,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&.Mui-selected': { color: 'text.primary' }
                }
              }}
            >
              <Tab label="Todos" />
              <Tab label="Películas" />
              <Tab label="Series" />
            </Tabs>
          </Box>

          <Box sx={{ mt: 2 }}>
            {itemsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <AnimatePresence mode="popLayout">
                  {filteredItems.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Box sx={{ textAlign: 'center', py: 10, opacity: 0.3 }}>
                        <MovieIcon sx={{ fontSize: 100, mb: 2 }} />
                        <Typography variant="h5">No se encontraron resultados</Typography>
                      </Box>
                    </motion.div>
                  ) : (
                    <Grid container spacing={4}>
                      {filteredItems.map((item) => (
                        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2.4 }} key={item.id}>
                          <MediaCard
                            item={item}
                            onRemove={removeMedia}
                            onStatusUpdate={updateStatus}
                            onClick={() => {
                              setSelectedItem(item);
                              setIsDetailsModalOpen(true);
                            }}
                            onEdit={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </AnimatePresence>

                {hasMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Box
                        onClick={loadMore}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: '12px',
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        {loadingMore ? (
                          <CircularProgress size={20} thickness={5} sx={{ color: 'primary.main' }} />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Cargar más títulos</Typography>
                        )}
                      </Box>
                    </motion.div>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {isMobile && (
        <Fab
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
        >
          <AddIcon />
        </Fab>
      )}

      <AddMediaModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        initialData={editingItem}
      />

      <MediaDetailsModal
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        item={selectedItem}
      />

      <SettingsModal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        items={items}
      />

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.4))',
              mt: 1.5,
              bgcolor: 'rgba(23, 23, 23, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 1.5,
              minWidth: 220,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.2,
                mx: 1,
                my: 0.5,
                borderRadius: 1,
                fontSize: '0.875rem',
                gap: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main'
                  }
                }
              }
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {user?.displayName || 'Cinefilo'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.05)' }} />
        <MenuItem onClick={() => setIsSettingsModalOpen(true)}>
          <ListItemIcon sx={{ minWidth: 'auto !important' }}>
            <SettingsIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Ajustes" />
        </MenuItem>
        <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.05)' }} />
        <MenuItem onClick={handleLogout} sx={{ color: '#ff4d4d !important', '&:hover': { bgcolor: 'rgba(255, 77, 77, 0.1) !important' } }}>
          <ListItemIcon sx={{ minWidth: 'auto !important' }}>
            <LogoutIcon fontSize="small" sx={{ color: '#ff4d4d' }} />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </MenuItem>
      </Menu>
    </Box>
  );
}
