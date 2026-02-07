import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { LoadingState } from 'common/components/LoadingState';
import { ErrorState } from 'common/components/ErrorState';
import { useStoreQuery, useCreateStoreMutation, useUpdateStoreMutation } from 'utils/queries/stores';

export const StoreFormPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const isEdit = !!storeId;
  const id = storeId ? Number(storeId) : undefined;

  const { data: storeData, isLoading } = useStoreQuery(id);
  const createMutation = useCreateStoreMutation();
  const updateMutation = useUpdateStoreMutation();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (storeData?.data) {
      const store = storeData.data;
      setName(store.name);
      setLocation(store.location ?? '');
      setDescription(store.description ?? '');
    }
  }, [storeData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.length > 100) newErrors.name = 'Name must be 100 characters or less';
    if (location.length > 200) newErrors.location = 'Location must be 200 characters or less';
    if (description.length > 500) newErrors.description = 'Description must be 500 characters or less';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      ...(location.trim() && { location: location.trim() }),
      ...(description.trim() && { description: description.trim() }),
    };

    if (isEdit && id) {
      updateMutation.mutate(
        { id, data: payload },
        { onSuccess: () => navigate(`/stores/${id}`) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/stores'),
      });
    }
  };

  const mutation = isEdit ? updateMutation : createMutation;

  if (isEdit && isLoading) return <LoadingState message="Loading store..." />;
  if (isEdit && !isLoading && !storeData?.data) return <ErrorState message="Store not found." />;

  return (
    <div>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        {isEdit ? 'Edit Store' : 'Create Store'}
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
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            error={!!errors.location}
            helperText={errors.location}
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
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update Store' : 'Create Store'}
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
