import { createQueryKeys } from 'utils/react-query-utils';

export const productsKeys = createQueryKeys('products', createKey => ({
  singleProduct: (productId?: string) => createKey(productId, 'single-product')
}));