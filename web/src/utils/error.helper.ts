import { isAxiosError } from 'axios';

import { HTTPStatusCodes } from 'common/constants';

export function is401UnauthorizedError(error: any): boolean {
  return (
    isAxiosError(error) &&
    error.response?.status === HTTPStatusCodes.UNAUTHORIZED
  );
}

export function is409ConflictError(error: any): boolean {
  return (
    isAxiosError(error) && error.response?.status === HTTPStatusCodes.CONFLICT
  );
}
export function is412PreConditionError(error: any): boolean {
  return (
    isAxiosError(error) &&
    error.response?.status === HTTPStatusCodes.PRECONDITION_FAILED
  );
}

export function is404NotAvailable(error: any): boolean {
  return (
    isAxiosError(error) && error.response?.status === HTTPStatusCodes.NOT_FOUND
  );
}
