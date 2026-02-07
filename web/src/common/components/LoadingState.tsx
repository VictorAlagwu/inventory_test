import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = 'Loading...' }: LoadingStateProps) => (
  <Box className="flex flex-col items-center justify-center py-16">
    <CircularProgress size={40} />
    <Typography color="text.secondary" sx={{ mt: 2 }}>
      {message}
    </Typography>
  </Box>
);
