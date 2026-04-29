import { useState, type FormEvent } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Button, 
  TextField, 
  Box, 
  Typography, 
  IconButton, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
      navigate('/library');
    } catch (err) {
      console.error("Login error:", err);
      let message = "Error al iniciar sesión. Verifica tus credenciales.";
      
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/user-not-found' || 
            err.code === 'auth/wrong-password' || 
            err.code === 'auth/invalid-credential') {
          message = "Correo o contraseña incorrectos.";
        } else if (err.code === 'auth/invalid-email') {
          message = "El formato del correo no es válido.";
        } else if (err.code === 'auth/too-many-requests') {
          message = "Demasiados intentos fallidos. Inténtalo más tarde.";
        }
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
      navigate('/library');
    } catch (err) {
      console.error("Google login error:", err);
      setError("No se pudo iniciar sesión con Google. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      aria-labelledby="login-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
          backgroundImage: 'none',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton 
          onClick={onClose}
          sx={{ 
            position: 'absolute', 
            right: 12, 
            top: 12, 
            color: 'rgba(255,255,255,0.5)',
            zIndex: 1,
            '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <form onSubmit={handleLogin}>
          <DialogContent sx={{ pt: 6, px: { xs: 3, sm: 5 }, pb: 5 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'primary.main', 
                borderRadius: 2.5, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
              }}>
                <LoginIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Typography 
                id="login-dialog-title" 
                variant="h4" 
                sx={{ fontWeight: 800, color: 'white', mb: 1, fontSize: '1.75rem' }}
              >
                Iniciar Sesión
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Ingresa a tu cuenta para gestionar tu biblioteca
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(239, 68, 68, 0.1)', 
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  '& .MuiAlert-icon': { color: '#f87171' }
                }}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, ml: 0.5, mb: 0.8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Correo electrónico
              </Typography>
              <TextField
                fullWidth
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                variant="outlined"
                autoComplete="email"
                slotProps={{
                  input: {
                    sx: {
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, ml: 0.5, mb: 0.8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contraseña
              </Typography>
              <TextField
                fullWidth
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                variant="outlined"
                autoComplete="current-password"
                slotProps={{
                  input: {
                    sx: {
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    }
                  }
                }}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.8,
                borderRadius: 2.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 30px -5px rgba(99, 102, 241, 0.6)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                transition: 'all 0.2s',
                display: 'flex',
                gap: 1.5
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                <>
                  <LoginIcon fontSize="small" />
                  Iniciar sesión
                </>
              )}
            </Button>
            <Box sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>O</Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
            </Box>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              }
              sx={{
                py: 1.5,
                borderRadius: 2.5,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'white',
                borderColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Continuar con Google
            </Button>
          </DialogContent>
        </form>
      </Box>
    </Dialog>
  );
}
