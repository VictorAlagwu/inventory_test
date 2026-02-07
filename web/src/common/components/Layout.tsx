import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InventoryIcon from '@mui/icons-material/Inventory';

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Box className="min-h-screen bg-gray-50">
      <AppBar position="static" sx={{ bgcolor: '#000223' }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ cursor: 'pointer', mr: 4, fontWeight: 700 }}
            onClick={() => navigate('/stores')}
          >
            Tiny Inventory
          </Typography>
          <Button
            color="inherit"
            startIcon={<StorefrontIcon />}
            onClick={() => navigate('/stores')}
            sx={{
              fontWeight: isActive('/stores') ? 700 : 400,
              borderBottom: isActive('/stores') ? '2px solid white' : 'none',
              borderRadius: 0,
            }}
          >
            Stores
          </Button>
          <Button
            color="inherit"
            startIcon={<InventoryIcon />}
            onClick={() => navigate('/products')}
            sx={{
              fontWeight: isActive('/products') ? 700 : 400,
              borderBottom: isActive('/products') ? '2px solid white' : 'none',
              borderRadius: 0,
            }}
          >
            Products
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};
