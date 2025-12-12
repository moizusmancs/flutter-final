import { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import FilterListIcon from '@mui/icons-material/FilterList';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import ProductsTable from '../../components/products/ProductsTable';
import type { ProductFilters } from '../../types/product.types';

export default function ProductsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'out_of_stock' | ''>('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(0); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Build filters
  const filters: ProductFilters = {
    page: page + 1, // Backend expects 1-indexed pages
    limit: pageSize,
    ...(searchDebounced && { search: searchDebounced }),
    ...(categoryFilter && { category_id: categoryFilter as number }),
    ...(statusFilter && { status: statusFilter }),
  };

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', filters, sortField, sortOrder],
    queryFn: () => productsApi.getProducts(filters),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
  });

  // Handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  }, []);

  const handleSortChange = useCallback((field: string, order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleCategoryChange = (event: SelectChangeEvent<number | ''>) => {
    setCategoryFilter(event.target.value as number | '');
    setPage(0);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as 'active' | 'inactive' | 'out_of_stock' | '');
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchDebounced('');
    setCategoryFilter('');
    setStatusFilter('');
    setPage(0);
  };

  const activeFiltersCount =
    (searchDebounced ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (statusFilter ? 1 : 0);

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <InventoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Products
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Manage your product inventory
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/products/create')}
              sx={{ borderRadius: 2 }}
            >
              Create Product
            </Button>
          </Box>

          {/* Filters */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr auto' },
              gap: 2,
              bgcolor: 'white',
              p: 2,
              borderRadius: 2,
              border: '1px solid #e5e7eb',
            }}
          >
            {/* Search */}
            <TextField
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Category Filter */}
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categoriesData?.categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>

            {/* Clear Filters */}
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              disabled={activeFiltersCount === 0}
              startIcon={<FilterListIcon />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Clear {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </Box>

          {/* Active Filters Chips */}
          {activeFiltersCount > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              {searchDebounced && (
                <Chip
                  label={`Search: ${searchDebounced}`}
                  onDelete={() => {
                    setSearch('');
                    setSearchDebounced('');
                  }}
                  size="small"
                />
              )}
              {categoryFilter && (
                <Chip
                  label={`Category: ${categoriesData?.categories.find((c) => c.id === categoryFilter)?.name}`}
                  onDelete={() => setCategoryFilter('')}
                  size="small"
                />
              )}
              {statusFilter && (
                <Chip
                  label={`Status: ${statusFilter.replace('_', ' ')}`}
                  onDelete={() => setStatusFilter('')}
                  size="small"
                />
              )}
            </Box>
          )}
        </Box>

        {/* Products Table */}
        <ProductsTable
          products={productsData?.products || []}
          loading={productsLoading}
          page={page}
          pageSize={pageSize}
          totalRows={productsData?.pagination?.total || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
          onDelete={handleDeleteClick}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
            Products with variants cannot be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending && <CircularProgress size={16} />}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
