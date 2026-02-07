/**
 * JSend response helpers
 * Spec: https://github.com/omniti-labs/jsend
 *
 * Three response types:
 * - success: All went well, data contains result
 * - fail: Problem with the data submitted (client error, 4xx)
 * - error: Server error (5xx)
 */

export interface JSendSuccess<T = unknown> {
  status: 'success';
  data: T;
}

export interface JSendFail<T = unknown> {
  status: 'fail';
  data: T;
}

export interface JSendError {
  status: 'error';
  message: string;
  code?: string;
  data?: unknown;
}

export type JSendResponse<T = unknown> = JSendSuccess<T> | JSendFail<T> | JSendError;

export function success<T>(data: T): JSendSuccess<T> {
  return { status: 'success', data };
}

export function fail<T>(data: T): JSendFail<T> {
  return { status: 'fail', data };
}

export function error(message: string, code?: string, data?: unknown): JSendError {
  const response: JSendError = { status: 'error', message };
  if (code !== undefined) response.code = code;
  if (data !== undefined) response.data = data;
  return response;
}
