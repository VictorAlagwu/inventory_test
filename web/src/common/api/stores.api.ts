import type { NewStore, UpdatedStore, StoreProductPayload } from 'common/types/store';
import { client } from '../../api';

export const getStoresRequest = (name?: string) => {
  const qs = name ? `?name=${encodeURIComponent(name)}` : '';
  return client.get(`/stores${qs}`);
};

export const getStoreRequest = (id: number) =>
  client.get(`/stores/${id}`);

export const getStoreSummaryRequest = (id: number) =>
  client.get(`/stores/${id}/summary`);

export const createStoreRequest = (data: NewStore) =>
  client.post(`/stores`, data);

export const deleteStoreRequest = (id: number) =>
  client.delete(`/stores/${id}`);

export const updateStoreRequest = (id: number, data: UpdatedStore) =>
  client.put(`/stores/${id}`, data);

// Store-Product association endpoints
export const getStoreProductsRequest = (storeId: number) =>
  client.get(`/stores/${storeId}/products`);

export const addProductToStoreRequest = (storeId: number, data: StoreProductPayload) =>
  client.post(`/stores/${storeId}/products`, data);

export const updateStoreProductQuantityRequest = (storeId: number, productId: number, quantity: number) =>
  client.put(`/stores/${storeId}/products/${productId}`, { quantity });

export const removeProductFromStoreRequest = (storeId: number, productId: number) =>
  client.delete(`/stores/${storeId}/products/${productId}`);
