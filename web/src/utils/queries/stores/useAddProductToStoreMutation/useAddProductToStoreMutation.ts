import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addProductToStoreRequest } from 'common/api/stores.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { storesKeys } from 'utils/queries/stores/keys';
import type { StoreProductPayload } from 'common/types/store';

export const useAddProductToStoreMutation = (storeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreProductPayload) => addProductToStoreRequest(storeId, data).then(getDataFromResponse),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storesKeys.singleStore(String(storeId)) })
  });
};
