import { useQuery } from '@tanstack/react-query';

import { getStoreSummaryRequest } from 'common/api/stores.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { storesKeys } from 'utils/queries/stores/keys';
import type { StoreWithSummary } from 'common/types/store';
import type { SuccessResponse } from 'common/types/api';

type Response = SuccessResponse<StoreWithSummary>;

export const useStoreSummaryQuery = (storeId?: number) => {
  return useQuery<Response, Error>({
    queryKey: [...storesKeys.singleStore(String(storeId)), 'summary'],
    queryFn: () => getStoreSummaryRequest(storeId!).then(getDataFromResponse),
    enabled: !!storeId
  });
};
