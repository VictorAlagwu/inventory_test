import { useQuery } from '@tanstack/react-query';

import { getProductAvailabilityRequest } from 'common/api/products.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { productsKeys } from 'utils/queries/products/keys';
import type { ProductWithAvailability } from 'common/types/product';
import type { SuccessResponse } from 'common/types/api';

type Response = SuccessResponse<ProductWithAvailability>;

export const useProductAvailabilityQuery = (productId?: number) => {
  return useQuery<Response, Error>({
    queryKey: [...productsKeys.singleProduct(String(productId)), 'availability'],
    queryFn: () => getProductAvailabilityRequest(productId!).then(getDataFromResponse),
    enabled: !!productId
  });
};
