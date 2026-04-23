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
  Grid,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { Movie as MovieIcon, Tv as TvIcon } from '@mui/icons-material';
import { MediaItem, WatchStatus, MediaType } from '../types';

interface AddMediaModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: Omit<MediaItem, 'id' | 'createdAt'>) => void;
}

export default function AddMediaModal({ open, onClose, onAdd }: AddMediaModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    type: MediaType;
    status: WatchStatus;
    rating: number;
    description: string;
    imageUrl: string;
    season: number | string;
    episode: number | string;
  }>({
    title: '',
    type: 'movie',
    status: 'pending',
    rating: 7,
    description: '',
    imageUrl: '',
    season: 1,
    episode: 1
  });

  const [openSearch, setOpenSearch] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        type: 'movie',
        status: 'pending',
        rating: 7,
        description: '',
        imageUrl: '',
        season: 1,
        episode: 1
      });
      setSearchQuery('');
      setOptions([]);
    }
  }, [open]);

  React.useEffect(() => {
    let active = true;

    if (searchQuery === '') {
      setOptions(formData.title ? options : []);
      return undefined;
    }

    setLoading(true);

    const fetchOptions = async () => {
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const endpoint = formData.type === 'movie' ? 'search/movie' : 'search/tv';
        const response = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&language=es-ES&page=1`);
        const data = await response.json();

        if (active) {
          setOptions(data.results || []);
        }
      } catch (error) {
        console.error("Error fetching TMDB data:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchOptions();
    }, 500);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, formData.type]);

  const handleTypeChange = (newType: MediaType) => {
    let newStatus = formData.status;
    if (newType === 'movie' && formData.status === 'watching') {
      newStatus = 'pending';
    }
    setFormData({ ...formData, type: newType, status: newStatus, title: '', imageUrl: '' });
    setSearchQuery('');
    setOptions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    // Prepare data to send
    const itemToAdd = { 
      ...formData,
      season: Math.max(1, formData.season === '' ? 1 : Number(formData.season)),
      episode: Math.max(1, formData.episode === '' ? 1 : Number(formData.episode))
    };
    
    if (formData.type === 'movie') {
      delete (itemToAdd as any).season;
      delete (itemToAdd as any).episode;
    }

    onAdd(itemToAdd as any);
    setFormData({
      title: '',
      type: 'movie',
      status: 'pending',
      rating: 7,
      description: '',
      imageUrl: '',
      season: 1,
      episode: 1
    });
    setSearchQuery('');
    setOptions([]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 0.5 }}>Agregar a mi lista</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <ToggleButtonGroup
                value={formData.type}
                exclusive
                onChange={(_, val) => val && handleTypeChange(val as MediaType)}
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
              <Autocomplete
                id="tmdb-search"
                open={openSearch}
                onOpen={() => setOpenSearch(true)}
                onClose={() => setOpenSearch(false)}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  return option.id === value.id;
                }}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  if (typeof option === 'string') return option;
                  return formData.type === 'movie' ? (option.title || option.original_title || '') : (option.name || option.original_name || '');
                }}
                options={options}
                loading={loading}
                filterOptions={(x) => x}
                value={options.find(opt => (formData.type === 'movie' ? opt.title : opt.name) === formData.title) || null}
                onInputChange={(_, newInputValue) => {
                  setSearchQuery(newInputValue);
                }}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') {
                    const title = formData.type === 'movie' ? (newValue.title || newValue.original_title) : (newValue.name || newValue.original_name);
                    const imageUrl = newValue.poster_path ? `https://image.tmdb.org/t/p/w500${newValue.poster_path}` : '';
                    setFormData({ ...formData, title: title || '', imageUrl });
                  } else {
                    setFormData({ ...formData, title: '', imageUrl: '' });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={formData.type === 'movie' ? "Buscar película" : "Buscar serie"}
                    required
                    fullWidth
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  const title = formData.type === 'movie' ? (option.title || option.original_title) : (option.name || option.original_name);
                  const year = option.release_date ? option.release_date.split('-')[0] : (option.first_air_date ? option.first_air_date.split('-')[0] : '');
                  return (
                    <Box component="li" key={option.id} {...otherProps}>
                      {option.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w92${option.poster_path}`} 
                          alt={title} 
                          style={{ width: 40, height: 60, marginRight: 10, objectFit: 'cover', borderRadius: 4 }} 
                        />
                      ) : (
                        <Box sx={{ width: 40, height: 60, marginRight: '10px', bgcolor: 'grey.300', borderRadius: 1 }} />
                      )}
                      <Typography variant="body1">
                        {title} {year ? `(${year})` : ''}
                      </Typography>
                    </Box>
                  );
                }}
              />
            </Grid>

            {formData.type === 'series' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Temporada"
                    fullWidth
                    type="number"
                    value={formData.season}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 1) {
                        setFormData({ ...formData, season: val });
                      }
                    }}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Episodio"
                    fullWidth
                    type="number"
                    value={formData.episode}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 1) {
                        setFormData({ ...formData, episode: val });
                      }
                    }}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                </Grid>
              </>
            )}
 
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as WatchStatus })}
                >
                  <MenuItem value="pending">Por ver</MenuItem>
                  {formData.type === 'series' && <MenuItem value="watching">Viendo</MenuItem>}
                  <MenuItem value="completed">Visto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
 
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
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
                label="Descripción"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={!formData.title}>
            Agregar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
