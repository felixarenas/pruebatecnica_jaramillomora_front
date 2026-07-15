import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IApiResponse } from '../../models/api-response.interface';

export type ApiHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  context?: HttpContext;
  withCredentials?: boolean;
  /** Concatena `environment.apiUrl` cuando la URL es relativa. Por defecto: true. */
  useBaseUrl?: boolean;
  /** Desempaqueta `IApiResponse` y lanza error si `status` es false. Por defecto: true. */
  unwrapResponse?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  get<T>(url: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('GET', url, undefined, options);
  }

  post<T>(url: string, body?: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('POST', url, body, options);
  }

  put<T>(url: string, body?: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PUT', url, body, options);
  }

  patch<T>(url: string, body?: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PATCH', url, body, options);
  }

  delete<T>(url: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  /**
   * Ejecuta cualquier petición HTTP contra una ruta relativa del API o una URL absoluta.
   */
  request<T>(
    method: ApiHttpMethod,
    url: string,
    body?: unknown,
    options?: ApiRequestOptions,
  ): Observable<T> {
    const { useBaseUrl = true, unwrapResponse = true, ...httpOptions } = options ?? {};
    const resolvedUrl = this.resolveUrl(url, useBaseUrl);

    return this.http.request<IApiResponse<T> | T>(method, resolvedUrl, {
      ...httpOptions,
      body,
    }).pipe(
      map((response) => this.mapResponse<T>(response, unwrapResponse)),
    );
  }

  /**
   * Devuelve la respuesta completa del backend sin desempaquetar `datos`.
   */
  requestApi<T>(
    method: ApiHttpMethod,
    url: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, 'unwrapResponse'>,
  ): Observable<IApiResponse<T>> {
    return this.request<IApiResponse<T>>(method, url, body, {
      ...options,
      unwrapResponse: false,
    });
  }

  resolveUrl(url: string, useBaseUrl = true): string {
    if (!useBaseUrl || this.isAbsoluteUrl(url)) {
      return url;
    }

    const path = url.startsWith('/') ? url.slice(1) : url;
    return `${this.baseUrl}/${path}`;
  }

  private mapResponse<T>(response: IApiResponse<T> | T, unwrapResponse: boolean): T {
    if (!unwrapResponse || !this.isApiResponse(response)) {
      return response as T;
    }

    if (!response.status) {
      throw new Error(response.mensaje);
    }

    return response.datos as T;
  }

  private isAbsoluteUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }

  private isApiResponse<T>(value: unknown): value is IApiResponse<T> {
    return (
      typeof value === 'object' &&
      value !== null &&
      'codresp' in value &&
      'mensaje' in value &&
      'status' in value &&
      'datos' in value
    );
  }
}
