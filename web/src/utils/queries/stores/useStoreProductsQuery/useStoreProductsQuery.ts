import { useQuery } from '@tanstack/react-query';

import { getStoreProductsRequest } from 'common/api/stores.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { storesKeys } from 'utils/queries/stores/keys';
import type { ProductWithQuantity } from 'common/types/store';
import type { SuccessResponse } from 'common/types/api';

type Response = SuccessResponse<ProductWithQuantity[]>;

export const useStoreProductsQuery = (storeId?: number) => {
  return useQuery<Response, Error>({
    queryKey: [...storesKeys.singleStore(String(storeId)), 'products'],
    queryFn: () => getStoreProductsRequest(storeId!).then(getDataFromResponse),
    enabled: !!storeId
  });
};
