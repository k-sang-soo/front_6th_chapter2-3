import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 타입 정의
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

interface RequestOptions extends AxiosRequestConfig {
  skipErrorHandling?: boolean;
  retries?: number;
  cache?: boolean;
}

interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
}

class HttpClient {
  private client: AxiosInstance;
  private readonly cache = new Map<string, CacheItem>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분
  private readonly API_BASE_URL = '/api';

  constructor() {
    this.client = axios.create({
      baseURL: this.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        // 인증 토큰 자동 추가
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 로딩 상태 시작
        this.notifyLoading(true);
        return config;
      },
      (error: AxiosError) => {
        this.notifyLoading(false);
        return Promise.reject(error);
      },
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        this.notifyLoading(false);
        return response;
      },
      async (error: AxiosError) => {
        this.notifyLoading(false);

        // 401 에러 처리 (토큰 만료)
        if (error.response?.status === 401 && error.config) {
          try {
            await this.handleUnauthorized();
            // 원본 요청 재시도
            return this.client(error.config);
          } catch (refreshError) {
            this.redirectToLogin();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.normalizeError(error));
      },
    );
  }

  // 🚀 GET 메서드 (캐싱 지원)
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    const cacheKey = this.generateCacheKey('GET', url, options?.params);

    if (options?.cache && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data as T;
    }

    const response = await this.executeWithRetry<T>(
      () => this.client.get<ApiResponse<T>>(url, options),
      options?.retries,
    );

    const data = this.extractData(response);

    if (options?.cache) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  // 🔄 POST 메서드 (재시도 지원)
  async post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await this.executeWithRetry<T>(
      () => this.client.post<ApiResponse<T>>(url, data, options),
      options?.retries,
    );
    return this.extractData(response);
  }

  async put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, options);
    return this.extractData(response);
  }

  async patch<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, options);
    return this.extractData(response);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, options);
    return this.extractData(response);
  }

  // 🎯 파일 업로드 메서드
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return this.extractData(response);
  }

  // 요청 취소 가능한 GET 메서드
  getWithCancel<T>(url: string, options?: RequestOptions) {
    const abortController = new AbortController();

    const promise = this.get<T>(url, {
      ...options,
      signal: abortController.signal,
    });

    return {
      promise,
      cancel: (reason?: string) => abortController.abort(reason),
    };
  }

  // 🔧 헬퍼 메서드들
  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
    retries = 0,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    for (let i = 0; i <= retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === retries) throw error;

        // 재시도 불가능한 에러는 즉시 실패
        if (!this.isRetryableError(error)) {
          throw error;
        }

        await this.delay(1000 * Math.pow(2, i)); // 지수 백오프
      }
    }
    throw new Error('Max retries exceeded');
  }

  private isRetryableError(error: unknown): boolean {
    // 네트워크 오류, 타임아웃, 5xx 서버 에러만 재시도
    const axiosError = error as AxiosError;
    return (
      !axiosError.response ||
      axiosError.code === 'ECONNABORTED' ||
      axiosError.response?.status >= 500
    );
  }

  private generateCacheKey(method: string, url: string, params?: unknown): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? Date.now() - cached.timestamp < this.CACHE_DURATION : false;
  }

  private extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    // API 응답 구조에 따라 데이터 추출
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as ApiResponse<T>).data;
    }
    // 단순 데이터 구조인 경우
    return response.data as T;
  }

  private async handleUnauthorized(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // 토큰 갱신 API 호출
      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { accessToken, refreshToken: newRefreshToken } = await response.json();
      this.setAccessToken(accessToken);

      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken);
      }
    } catch (error) {
      this.clearAuthTokens();
      throw error;
    }
  }

  private normalizeError(error: AxiosError): Error {
    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data as Record<string, unknown>;
      if (typeof errorData.message === 'string') {
        return new Error(errorData.message);
      }
    }

    // 상태 코드별 기본 메시지
    if (error.response) {
      switch (error.response.status) {
        case 400:
          return new Error('잘못된 요청입니다.');
        case 401:
          return new Error('인증이 필요합니다.');
        case 403:
          return new Error('접근 권한이 없습니다.');
        case 404:
          return new Error('요청한 리소스를 찾을 수 없습니다.');
        case 500:
          return new Error('서버 오류가 발생했습니다.');
        default:
          return new Error(`오류가 발생했습니다. (${error.response.status})`);
      }
    } else if (error.request) {
      return new Error('네트워크 연결을 확인해주세요.');
    }

    return new Error('요청 처리 중 오류가 발생했습니다.');
  }

  private notifyLoading(isLoading: boolean): void {
    // 전역 로딩 상태 이벤트 발생
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api:loading', { detail: { isLoading } }));
    }
  }

  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 토큰 관리 메서드들
  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  private clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // 🎛️ 공개 유틸리티 메서드들
  clearCache(): void {
    this.cache.clear();
  }

  removeCacheByPattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 싱글톤 인스턴스
const httpClient = new HttpClient();

// 📦 강력한 API 인터페이스
export const http = {
  // 기본 HTTP 메서드들
  get: <T>(url: string, options?: RequestOptions) => httpClient.get<T>(url, options),

  post: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    httpClient.post<T>(url, data, options),

  put: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    httpClient.put<T>(url, data, options),

  patch: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    httpClient.patch<T>(url, data, options),

  delete: <T>(url: string, options?: RequestOptions) => httpClient.delete<T>(url, options),

  // 확장된 기능들
  upload: <T>(url: string, file: File, onProgress?: (progress: number) => void) =>
    httpClient.uploadFile<T>(url, file, onProgress),

  getWithCancel: <T>(url: string, options?: RequestOptions) =>
    httpClient.getWithCancel<T>(url, options),

  // 캐시 관리
  cache: {
    clear: () => httpClient.clearCache(),
    removeByPattern: (pattern: RegExp) => httpClient.removeCacheByPattern(pattern),
    getStats: () => httpClient.getCacheStats(),
  },
};

// 타입 내보내기
export type { RequestOptions, ApiResponse };

// 레거시 지원을 위한 기본 인스턴스도 유지
export const axiosInstance = httpClient['client'];
