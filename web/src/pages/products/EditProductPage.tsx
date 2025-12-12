import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Button,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Publish as PublishIcon } from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import ProductForm from '../../components/products/ProductForm';
import ProductVariantsTab from '../../components/products/ProductVariantsTab';
import ProductMediaTab from '../../components/products/ProductMediaTab';
import type { ProductBasicInfoFormData, VariantFormData, MediaFormData } from '../../types/productForm.types';
import { productsApi } from '../../api/products.api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = id ? parseInt(id) : undefined;

  const [currentTab, setCurrentTab] = useState(0);
  const [productData, setProductData] = useState<ProductBasicInfoFormData | null>(null);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [media, setMedia] = useState<MediaFormData[]>([]);
  const [originalVariants, setOriginalVariants] = useState<VariantFormData[]>([]);
  const [originalMedia, setOriginalMedia] = useState<MediaFormData[]>([]);
  const [isBasicInfoValid, setIsBasicInfoValid] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch product data
  const { data: productResponse, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getProductById(productId!),
    enabled: !!productId,
  });

  // Initialize form data when product loads
  useEffect(() => {
    if (productResponse?.product) {
      const product = productResponse.product;
      setProductData({
        name: product.name,
        slug: product.slug || '',
        description: product.description || '',
        category_id: product.category_id,
        status: (product.status as 'draft' | 'published') || 'draft',
        price: product.price,
        compare_at_price: product.compare_at_price,
        sku: product.sku || '',
        discount: product.discount,
      });

      // Set variants from response
      if (productResponse.variants) {
        const variantsData = productResponse.variants.map(v => ({
          id: v.id,
          product_id: v.product_id,
          size: v.size,
          color: v.color,
          stock: v.stock,
          additional_price: v.additional_price,
        }));
        setVariants(variantsData);
        setOriginalVariants(variantsData);
      }

      // Set media from response
      if (productResponse.media) {
        const mediaData = productResponse.media.map((m, index) => ({
          id: m.id,
          url: m.url,
          is_primary: m.is_primary,
          display_order: index,
          alt_text: '',
        }));
        setMedia(mediaData);
        setOriginalMedia(mediaData);
      }
    }
  }, [productResponse]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges || !productData || !productId) return;

    const autoSaveTimer = setTimeout(() => {
      handleSaveDraft();
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [productData, variants, media, hasUnsavedChanges, productId]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const updateProductMutation = useMutation({
    mutationFn: async (data: {
      productData: ProductBasicInfoFormData;
      status: 'draft' | 'published';
      variants: VariantFormData[];
      media: MediaFormData[];
      originalVariants: VariantFormData[];
      originalMedia: MediaFormData[];
    }) => {
      // Step 1: Update product basic info
      const response = await productsApi.updateProduct(productId!, {
        ...data.productData,
        status: data.status,
      });

      // Step 2: Sync variants
      const originalVariantIds = data.originalVariants.map(v => v.id).filter(Boolean);
      const currentVariantIds = data.variants.map(v => v.id).filter(Boolean);

      // Delete removed variants
      const variantsToDelete = originalVariantIds.filter(id => !currentVariantIds.includes(id));
      await Promise.all(variantsToDelete.map(id => productsApi.deleteVariant(id!)));

      // Add new or update existing variants
      await Promise.all(
        data.variants.map(async (variant) => {
          if (variant.id) {
            // Update existing variant
            return productsApi.updateVariant(variant.id, {
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
              additional_price: variant.additional_price,
            });
          } else {
            // Add new variant
            return productsApi.addVariant(productId!, variant);
          }
        })
      );

      // Step 3: Sync media
      const originalMediaIds = data.originalMedia.map(m => m.id).filter(Boolean);
      const currentMediaIds = data.media.map(m => m.id).filter(Boolean);

      // Delete removed media
      const mediaToDelete = originalMediaIds.filter(id => !currentMediaIds.includes(id));
      await Promise.all(mediaToDelete.map(id => productsApi.deleteMedia(id!)));

      // Add new media
      const newMedia = data.media.filter(m => !m.id);
      await Promise.all(
        newMedia.map(mediaItem =>
          productsApi.addProductMedia(productId!, mediaItem.url, mediaItem.is_primary)
        )
      );

      // Update primary media if changed
      const primaryMedia = data.media.find(m => m.is_primary && m.id);
      if (primaryMedia?.id) {
        await productsApi.setPrimaryMedia(primaryMedia.id);
      }

      return response;
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    },
    onError: (error: any) => {
      setErrorMessage(error?.message || 'Failed to update product. Please try again.');
    },
  });

  const handleBasicInfoChange = (data: ProductBasicInfoFormData) => {
    setProductData(data);
    setHasUnsavedChanges(true);
  };

  const handleBasicInfoValidationChange = (isValid: boolean) => {
    setIsBasicInfoValid(isValid);
  };

  const handleVariantsChange = (newVariants: VariantFormData[]) => {
    setVariants(newVariants);
    setHasUnsavedChanges(true);
  };

  const handleMediaChange = (newMedia: MediaFormData[]) => {
    setMedia(newMedia);
    setHasUnsavedChanges(true);
  };

  const handleSaveDraft = () => {
    if (!productData || !isBasicInfoValid || !productId) {
      setErrorMessage('Please fill in all required fields in the Basic Information tab.');
      setCurrentTab(0);
      return;
    }

    updateProductMutation.mutate({
      productData,
      status: 'draft',
      variants,
      media,
      originalVariants,
      originalMedia,
    });
  };

  const handlePublish = () => {
    if (!productData || !isBasicInfoValid || !productId) {
      setErrorMessage('Please fill in all required fields in the Basic Information tab.');
      setCurrentTab(0);
      return;
    }

    updateProductMutation.mutate({
      productData,
      status: 'published',
      variants,
      media,
      originalVariants,
      originalMedia,
    });
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate('/products');
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!productResponse?.product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Product
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update product information
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Basic Information" />
          <Tab label="Variants" disabled={!isBasicInfoValid} />
          <Tab label="Media" disabled={!isBasicInfoValid} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={currentTab} index={0}>
            {productData && (
              <ProductForm
                initialData={productData}
                onDataChange={handleBasicInfoChange}
                onValidationChange={handleBasicInfoValidationChange}
              />
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <ProductVariantsTab
              variants={variants}
              onVariantsChange={handleVariantsChange}
            />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <ProductMediaTab
              media={media}
              onMediaChange={handleMediaChange}
              productId={productId}
            />
          </TabPanel>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={handleCancel} disabled={updateProductMutation.isPending}>
          Cancel
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveDraft}
            disabled={!isBasicInfoValid || updateProductMutation.isPending}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={handlePublish}
            disabled={!isBasicInfoValid || updateProductMutation.isPending}
          >
            {updateProductMutation.isPending ? 'Publishing...' : 'Publish'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSuccessMessage(false)}>
          Product updated successfully! Redirecting...
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
