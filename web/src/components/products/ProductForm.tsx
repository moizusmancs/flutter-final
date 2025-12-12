import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories.api';
import type { ProductBasicInfoFormData } from '../../types/productForm.types';
import { productBasicInfoSchema } from '../../types/productForm.types';

interface ProductFormProps {
  initialData?: Partial<ProductBasicInfoFormData>;
  onDataChange: (data: ProductBasicInfoFormData) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function ProductForm({ initialData, onDataChange, onValidationChange }: ProductFormProps) {
  const { data: categoriesResponse, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAllCategories(),
  });

  const categories = categoriesResponse?.categories || [];

  // Debug logging
  useEffect(() => {
    console.log('Categories Response:', categoriesResponse);
    console.log('Categories:', categories);
    console.log('Loading:', categoriesLoading);
    console.log('Error:', categoriesError);
  }, [categoriesResponse, categories, categoriesLoading, categoriesError]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProductBasicInfoFormData>({
    resolver: zodResolver(productBasicInfoSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      category_id: initialData?.category_id || undefined,
      status: initialData?.status || 'draft',
      price: initialData?.price || 0,
      compare_at_price: initialData?.compare_at_price || undefined,
      sku: initialData?.sku || '',
      discount: initialData?.discount || 0,
    },
  });

  const watchedName = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !initialData?.slug) {
      const generatedSlug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', generatedSlug);
    }
  }, [watchedName, initialData?.slug, setValue]);

  // Watch all form values and emit changes
  useEffect(() => {
    const subscription = watch((data) => {
      if (isValid) {
        onDataChange(data as ProductBasicInfoFormData);
      }
      onValidationChange(isValid);
    });
    return () => subscription.unsubscribe();
  }, [watch, isValid, onDataChange, onValidationChange]);

  return (
    <Box component="form" onSubmit={handleSubmit(onDataChange)} noValidate>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Product Name"
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Slug"
                  fullWidth
                  required
                  error={!!errors.slug}
                  helperText={errors.slug?.message || 'URL-friendly version of the name'}
                />
              )}
            />
          </Box>
        </Box>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              fullWidth
              required
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.category_id}>
                  <InputLabel>Category</InputLabel>
                  <Select {...field} label="Category">
                    <MenuItem value="">
                      <em>Select a category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category_id && (
                    <FormHelperText>{errors.category_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>

          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                  </Select>
                  {errors.status && (
                    <FormHelperText>{errors.status.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
            <Controller
              name="sku"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="SKU"
                  fullWidth
                  required
                  error={!!errors.sku}
                  helperText={errors.sku?.message || 'Stock Keeping Unit'}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
            <Controller
              name="price"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  value={value || ''}
                  onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                  label="Price"
                  fullWidth
                  required
                  type="number"
                  slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />
              )}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
            <Controller
              name="compare_at_price"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  label="Compare at Price"
                  fullWidth
                  type="number"
                  slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!errors.compare_at_price}
                  helperText={errors.compare_at_price?.message || 'Original price before discount'}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
            <Controller
              name="discount"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                  label="Discount"
                  fullWidth
                  type="number"
                  slotProps={{ htmlInput: { step: '1', min: '0', max: '100' } }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  error={!!errors.discount}
                  helperText={errors.discount?.message}
                />
              )}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
