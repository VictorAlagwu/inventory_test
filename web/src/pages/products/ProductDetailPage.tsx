import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { LoadingState } from 'common/components/LoadingState';
import { ErrorState } from 'common/components/ErrorState';
import { EmptyState } from 'common/components/EmptyState';
import { ConfirmDialog } from 'common/components/ConfirmDialog';
import { useProductAvailabilityQuery, useDeleteProductMutation } from 'utils/queries/products';
import { LOW_STOCK_THRESHOLD } from 'common/constants';

export const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const id = productId ? Number(productId) : undefined;

  const { data, isLoading, isError, error, refetch } = useProductAvailabilityQuery(id);
  const deleteMutation = useDeleteProductMutation();
  const [showDelete, setShowDelete] = useState(false);

  const product = data?.data;

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => navigate('/products'),
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading product details..." />;
  }
  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }
  if (!product) {
    return <ErrorState message="Product not found." />;
  }

  return (
    <div>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/products')} sx={{ mb: 2 }}>
        Back to Products
      </Button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <Typography variant="h4" fontWeight={700}>
            {product.name}
          </Typography>
          <div className="flex items-center gap-2 mt-1">
            <Chip label={product.category.name} size="small" />
            <Typography variant="h6" color="primary" fontWeight={600}>
              ${product.price.toFixed(2)}
            </Typography>
          </div>
          {product.description && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {product.description}
            </Typography>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/products/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setShowDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Availability */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Store Availability
      </Typography>

      {product.availability.length === 0 ? (
        <EmptyState message="This product is not stocked in any store." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Store</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {product.availability.map((a) => (
                <TableRow
                  key={a.storeId}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/stores/${a.storeId}`)}
                >
                  <TableCell>{a.storeName}</TableCell>
                  <TableCell>{a.quantity}</TableCell>
                  <TableCell>
                    {a.quantity < LOW_STOCK_THRESHOLD ? (
                      <Chip label="Low Stock" color="warning" size="small" />
                    ) : (
                      <Chip label="In Stock" color="success" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Summary Card */}
      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography color="text.secondary" variant="body2">
            Total across all stores
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {product.availability.reduce((sum, a) => sum + a.quantity, 0)} units
          </Typography>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? It will be removed from all stores."
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
