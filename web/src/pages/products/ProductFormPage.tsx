import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { LoadingState } from 'common/components/LoadingState';
import { ErrorState } from 'common/components/ErrorState';
import { useProductQuery, useCreateProductMutation, useUpdateProductMutation } from 'utils/queries/products';
import { useCategoriesQuery } from 'utils/queries/categories';

export const ProductFormPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isEdit = !!productId;
  const id = productId ? Number(productId) : undefined;

  const { data: productData, isLoading } = useProductQuery(id);
  const { data: categoriesData } = useCategoriesQuery();
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();

  const categories = categoriesData?.data ?? [];

  const product = productData?.data;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initializedFrom, setInitializedFrom] = useState<number | undefined>(undefined);

  if (product && initializedFrom !== product.id) {
    setInitializedFrom(product.id);
    setName(product.name);
    setDescription(product.description ?? '');
    setCategoryId(product.category_id);
    setPrice(String(product.price));
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.length > 200) newErrors.name = 'Name must be 200 characters or less';
    if (description.length > 1000) newErrors.description = 'Description must be 1000 characters or less';
    if (!categoryId) newErrors.categoryId = 'Category is required';
    if (!price) newErrors.price = 'Price is required';
    else if (parseFloat(price) <= 0) newErrors.price = 'Price must be positive';
    else if (parseFloat(price) > 999999.99) newErrors.price = 'Price must be less than 1,000,000';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      categoryId: categoryId as number,
      price: parseFloat(price),
      ...(description.trim() && { description: description.trim() }),
    };

    if (isEdit && id) {
      updateMutation.mutate(
        { id, data: payload },
        { onSuccess: () => navigate(`/products/${id}`) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/products'),
      });
    }
  };

  const mutation = isEdit ? updateMutation : createMutation;

  if (isEdit && isLoading) return <LoadingState message="Loading product..." />;
  if (isEdit && !isLoading && !product) return <ErrorState message="Product not found." />;

  return (
    <div>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        {isEdit ? 'Edit Product' : 'Create Product'}
      </Typography>

      <Paper variant="outlined" sx={{ p: 4, maxWidth: 600 }}>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {(mutation.error as Error)?.message || 'An error occurred. Please try again.'}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            fullWidth
            required
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />

          <FormControl fullWidth margin="normal" required error={!!errors.categoryId}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId}
              label="Category"
              onChange={(e) => setCategoryId(e.target.value as number)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
            {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
          </FormControl>

          <TextField
            label="Price"
            type="number"
            fullWidth
            required
            margin="normal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={!!errors.price}
            helperText={errors.price}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />

          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
          />

          <div className="flex gap-3 mt-6">
            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};
