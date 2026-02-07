import { useQuery } from '@tanstack/react-query';

import { getProductRequest } from 'common/api/products.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { productsKeys } from 'utils/queries/products/keys';
import type { Product } from 'common/types/product';
import type { SuccessResponse } from 'common/types/api';

type ProductApiResponse = SuccessResponse<Product>;

export const useProductQuery = (productId?: number) => {
  return useQuery<ProductApiResponse, Error>({
    queryKey: productsKeys.singleProduct(String(productId)),
    queryFn: () => getProductRequest(productId!).then(getDataFromResponse),
    enabled: !!productId
  });
};
