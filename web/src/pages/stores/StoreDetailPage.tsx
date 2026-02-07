import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Box,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { LoadingState } from 'common/components/LoadingState';
import { ErrorState } from 'common/components/ErrorState';
import { EmptyState } from 'common/components/EmptyState';
import { ConfirmDialog } from 'common/components/ConfirmDialog';
import { useStoreSummaryQuery, useStoreProductsQuery, useAddProductToStoreMutation, useRemoveStoreProductMutation } from 'utils/queries/stores';
import { useDeleteStoreMutation } from 'utils/queries/stores';
import { useProductsQuery } from 'utils/queries/products';
import { LOW_STOCK_THRESHOLD } from 'common/constants';

export const StoreDetailPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const id = storeId ? Number(storeId) : undefined;

  const { data: summaryData, isLoading, isError, error, refetch } = useStoreSummaryQuery(id);
  const { data: productsData } = useStoreProductsQuery(id);
  const { data: allProductsData } = useProductsQuery({ limit: 100 });
  const addProductMutation = useAddProductToStoreMutation(id!);
  const removeProductMutation = useRemoveStoreProductMutation(id!);
  const deleteMutation = useDeleteStoreMutation();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [removeTarget, setRemoveTarget] = useState<number | null>(null);
  const [showDeleteStore, setShowDeleteStore] = useState(false);

  const store = summaryData?.data;
  const storeProducts = productsData?.data ?? [];
  const allProducts = allProductsData?.data?.items ?? [];

  // Products not already in this store
  const availableProducts = allProducts.filter(
    (p) => !storeProducts.some((sp) => sp.id === p.id)
  );

  const handleAddProduct = () => {
    if (!selectedProductId || !quantity) return;
    addProductMutation.mutate(
      { productId: selectedProductId, quantity: parseInt(quantity, 10) },
      {
        onSuccess: () => {
          setShowAddDialog(false);
          setSelectedProductId(null);
          setQuantity('1');
        },
      }
    );
  };

  const handleRemoveProduct = () => {
    if (removeTarget === null) return;
    removeProductMutation.mutate(removeTarget, {
      onSuccess: () => setRemoveTarget(null),
    });
  };

  const handleDeleteStore = () => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => navigate('/stores'),
    });
  };

  if (isLoading) return <LoadingState message="Loading store details..." />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
  if (!store) return <ErrorState message="Store not found." />;

  return (
    <div>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/stores')} sx={{ mb: 2 }}>
        Back to Stores
      </Button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <Typography variant="h4" fontWeight={700}>
            {store.name}
          </Typography>
          {store.location && (
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {store.location}
            </Typography>
          )}
          {store.description && (
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {store.description}
            </Typography>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/stores/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setShowDeleteStore(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" variant="body2">Total Products</Typography>
            <Typography variant="h4" fontWeight={700}>{store.summary.totalProducts}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" variant="body2">Inventory Value</Typography>
            <Typography variant="h4" fontWeight={700}>
              ${store.summary.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" variant="body2">Low Stock Items</Typography>
            <Box className="flex items-center gap-2">
              <Typography variant="h4" fontWeight={700}>{store.summary.lowStockCount}</Typography>
              {store.summary.lowStockCount > 0 && <WarningAmberIcon color="warning" />}
            </Box>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h6" fontWeight={600}>Products in Store</Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setShowAddDialog(true)}>
          Add Product
        </Button>
      </div>

      {storeProducts.length === 0 ? (
        <EmptyState message="No products in this store yet." actionLabel="Add Product" onAction={() => setShowAddDialog(true)} />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Stock Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {storeProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.name}
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    {product.quantity < LOW_STOCK_THRESHOLD ? (
                      <Chip label="Low Stock" color="warning" size="small" />
                    ) : (
                      <Chip label="In Stock" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => setRemoveTarget(product.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Product to Store</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={availableProducts}
            getOptionLabel={(option) => `${option.name} — $${option.price.toFixed(2)}`}
            onChange={(_, value) => setSelectedProductId(value?.id ?? null)}
            renderInput={(params) => <TextField {...params} label="Select Product" margin="normal" />}
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            slotProps={{ htmlInput: { min: 0 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddProduct}
            disabled={!selectedProductId || !quantity || addProductMutation.isPending}
          >
            {addProductMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Product Confirm */}
      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove Product"
        message="Remove this product from the store?"
        confirmLabel="Remove"
        onConfirm={handleRemoveProduct}
        onCancel={() => setRemoveTarget(null)}
        loading={removeProductMutation.isPending}
      />

      {/* Delete Store Confirm */}
      <ConfirmDialog
        open={showDeleteStore}
        title="Delete Store"
        message="Are you sure you want to delete this store? All product associations will be removed."
        onConfirm={handleDeleteStore}
        onCancel={() => setShowDeleteStore(false)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
