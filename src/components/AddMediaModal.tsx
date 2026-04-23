import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Slider, 
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Grid
} from '@mui/material';
import { Movie as MovieIcon, Tv as TvIcon } from '@mui/icons-material';
import { MediaItem, WatchStatus, MediaType } from '../types';

interface AddMediaModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: Omit<MediaItem, 'id' | 'createdAt'>) => void;
}

export default function AddMediaModal({ open, onClose, onAdd }: AddMediaModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie' as MediaType,
    status: 'pending' as WatchStatus,
    rating: 7,
    description: '',
    imageUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onAdd(formData);
    setFormData({
      title: '',
      type: 'movie',
      status: 'pending',
      rating: 7,
      description: '',
      imageUrl: ''
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>Agregar a mi lista</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <ToggleButtonGroup
                value={formData.type}
                exclusive
                onChange={(_, val) => val && setFormData({ ...formData, type: val })}
                fullWidth
                size="small"
                color="primary"
              >
                <ToggleButton value="movie" sx={{ gap: 1 }}>
                  <MovieIcon fontSize="small" /> Película
                </ToggleButton>
                <ToggleButton value="series" sx={{ gap: 1 }}>
                  <TvIcon fontSize="small" /> Serie
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Título"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
 
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as WatchStatus })}
                >
                  <MenuItem value="pending">Por ver</MenuItem>
                  <MenuItem value="watching">Viendo</MenuItem>
                  <MenuItem value="completed">Visto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
 
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography gutterBottom variant="caption" color="text.secondary">
                Calificación inicial ({formData.rating}/10)
              </Typography>
              <Slider
                value={formData.rating}
                min={0}
                max={10}
                step={0.5}
                onChange={(_, val) => setFormData({ ...formData, rating: val as number })}
                valueLabelDisplay="auto"
              />
            </Grid>
 
            <Grid size={{ xs: 12 }}>
              <TextField
                label="URL de la imagen (opcional)"
                fullWidth
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </Grid>
 
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={!formData.title}>
            Agregar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
