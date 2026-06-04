// src/core/api/helper.ts
import type { AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/core/types/api.types'

/* -------------------------------------------------------------------------- */
/*                            Authenticated API helpers                        */
/* -------------------------------------------------------------------------- */

/**
 * GET request - returns full API response with status, code, message, and data
 * @example
 * & handle it store
 * const response = await get<MyType>('/endpoint')
 * if (response.code === 200) {
 *   const items = response.data
 * }
 */
export async function get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
  return (await authApi.get<ApiResponse<T>>(url, { params })).data
}

export async function getWithConfig<T>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const mergedParams = {
    ...(params as any),
    ...(config?.params as any),
  }

  const mergedConfig: AxiosRequestConfig = {
    ...config,
    params: mergedParams,
    headers: {
      ...config?.headers,
    },
  }

  return (await authApi.get<ApiResponse<T>>(url, mergedConfig)).data
}

/**
 * POST request - returns full API response
 */
export async function post<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (await authApi.post<ApiResponse<T>>(url, data, config)).data
}

/**
 * PUT request - returns full API response
 */
export async function put<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (await authApi.put<ApiResponse<T>>(url, data, config)).data
}

/**
 * DELETE request - returns full API response
 */
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return (await authApi.delete<ApiResponse<T>>(url, config)).data
}

/**
 * PATCH request - returns full API response
 */
export async function patch<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (await authApi.patch<ApiResponse<T>>(url, data, config)).data
}

/* -------------------------------------------------------------------------- */
/*                            Public API helpers                               */
/* -------------------------------------------------------------------------- */
export async function getFullResponse<T>(url: string, params?: any): Promise<ApiResponse<T>> {
  return (await authApi.get<ApiResponse<T>>(url, { params })).data
}

export async function postFullResponse<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (await authApi.post<ApiResponse<T>>(url, data, config)).data
}

export async function putFullResponse<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (await authApi.put<ApiResponse<T>>(url, data, config)).data
}
export async function patchFullResponse<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (await authApi.patch<ApiResponse<T>>(url, data, config)).data
}

export async function delFullResponse<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (await authApi.delete<ApiResponse<T>>(url, config)).data
}

/* -------------------------------------------------------------------------- */
/*                            Public API helpers                               */
/* -------------------------------------------------------------------------- */

export async function publicGet<T>(url: string, params?: any): Promise<T> {
  return (await publicApi.get<ApiResponse<T>>(url, { params })).data.data
}

export async function publicPost<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  return (await publicApi.post<ApiResponse<T>>(url, data, config)).data.data
}
