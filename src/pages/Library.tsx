import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Fab,
  useMediaQuery,
  useTheme as useMuiTheme,
  Grid,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Tab,
  Tabs,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  Search as SearchIcon,
  LibraryBooks as LibraryIcon,
  Visibility as WatchingIcon,
  Bookmark as WishlistIcon,
  CheckCircle as CompletedIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, WatchStatus } from '../types';
import AddMediaModal from '../components/AddMediaModal';
import MediaDetailsModal from '../components/MediaDetailsModal';
import MediaCard from '../components/MediaCard';
import { db, auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';


export default function Library() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [items, setItems] = useState<MediaItem[]>([]);

  const [activeView, setActiveView] = useState<'all' | WatchStatus>('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState(0); // 0: All, 1: Movies, 2: Series
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        navigate('/');
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'media'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(`Firestore snapshot received: ${snapshot.docs.length} items`);
        const mediaItems = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId || '',
            ...data,
            comment: data.comment || (data as any).description || ''
          } as MediaItem;
        });

        // Sort in memory to avoid needing a composite index in Firestore
        // Newest first (descending by createdAt)
        mediaItems.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setItems(mediaItems);
      },
      (error) => {
        console.error("FIREBASE ERROR en onSnapshot: ", error);
        // If it's a permission error, maybe the rules are not set correctly
        if (error.code === 'permission-denied') {
          console.warn("TIP: Revisa las reglas de seguridad de Firestore para permitir lecturas en la colección 'media'.");
        }
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleSave = async (newItem: Omit<MediaItem, 'id' | 'createdAt' | 'userId'> | MediaItem) => {
    if (!user) return;

    try {
      if ('id' in newItem) {
        // Update existing item
        const { id, ...data } = newItem;
        await updateDoc(doc(db, 'media', id), data);
      } else {
        // Add new item
        await addDoc(collection(db, 'media'), {
          ...newItem,
          userId: user.uid,
          createdAt: Date.now()
        });
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving document: ", error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'media', id));
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  const updateStatus = async (id: string, status: WatchStatus) => {
    try {
      await updateDoc(doc(db, 'media', id), { status });
    } catch (error) {
      console.error("Error updating document: ", error);
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
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = mediaTypeFilter === 0 || (mediaTypeFilter === 1 && item.type === 'movie') || (mediaTypeFilter === 2 && item.type === 'series');
    const matchesStatus = activeView === 'all' || item.status === activeView;
    return matchesSearch && matchesType && matchesStatus;
  });

  const NavItem = ({ icon: Icon, label, view, onClick }: { icon: any, label: string, view?: string, onClick?: () => void }) => (
    <Box
      onClick={onClick || (() => setActiveView(view as any))}
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

  if (authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', overflowX: 'hidden' }}>
      {!isMobile && (
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
            <NavItem icon={LibraryIcon} label="Todo" view="all" />
            <NavItem icon={WatchingIcon} label="Viendo" view="watching" />
            <NavItem icon={WishlistIcon} label="Por ver" view="pending" />
            <NavItem icon={CompletedIcon} label="Visto" view="completed" />
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
            onClick={handleUserClick}
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
              {/* Subtitle removed */}
            </Box>
          </Box>
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
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
              <IconButton onClick={handleUserClick} sx={{ p: 0.5 }}>
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
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
            >
              {!isMobile && "Agregar Nueva"}
            </Button>
          </Box>
        </Box>

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
                        onRemove={removeItem}
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
        {/* Perfil and Ajustes options removed */}
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
