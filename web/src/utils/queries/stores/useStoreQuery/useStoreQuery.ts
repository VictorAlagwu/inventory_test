import { useQuery } from '@tanstack/react-query';

import { getStoreRequest } from 'common/api/stores.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { storesKeys } from 'utils/queries/stores/keys';
import type { Store } from 'common/types/store';
import type { SuccessResponse } from 'common/types/api';

type StoreApiResponse = SuccessResponse<Store>;

export const useStoreQuery = (storeId?: number) => {
  return useQuery<StoreApiResponse, Error>({
    queryKey: storesKeys.singleStore(String(storeId)),
    queryFn: () => getStoreRequest(storeId!).then(getDataFromResponse),
    enabled: !!storeId
  });
};
