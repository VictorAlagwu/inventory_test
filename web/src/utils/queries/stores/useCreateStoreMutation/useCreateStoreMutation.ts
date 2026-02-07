import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { NewStore } from 'common/types/store';
import { createStoreRequest } from 'common/api/stores.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { storesKeys } from 'utils/queries/stores/keys';

export const useCreateStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (store: NewStore) => createStoreRequest(store).then(getDataFromResponse),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storesKeys.default })
  });
};
