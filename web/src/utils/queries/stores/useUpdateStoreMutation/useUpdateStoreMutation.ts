import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdatedStore } from 'common/types/store';
import { updateStoreRequest } from 'common/api/stores.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { storesKeys } from 'utils/queries/stores/keys';

export const useUpdateStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatedStore }) =>
      updateStoreRequest(id, data).then(getDataFromResponse),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storesKeys.default })
  });
};
