import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProductRequest } from 'common/api/products.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { productsKeys } from 'utils/queries/products/keys';

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => deleteProductRequest(productId).then(getDataFromResponse),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsKeys.default })
  });
};
