import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteStoreRequest } from 'common/api/stores.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { storesKeys } from 'utils/queries/stores/keys';

export const useDeleteStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: number) => deleteStoreRequest(storeId).then(getDataFromResponse),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storesKeys.default })
  });
};
