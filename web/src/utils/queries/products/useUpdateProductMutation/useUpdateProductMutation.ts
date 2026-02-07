import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdatedProduct } from 'common/types/product';
import { updateProductRequest } from 'common/api/products.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { productsKeys } from 'utils/queries/products/keys';

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatedProduct }) =>
      updateProductRequest(id, data).then(getDataFromResponse),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsKeys.default })
  });
};
