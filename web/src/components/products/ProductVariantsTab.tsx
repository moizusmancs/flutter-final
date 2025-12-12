import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { VariantFormData, VariantSchemaData } from '../../types/productForm.types';
import { variantSchema } from '../../types/productForm.types';

interface ProductVariantsTabProps {
  variants: VariantFormData[];
  onVariantsChange: (variants: VariantFormData[]) => void;
}

export default function ProductVariantsTab({ variants, onVariantsChange }: ProductVariantsTabProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VariantSchemaData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      size: '',
      color: '',
      stock: 0,
      additional_price: undefined,
    },
  });

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      const variant = variants[index];
      reset({
        size: variant.size || '',
        color: variant.color || '',
        stock: variant.stock,
        additional_price: variant.additional_price || undefined,
      });
    } else {
      setEditingIndex(null);
      reset({
        size: '',
        color: '',
        stock: 0,
        additional_price: undefined,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIndex(null);
    reset();
  };

  const handleSaveVariant = (data: VariantSchemaData) => {
    const newVariant: VariantFormData = {
      size: data.size || undefined,
      color: data.color || undefined,
      stock: data.stock,
      additional_price: data.additional_price || undefined,
    };

    let updatedVariants: VariantFormData[];
    if (editingIndex !== null) {
      // Editing existing variant
      updatedVariants = [...variants];
      updatedVariants[editingIndex] = {
        ...variants[editingIndex],
        ...newVariant,
      };
    } else {
      // Adding new variant
      updatedVariants = [...variants, newVariant];
    }

    onVariantsChange(updatedVariants);
    handleCloseDialog();
  };

  const handleDeleteVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(updatedVariants);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Product Variants</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Variant
        </Button>
      </Box>

      {variants.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9fafb' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No variants added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add variants to offer different sizes and colors
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Variant
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Size</TableCell>
                <TableCell>Color</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Additional Price</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={index}>
                  <TableCell>{variant.size || '-'}</TableCell>
                  <TableCell>{variant.color || '-'}</TableCell>
                  <TableCell align="right">{variant.stock}</TableCell>
                  <TableCell align="right">
                    {variant.additional_price ? `$${variant.additional_price.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(index)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteVariant(index)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Edit Variant' : 'Add Variant'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Size"
                      fullWidth
                      error={!!errors.size}
                      helperText={errors.size?.message}
                    />
                  )}
                />

                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Color"
                      fullWidth
                      error={!!errors.color}
                      helperText={errors.color?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="stock"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value}
                      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                      label="Stock"
                      fullWidth
                      required
                      type="number"
                      slotProps={{ htmlInput: { step: '1', min: '0' } }}
                      error={!!errors.stock}
                      helperText={errors.stock?.message}
                    />
                  )}
                />

                <Controller
                  name="additional_price"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value || ''}
                      onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      label="Additional Price"
                      fullWidth
                      type="number"
                      slotProps={{
                        htmlInput: { step: '0.01', min: '0' },
                        input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }
                      }}
                      error={!!errors.additional_price}
                      helperText={errors.additional_price?.message || 'Extra price added to base product price'}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit(handleSaveVariant)} variant="contained">
            {editingIndex !== null ? 'Save Changes' : 'Add Variant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
