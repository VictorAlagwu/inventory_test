import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { getDataFromResponse } from 'utils/react-query-utils';
import { ONE_MINUTE } from 'common/constants';
import { getProductsRequest } from 'common/api/products.api';
import { productsKeys } from 'utils/queries/products/keys';
import type { Product, ProductsQueryParams } from 'common/types/product';
import type { SuccessResponse, PaginatedData } from 'common/types/api';

type ProductsApiResponse = SuccessResponse<PaginatedData<Product>>;

export const useProductsQuery = (params?: ProductsQueryParams, enableStaleTime = true) => {
  return useQuery<ProductsApiResponse, Error>({
    queryKey: [...productsKeys.default, params],
    queryFn: () => getProductsRequest(params).then(getDataFromResponse),
    staleTime: enableStaleTime ? ONE_MINUTE : 0,
    placeholderData: keepPreviousData
  });
};
