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
  Button
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
  AutoAwesome as RecentIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, WatchStatus } from '../types';
import AddMediaModal from '../components/AddMediaModal';
import MediaCard from '../components/MediaCard';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';


const INITIAL_DATA: MediaItem[] = [
  {
    id: '1',
    title: 'Dune: Part Two',
    type: 'movie',
    status: 'watching',
    rating: 9.5,
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    createdAt: Date.now()
  },
  {
    id: '2',
    title: 'The Bear',
    type: 'series',
    status: 'watching',
    rating: 9.0,
    imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000&auto=format&fit=crop',
    description: 'A young chef from the fine dining world comes home to Chicago to run his family sandwich shop.',
    season: 2,
    episode: 8,
    createdAt: Date.now() - 1000
  },
  {
    id: '3',
    title: 'Shogun',
    type: 'series',
    status: 'pending',
    rating: 8.5,
    imageUrl: 'https://images.unsplash.com/photo-1542204172-3c3f25de8155?q=80&w=1000&auto=format&fit=crop',
    description: 'When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power.',
    season: 1,
    episode: 1,
    createdAt: Date.now() - 2000
  }
];

export default function Library() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MediaItem[]>([]);
  
  const [activeView, setActiveView] = useState<'all' | WatchStatus>('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState(0); // 0: All, 1: Movies, 2: Series
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MediaItem[];
      setItems(mediaItems);
    });
    return () => unsubscribe();
  }, []);

  const addItem = async (newItem: Omit<MediaItem, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'media'), {
        ...newItem,
        createdAt: Date.now()
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
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
        borderRadius: 3, 
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', overflowX: 'hidden' }}>
      {/* Sidebar */}
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
              borderRadius: 2, 
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
              Navegación
            </Typography>
            <NavItem icon={HomeIcon} label="Inicio" onClick={() => navigate('/')} />
            
            <Typography variant="caption" sx={{ px: 1, mb: 1, mt: 3, color: 'text.secondary', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>
              Biblioteca
            </Typography>
            <NavItem icon={LibraryIcon} label="Ver Todo" view="all" />
            <NavItem icon={WatchingIcon} label="Viendo Ahora" view="watching" />
            <NavItem icon={WishlistIcon} label="Lista de Deseos" view="pending" />
            <NavItem icon={CompletedIcon} label="Completadas" view="completed" />
          </Box>

          <Box sx={{ pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>EO</Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Ezequiel Olivar</Typography>
              <Typography variant="caption" color="text.secondary">Plan Pro</Typography>
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
          {isMobile && (
             <IconButton onClick={() => navigate('/')} sx={{ color: 'primary.main' }}>
                <HomeIcon />
             </IconButton>
          )}
          
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
                    borderRadius: '20px', 
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                    '& fieldset': { border: 'none' }
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {!isMobile && (
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<RecentIcon />} 
                sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.primary' }}
              >
                Recientes
              </Button>
            )}
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
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
        onClose={() => setIsModalOpen(false)} 
        onAdd={addItem} 
      />
    </Box>
  );
}
