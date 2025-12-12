import { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import type { MediaFormData } from '../../types/productForm.types';
import { productsApi } from '../../api/products.api';

interface ProductMediaTabProps {
  media: MediaFormData[];
  onMediaChange: (media: MediaFormData[]) => void;
  productId?: number; // Optional for edit mode
}

export default function ProductMediaTab({ media, onMediaChange, productId }: ProductMediaTabProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setUploading(true);

    try {
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        // Step 1: Get presigned URL from backend
        const { uploadUrl, fileUrl, key } = await productsApi.generatePresignedUrl(file.name);

        // Step 2: Upload file to S3 using presigned URL
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Step 3: Return media data with S3 URL
        return {
          url: fileUrl,
          alt_text: file.name,
          is_primary: media.length === 0 && index === 0,
          display_order: media.length + index,
        } as MediaFormData;
      });

      const newMediaItems = await Promise.all(uploadPromises);
      onMediaChange([...media, ...newMediaItems]);
    } catch (err) {
      setError('Failed to upload images. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [media, onMediaChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    multiple: true,
  });

  const handleSetPrimary = (index: number) => {
    const updatedMedia = media.map((item, i) => ({
      ...item,
      is_primary: i === index,
    }));
    onMediaChange(updatedMedia);
  };

  const handleDelete = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index);

    // If we deleted the primary image, set the first image as primary
    if (updatedMedia.length > 0 && !updatedMedia.some(item => item.is_primary)) {
      updatedMedia[0].is_primary = true;
    }

    // Recalculate display order
    updatedMedia.forEach((item, i) => {
      item.display_order = i;
    });

    onMediaChange(updatedMedia);
  };

  const handleAltTextChange = (index: number, altText: string) => {
    const updatedMedia = [...media];
    updatedMedia[index].alt_text = altText;
    onMediaChange(updatedMedia);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const updatedMedia = [...media];
    const [movedItem] = updatedMedia.splice(fromIndex, 1);
    updatedMedia.splice(toIndex, 0, movedItem);

    // Update display order
    updatedMedia.forEach((item, i) => {
      item.display_order = i;
    });

    onMediaChange(updatedMedia);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Product Media
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to browse files
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supported formats: PNG, JPG, JPEG, GIF, WebP
        </Typography>
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>

      {media.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9fafb' }}>
          <Typography variant="body1" color="text.secondary">
            No images uploaded yet
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {media.map((item, index) => (
            <Card key={index}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.url}
                  alt={item.alt_text || `Product image ${index + 1}`}
                  sx={{ objectFit: 'cover' }}
                />
                {item.is_primary && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.75rem',
                    }}
                  >
                    <StarIcon sx={{ fontSize: 16 }} />
                    Primary
                  </Box>
                )}
              </Box>

              <Box sx={{ p: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Alt text"
                  value={item.alt_text || ''}
                  onChange={(e) => handleAltTextChange(index, e.target.value)}
                  sx={{ mb: 1 }}
                />
              </Box>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleSetPrimary(index)}
                    color={item.is_primary ? 'primary' : 'default'}
                    title="Set as primary"
                  >
                    {item.is_primary ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Box>
                <Box>
                  {index > 0 && (
                    <IconButton
                      size="small"
                      onClick={() => handleReorder(index, index - 1)}
                      title="Move left"
                    >
                      ←
                    </IconButton>
                  )}
                  {index < media.length - 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleReorder(index, index + 1)}
                      title="Move right"
                    >
                      →
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(index)}
                    color="error"
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
