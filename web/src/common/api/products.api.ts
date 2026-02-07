import type { NewProduct, UpdatedProduct, ProductsQueryParams } from 'common/types/product';
import { client } from '../../api';

export const getProductsRequest = (params?: ProductsQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
  }
  const qs = searchParams.toString();
  return client.get(`/products${qs ? `?${qs}` : ''}`);
};

export const getProductRequest = (id: number) =>
  client.get(`/products/${id}`);

export const getProductAvailabilityRequest = (id: number) =>
  client.get(`/products/${id}/availability`);

export const createProductRequest = (data: NewProduct) =>
  client.post(`/products`, data);

export const deleteProductRequest = (id: number) =>
  client.delete(`/products/${id}`);

export const updateProductRequest = (id: number, data: UpdatedProduct) =>
  client.put(`/products/${id}`, data);
