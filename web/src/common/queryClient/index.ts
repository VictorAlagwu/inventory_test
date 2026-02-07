import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { IS_PROD_ENV } from 'common/constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, err) => {
        if (!IS_PROD_ENV) {
          return false;
        }
        const error = err as AxiosError;

        if (error.isAxiosError && error.response) {
          const errStatus = error.response?.status;

          const isErrorWithInRequestErrorsRange =
            errStatus >= 400 && errStatus < 500;

          if (isErrorWithInRequestErrorsRange) {
            return false;
          }
        }
        return failureCount <= 3;
      },

      refetchOnWindowFocus: IS_PROD_ENV
    }
  }
});