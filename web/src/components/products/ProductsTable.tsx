import { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types/product.types';

interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
  onDelete: (id: number) => void;
}

export default function ProductsTable({
  products,
  loading,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onDelete,
}: ProductsTableProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, productId: number) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProductId(productId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProductId(null);
  };

  const handleEdit = () => {
    if (selectedProductId) {
      navigate(`/products/${selectedProductId}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedProductId) {
      onDelete(selectedProductId);
    }
    handleMenuClose();
  };

  const handleViewVariants = () => {
    if (selectedProductId) {
      navigate(`/products/${selectedProductId}/variants`);
    }
    handleMenuClose();
  };

  const handleRowClick = (params: any) => {
    navigate(`/products/${params.id}/edit`);
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (model.page !== page) {
      onPageChange(model.page);
    }
    if (model.pageSize !== pageSize) {
      onPageSizeChange(model.pageSize);
    }
  };

  const handleSortModelChange = (model: GridSortModel) => {
    if (model.length > 0) {
      const sortItem = model[0];
      onSortChange(sortItem.field, sortItem.sort as 'asc' | 'desc');
    }
  };

  const getStatusColor = (status: string): 'success' | 'default' | 'error' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'out_of_stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'image',
      headerName: 'Image',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: () => (
        <Avatar
          variant="rounded"
          sx={{ width: 50, height: 50, bgcolor: '#f3f4f6' }}
        >
          <InventoryIcon sx={{ color: '#9ca3af' }} />
        </Avatar>
      ),
    },
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'sku',
      headerName: 'SKU',
      width: 150,
    },
    {
      field: 'category_name',
      headerName: 'Category',
      width: 150,
      valueGetter: (value) => value || 'Uncategorized',
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      valueGetter: (value) => value ?? 0,
      renderCell: (params) => `$${Number(params.value || 0).toFixed(2)}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={(params.value || 'active').replace('_', ' ').toUpperCase()}
          color={getStatusColor(params.value || 'active')}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => handleMenuOpen(e, params.row.id)}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={totalRows}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 20, 50, 100]}
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnMenu
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: '#f9fafb',
            },
          }}
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleViewVariants}>
          <InventoryIcon sx={{ mr: 1, fontSize: 20 }} />
          View Variants
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
