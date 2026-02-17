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
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

import { LoadingState } from 'common/components/LoadingState';
import { ErrorState } from 'common/components/ErrorState';
import { EmptyState } from 'common/components/EmptyState';
import { ConfirmDialog } from 'common/components/ConfirmDialog';
import { useStoresQuery } from 'utils/queries/stores';
import { useDeleteStoreMutation } from 'utils/queries/stores';
import { useDebounce } from 'common/hooks/useDebounce';

export const StoresListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError, error, refetch } = useStoresQuery(debouncedSearch || undefined);
  const deleteMutation = useDeleteStoreMutation();

  const stores = data?.data ?? [];

  const handleDelete = () => {
    if (deleteTarget === null) {
      return;
    }
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState message="Loading stores..." />;
    }
    if (isError) {
      return <ErrorState message={error?.message} onRetry={refetch} />;
    }

    if (stores.length === 0) {
      return (
        <EmptyState
          message="No stores found."
          actionLabel="Create Store"
          onAction={() => navigate('/stores/create')}
        />
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store) => (
              <TableRow
                key={store.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/stores/${store.id}`)}
              >
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.location ?? '—'}</TableCell>
                <TableCell>{store.description ?? '—'}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton size="small" onClick={() => navigate(`/stores/${store.id}`)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => navigate(`/stores/${store.id}/edit`)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(store.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" fontWeight={700}>
          Stores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/stores/create')}
        >
          New Store
        </Button>
      </div>

      <TextField
        placeholder="Search stores by name..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, width: 320 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      {renderContent()}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Store"
        message="Are you sure you want to delete this store? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
