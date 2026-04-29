import React, { useState } from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { motion } from 'motion/react';
import { Movie as MovieIcon, Login as LoginIcon, LibraryBooks as LibraryIcon } from '@mui/icons-material';
import LoginModal from '../components/LoginModal';
import { auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowX: 'hidden',
        background: '#020617',
        py: { xs: 4, sm: 6, md: 0 }
      }}
    >
      {/* Background Cinematic Overlay */}
      <Box 
        sx={{ 
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.2,
          filter: 'grayscale(50%) blur(4px)',
          zIndex: 0
        }}
      />
      <Box 
        sx={{ 
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 0%, #020617 80%)',
          zIndex: 0
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Stack sx={{ alignItems: 'center' }} spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
            <Box sx={{ 
              width: { xs: 45, sm: 60, md: 70 }, 
              height: { xs: 45, sm: 60, md: 70 }, 
              bgcolor: 'primary.main', 
              borderRadius: { xs: 2, sm: 2.5, md: 3 }, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 15px 30px rgba(99, 102, 241, 0.3)'
            }}>
              <MovieIcon sx={{ color: 'white', fontSize: { xs: 22, sm: 28, md: 32 } }} />
            </Box>
            
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 900, 
                letterSpacing: '-0.04em',
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.2rem' },
                lineHeight: 1.1
              }}
            >
              Bienvenido a <span style={{ color: '#6366f1' }}>CinePhile</span>
            </Typography>

            <Typography 
              variant="h5" 
              sx={{ 
                color: 'text.secondary', 
                maxWidth: 550, 
                mx: 'auto', 
                lineHeight: 1.4,
                fontSize: { xs: '0.9rem', sm: '1.05rem', md: '1.15rem' }
              }}
            >
              Tu biblioteca cinemática personal. Organiza tus películas y series favoritas, 
              haz un seguimiento de lo que estás viendo y descubre tu próxima gran historia.
            </Typography>

            <Box sx={{ pt: { xs: 1, sm: 2, md: 2.5 }, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => user ? navigate('/library') : setIsLoginOpen(true)}
                startIcon={user ? <LibraryIcon /> : <LoginIcon />}
                sx={{ 
                  px: { xs: 3, sm: 5 }, 
                  py: { xs: 1, sm: 1.5, md: 1.8 }, 
                  fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                  borderRadius: '100px',
                  background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)'
                  },
                  transition: 'all 0.3s',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                {user ? "Ir a mi Biblioteca" : "Iniciar sesión"}
              </Button>
            </Box>

            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'row', sm: 'row' },
                flexWrap: 'wrap',
                gap: { xs: 3, sm: 5 }, 
                pt: { xs: 3, sm: 4, md: 5 }, 
                opacity: 0.6, 
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }}>+1k</Typography>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Títulos</Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }}>4K</Typography>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Inmersivo</Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }}>Free</Typography>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Para Siempre</Typography>
              </Box>
            </Box>
          </Stack>
        </motion.div>
      </Container>

      <LoginModal 
        open={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </Box>
  );
}
