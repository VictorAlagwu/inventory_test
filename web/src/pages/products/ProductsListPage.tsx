import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { LoadingState } from 'common/components/LoadingState';
import { ErrorState } from 'common/components/ErrorState';
import { EmptyState } from 'common/components/EmptyState';
import { ConfirmDialog } from 'common/components/ConfirmDialog';
import { useProductsQuery, useDeleteProductMutation } from 'utils/queries/products';
import { useCategoriesQuery } from 'utils/queries/categories';
import type { ProductsQueryParams } from 'common/types/product';

export const ProductsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const params: ProductsQueryParams = {
    page: page + 1,
    limit: rowsPerPage,
    ...(categoryId && { categoryId: categoryId as number }),
    ...(minPrice && { minPrice: parseFloat(minPrice) }),
    ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
  };

  const { data, isLoading, isError, error, refetch } = useProductsQuery(params);
  const { data: categoriesData } = useCategoriesQuery();
  const deleteMutation = useDeleteProductMutation();

  const categories = categoriesData?.data ?? [];

  const products = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  const handleDelete = () => {
    if (deleteTarget === null) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const renderContent = () => {
    if (isLoading) return <LoadingState message="Loading products..." />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

    if (products.length === 0) {
      return (
        <EmptyState
          message="No products found."
          actionLabel="Create Product"
          onAction={() => navigate('/products/create')}
        />
      );
    }

    return (
      <>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => navigate(`/products/${product.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/products/${product.id}/edit`)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(product.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" fontWeight={700}>
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/create')}
        >
          New Product
        </Button>
      </div>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <div className="flex flex-wrap gap-3 items-end">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId}
              label="Category"
              onChange={(e) => {
                setCategoryId(e.target.value as number | '');
                setPage(0);
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Min Price"
            type="number"
            size="small"
            sx={{ width: 120 }}
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(0); }}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />
          <TextField
            label="Max Price"
            type="number"
            size="small"
            sx={{ width: 120 }}
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(0); }}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />
          <Button
            size="small"
            onClick={() => {
              setCategoryId('');
              setMinPrice('');
              setMaxPrice('');
              setPage(0);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Paper>

      {renderContent()}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
