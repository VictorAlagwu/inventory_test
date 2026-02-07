import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeProductFromStoreRequest } from 'common/api/stores.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { storesKeys } from 'utils/queries/stores/keys';

export const useRemoveStoreProductMutation = (storeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => removeProductFromStoreRequest(storeId, productId).then(getDataFromResponse),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storesKeys.singleStore(String(storeId)) })
  });
};
