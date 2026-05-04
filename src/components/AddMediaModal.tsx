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
  onSave: (item: Omit<MediaItem, 'id' | 'createdAt' | 'userId'> | MediaItem) => void;
  initialData?: MediaItem | null;
}

export default function AddMediaModal({ open, onClose, onSave, initialData }: AddMediaModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    type: MediaType;
    status: WatchStatus;
    rating: number;
    comment: string;
    imageUrl: string;
    tmdbId: number | null;
    season: number | string;
    episode: number | string;
    runtime: number;
    genres: string[];
  }>({
    title: '',
    type: 'movie',
    status: 'pending',
    rating: 7,
    comment: '',
    imageUrl: '',
    tmdbId: null,
    season: 1,
    episode: 1,
    runtime: 0,
    genres: []
  });

  const [openSearch, setOpenSearch] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonsList, setSeasonsList] = useState<any[]>([]);
  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Reset form when modal opens or initialData changes
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          type: initialData.type,
          status: initialData.status,
          rating: initialData.rating || 0,
          comment: initialData.comment || '',
          imageUrl: initialData.imageUrl || '',
          tmdbId: initialData.tmdbId || null,
          season: initialData.season || 1,
          episode: initialData.episode || 1,
          runtime: initialData.runtime || 0,
          genres: initialData.genres || []
        });
      } else {
        setFormData({
          title: '',
          type: 'movie',
          status: 'pending',
          rating: 7,
          comment: '',
          imageUrl: '',
          tmdbId: null,
          season: 1,
          episode: 1,
          runtime: 0,
          genres: []
        });
      }
      setSearchQuery('');
      setOptions([]);

      // If editing and runtime/genres are missing but we have tmdbId, fetch them
      if (initialData?.tmdbId && (!initialData.runtime || !initialData.genres?.length)) {
        const repairData = async () => {
          try {
            const endpoint = initialData.type === 'movie' ? `movie/${initialData.tmdbId}` : `tv/${initialData.tmdbId}`;
            const response = await fetch(`/.netlify/functions/tmdb?endpoint=${endpoint}&language=es-ES`);
            const details = await response.json();
            
            const runtime = initialData.type === 'movie' 
              ? (details.runtime || 120) 
              : (details.episode_run_time?.[0] || 45);
            
            const genres = details.genres?.map((g: any) => g.name) || [];
            
            setFormData(prev => ({
              ...prev,
              runtime,
              genres
            }));
          } catch (e) {
            console.error("Error repairing data:", e);
          }
        };
        repairData();
      }
    }
  }, [open, initialData]);

  const fetchSeasons = async (id: number) => {
    setLoadingSeasons(true);
    try {
      const response = await fetch(`/.netlify/functions/tmdb?endpoint=tv/${id}&language=es-ES`);
      const data = await response.json();
      setSeasonsList(data.seasons || []);
    } catch (error) {
      console.error("Error fetching seasons:", error);
    } finally {
      setLoadingSeasons(false);
    }
  };

  const fetchEpisodes = async (tvId: number, seasonNum: number) => {
    setLoadingEpisodes(true);
    try {
      const response = await fetch(`/.netlify/functions/tmdb?endpoint=tv/${tvId}/season/${seasonNum}&language=es-ES`);
      const data = await response.json();
      setEpisodesList(data.episodes || []);
    } catch (error) {
      console.error("Error fetching episodes:", error);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  React.useEffect(() => {
    if (formData.type === 'series' && formData.tmdbId) {
      fetchSeasons(formData.tmdbId);
    } else {
      setSeasonsList([]);
      setEpisodesList([]);
    }
  }, [formData.tmdbId, formData.type]);

  React.useEffect(() => {
    if (formData.type === 'series' && formData.tmdbId && formData.season) {
      fetchEpisodes(formData.tmdbId, Number(formData.season));
    } else {
      setEpisodesList([]);
    }
  }, [formData.season, formData.tmdbId, formData.type]);

  React.useEffect(() => {
    let active = true;

    if (searchQuery === '') {
      setOptions(formData.title ? options : []);
      return undefined;
    }

    setLoading(true);

    const fetchOptions = async () => {
      try {
        const endpoint = formData.type === 'movie' ? 'search/movie' : 'search/tv';
        const response = await fetch(`/.netlify/functions/tmdb?endpoint=${endpoint}&query=${encodeURIComponent(searchQuery)}&language=es-ES&page=1`);
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
    setFormData({ ...formData, type: newType, status: newStatus, title: '', imageUrl: '', tmdbId: null });
    setSearchQuery('');
    setOptions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave = { 
      ...formData,
      season: Math.max(1, formData.season === '' ? 1 : Number(formData.season)),
      episode: Math.max(1, formData.episode === '' ? 1 : Number(formData.episode))
    };
    
    if (formData.type === 'movie') {
      delete (itemToSave as any).season;
      delete (itemToSave as any).episode;
    }

    if (initialData) {
      onSave({ ...itemToSave, id: initialData.id, createdAt: initialData.createdAt, userId: initialData.userId } as MediaItem);
    } else {
      onSave(itemToSave as any);
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DialogTitle sx={{ pb: 0.5 }}>
          {initialData ? 'Editar registro' : 'Agregar a mi lista'}
        </DialogTitle>
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
                disabled={!!initialData}
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
              {initialData ? (
                <TextField
                  label={formData.type === 'movie' ? "Película" : "Serie"}
                  value={formData.title}
                  fullWidth
                  disabled
                />
              ) : (
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
                    // Sync title with input so the user can add items manually if they want
                    if (!initialData) {
                      setFormData(prev => ({ ...prev, title: newInputValue }));
                    }
                  }}
                  onChange={async (_, newValue) => {
                    if (newValue && typeof newValue !== 'string') {
                      const title = formData.type === 'movie' ? (newValue.title || newValue.original_title) : (newValue.name || newValue.original_name);
                      const imageUrl = newValue.poster_path ? `https://image.tmdb.org/t/p/w500${newValue.poster_path}` : '';
                      
                      setLoading(true);
                      try {
                        const endpoint = formData.type === 'movie' ? `movie/${newValue.id}` : `tv/${newValue.id}`;
                        const response = await fetch(`/.netlify/functions/tmdb?endpoint=${endpoint}&language=es-ES`);
                        const details = await response.json();
                        
                        const runtime = formData.type === 'movie' 
                          ? (details.runtime || 120) 
                          : (details.episode_run_time?.[0] || 45);
                        
                        const genres = details.genres?.map((g: any) => g.name) || [];

                        setFormData({ 
                          ...formData, 
                          title: title || '', 
                          imageUrl, 
                          tmdbId: newValue.id,
                          runtime,
                          genres
                        });
                      } catch (error) {
                        console.error("Error fetching details:", error);
                        setFormData({ ...formData, title: title || '', imageUrl, tmdbId: newValue.id });
                      } finally {
                        setLoading(false);
                      }
                    } else {
                      setFormData({ ...formData, title: '', imageUrl: '', tmdbId: null, runtime: 0, genres: [] });
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
              )}
            </Grid>

            {formData.type === 'series' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth disabled={loadingSeasons || !formData.tmdbId}>
                    <InputLabel>Temporada</InputLabel>
                    <Select
                      value={formData.season}
                      label="Temporada"
                      onChange={(e) => setFormData({ ...formData, season: e.target.value, episode: 1 })}
                    >
                      {loadingSeasons ? (
                        <MenuItem value={formData.season}><CircularProgress size={16} /> Cargando...</MenuItem>
                      ) : seasonsList.length > 0 ? (
                        seasonsList.map((s) => (
                          <MenuItem key={s.id} value={s.season_number}>
                            Temporada {s.season_number} ({s.episode_count} eps)
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value={formData.season}>Temporada {formData.season}</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth disabled={loadingEpisodes || !formData.tmdbId}>
                    <InputLabel>Episodio</InputLabel>
                    <Select
                      value={formData.episode}
                      label="Episodio"
                      onChange={(e) => setFormData({ ...formData, episode: e.target.value })}
                    >
                      {loadingEpisodes ? (
                        <MenuItem value={formData.episode}><CircularProgress size={16} /> Cargando...</MenuItem>
                      ) : episodesList.length > 0 ? (
                        episodesList.map((e) => (
                          <MenuItem key={e.id} value={e.episode_number}>
                            Episodio {e.episode_number}: {e.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value={formData.episode}>Episodio {formData.episode}</MenuItem>
                      )}
                    </Select>
                  </FormControl>
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
                label="Comentario"
                fullWidth
                multiline
                rows={2}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={!formData.title}>
            {initialData ? 'Guardar cambios' : 'Agregar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
