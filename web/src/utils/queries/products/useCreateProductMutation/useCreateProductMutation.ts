import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { NewProduct } from 'common/types/product';
import { createProductRequest } from 'common/api/products.api';
import { getDataFromResponse } from 'utils/react-query-utils';
import { productsKeys } from 'utils/queries/products/keys';

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: NewProduct) => createProductRequest(product).then(getDataFromResponse),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsKeys.default })
  });
};
