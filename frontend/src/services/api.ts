const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface RequestOptions extends RequestInit {
  body?: any;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

export const apiFetch = async (path: string, options: RequestOptions = {}): Promise<any> => {
  const headers = new Headers(options.headers || {});
  
  // Inject access token if exists
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Set Content-Type unless it is a FormData upload
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData) 
      ? JSON.stringify(options.body) 
      : options.body,
  };

  const response = await fetch(`${BASE_URL}${path}`, fetchOptions);

  // If token is expired or unauthorized, attempt refresh
  if ((response.status === 401 || response.status === 403) && path !== '/auth/login' && path !== '/auth/register') {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      handleAuthFailure();
      throw new Error('Unauthorized');
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          isRefreshing = false;
          onRefreshed(data.accessToken);
        } else {
          isRefreshing = false;
          handleAuthFailure();
          throw new Error('Refresh token expired');
        }
      } catch (err) {
        isRefreshing = false;
        handleAuthFailure();
        throw err;
      }
    }

    // Wait for the token refresh to finish
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        headers.set('Authorization', `Bearer ${newToken}`);
        resolve(
          fetch(`${BASE_URL}${path}`, {
            ...fetchOptions,
            headers,
          }).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
        );
      });
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses (like logout or delete)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const handleAuthFailure = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  // Dispatch custom event to let the Zustand store know
  window.dispatchEvent(new Event('auth-failure'));
};
