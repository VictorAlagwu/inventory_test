import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ message, actionLabel, onAction }: EmptyStateProps) => (
  <Box className="flex flex-col items-center justify-center py-16 text-gray-400">
    <InboxIcon sx={{ fontSize: 48, mb: 2, color: 'inherit' }} />
    <Typography color="text.secondary" sx={{ mb: 2 }}>
      {message}
    </Typography>
    {actionLabel && onAction && (
      <Button variant="contained" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </Box>
);
