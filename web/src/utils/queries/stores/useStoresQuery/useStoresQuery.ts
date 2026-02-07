import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { getDataFromResponse } from 'utils/react-query-utils';
import { ONE_MINUTE } from 'common/constants';
import { getStoresRequest } from 'common/api/stores.api';
import { storesKeys } from 'utils/queries/stores/keys';
import type { Store } from 'common/types/store';
import type { SuccessResponse } from 'common/types/api';

type StoresApiResponse = SuccessResponse<Store[]>;

export const useStoresQuery = (name?: string, enableStaleTime = true) => {
  return useQuery<StoresApiResponse, Error>({
    queryKey: [...storesKeys.default, name],
    queryFn: () => getStoresRequest(name).then(getDataFromResponse),
    staleTime: enableStaleTime ? ONE_MINUTE : 0,
    placeholderData: keepPreviousData
  });
};
