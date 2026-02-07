import { Routes, Route, Navigate } from 'react-router';
import { Layout } from 'common/components/Layout';
import { StoresListPage } from 'pages/stores/StoresListPage';
import { StoreDetailPage } from 'pages/stores/StoreDetailPage';
import { StoreFormPage } from 'pages/stores/StoreFormPage';
import { ProductsListPage } from 'pages/products/ProductsListPage';
import { ProductDetailPage } from 'pages/products/ProductDetailPage';
import { ProductFormPage } from 'pages/products/ProductFormPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/stores" replace />} />

        {/* Stores */}
        <Route path="/stores" element={<StoresListPage />} />
        <Route path="/stores/create" element={<StoreFormPage />} />
        <Route path="/stores/:storeId" element={<StoreDetailPage />} />
        <Route path="/stores/:storeId/edit" element={<StoreFormPage />} />

        {/* Products */}
        <Route path="/products" element={<ProductsListPage />} />
        <Route path="/products/create" element={<ProductFormPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/products/:productId/edit" element={<ProductFormPage />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/stores" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
