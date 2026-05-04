import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { 
  Box, 
  Button, 
  Slider, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import getCroppedImg from '../utils/imageUtils';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
}

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export default function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setUploading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImage) throw new Error('Failed to crop image');

      const formData = new FormData();
      formData.append('file', croppedImage);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        onUploadSuccess(data.secure_url);
        setIsCropping(false);
        setImageSrc(null);
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Asegúrate de que Cloudinary esté configurado.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
        onChange={onFileChange}
      />
      <label htmlFor="raised-button-file">
        <Button
          variant="outlined"
          component="span"
          fullWidth
          startIcon={<CloudUploadIcon />}
          sx={{ 
            py: 1.5, 
            borderRadius: 2, 
            borderStyle: 'dashed',
            bgcolor: 'rgba(255,255,255,0.02)',
            '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
                borderStyle: 'dashed',
            }
          }}
        >
          Subir Nueva Foto
        </Button>
      </label>

      <Dialog 
        open={isCropping} 
        onClose={() => !uploading && setIsCropping(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
            paper: {
                sx: {
                    bgcolor: 'rgb(15, 23, 42)',
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.1)'
                }
            }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Ajustar Foto</DialogTitle>
        <DialogContent sx={{ position: 'relative', minHeight: 300, bgcolor: '#000' }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="round"
              showGrid={false}
            />
          )}
        </DialogContent>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(_e, newValue) => setZoom(newValue as number)}
          />
        </Box>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setIsCropping(false)} 
            disabled={uploading}
            sx={{ color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            {uploading ? 'Subiendo...' : 'Aplicar y Subir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
