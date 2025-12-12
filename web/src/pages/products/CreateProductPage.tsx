import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { Save as SaveIcon, Publish as PublishIcon } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
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

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [productData, setProductData] = useState<ProductBasicInfoFormData | null>(null);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [media, setMedia] = useState<MediaFormData[]>([]);
  const [isBasicInfoValid, setIsBasicInfoValid] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges || !productData) return;

    const autoSaveTimer = setTimeout(() => {
      handleSaveDraft();
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [productData, variants, media, hasUnsavedChanges]);

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

  const createProductMutation = useMutation({
    mutationFn: async (data: { productData: ProductBasicInfoFormData; status: 'draft' | 'published'; variants: VariantFormData[]; media: MediaFormData[] }) => {
      // Step 1: Create product
      const response = await productsApi.createProduct({
        ...data.productData,
        status: data.status,
      });

      const productId = response.product.id;

      // Step 2: Add variants if any
      if (data.variants.length > 0) {
        await Promise.all(
          data.variants.map(variant =>
            productsApi.addVariant(productId, variant)
          )
        );
      }

      // Step 3: Add media if any
      if (data.media.length > 0) {
        await Promise.all(
          data.media.map(mediaItem =>
            productsApi.addProductMedia(productId, mediaItem.url, mediaItem.is_primary)
          )
        );
      }

      return response;
    },
    onSuccess: (data) => {
      setHasUnsavedChanges(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    },
    onError: (error: any) => {
      setErrorMessage(error?.message || 'Failed to create product. Please try again.');
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
    if (!productData || !isBasicInfoValid) {
      setErrorMessage('Please fill in all required fields in the Basic Information tab.');
      setCurrentTab(0);
      return;
    }

    createProductMutation.mutate({
      productData,
      status: 'draft',
      variants,
      media,
    });
  };

  const handlePublish = () => {
    if (!productData || !isBasicInfoValid) {
      setErrorMessage('Please fill in all required fields in the Basic Information tab.');
      setCurrentTab(0);
      return;
    }

    createProductMutation.mutate({
      productData,
      status: 'published',
      variants,
      media,
    });
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate('/products');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Product
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new product to your catalog
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
            <ProductForm
              onDataChange={handleBasicInfoChange}
              onValidationChange={handleBasicInfoValidationChange}
            />
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
            />
          </TabPanel>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={handleCancel} disabled={createProductMutation.isPending}>
          Cancel
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveDraft}
            disabled={!isBasicInfoValid || createProductMutation.isPending}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={handlePublish}
            disabled={!isBasicInfoValid || createProductMutation.isPending}
          >
            {createProductMutation.isPending ? 'Publishing...' : 'Publish'}
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
          Product created successfully! Redirecting...
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
