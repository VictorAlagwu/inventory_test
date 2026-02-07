import { createQueryKeys } from 'utils/react-query-utils';

export const storesKeys = createQueryKeys('stores', createKey => ({
  singleStore: (storeId?: string) => createKey(storeId, 'single-store')
}));