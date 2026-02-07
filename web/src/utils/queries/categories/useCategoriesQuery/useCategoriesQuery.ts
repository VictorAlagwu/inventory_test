import { useQuery } from '@tanstack/react-query';

import { getDataFromResponse } from 'utils/react-query-utils';
import { ONE_MINUTE } from 'common/constants';
import { getCategoriesRequest } from 'common/api/categories.api';
import { categoriesKeys } from 'utils/queries/categories/keys';
import type { SuccessResponse } from 'common/types/api';

interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

type CategoriesApiResponse = SuccessResponse<Category[]>;

export const useCategoriesQuery = () => {
  return useQuery<CategoriesApiResponse, Error>({
    queryKey: categoriesKeys.default,
    queryFn: () => getCategoriesRequest().then(getDataFromResponse),
    staleTime: ONE_MINUTE * 5,
  });
};
