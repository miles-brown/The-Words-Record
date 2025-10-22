/**
 * Authenticated Fetch Utility
 * Provides helper functions for making authenticated API requests from the frontend
 */

interface AuthFetchOptions extends RequestInit {
  headers?: HeadersInit
}

/**
 * Makes an authenticated fetch request with JWT token from localStorage
 * Automatically includes Authorization header and handles 401 responses
 */
export async function authFetch(url: string, options: AuthFetchOptions = {}): Promise<Response> {
  const token = localStorage.getItem('authToken')

  if (!token) {
    // Redirect to login if no token
    window.location.href = '/admin/login'
    throw new Error('No authentication token found')
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers
  })

  // Handle 401 by clearing token and redirecting to login
  if (response.status === 401) {
    localStorage.removeItem('authToken')
    window.location.href = '/admin/login'
    throw new Error('Authentication failed')
  }

  return response
}

/**
 * Gets the current auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken')
}

/**
 * Stores the auth token in localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token)
}

/**
 * Removes the auth token from localStorage
 */
export function clearAuthToken(): void {
  localStorage.removeItem('authToken')
}

/**
 * Checks if a valid token exists in localStorage
 */
export function hasAuthToken(): boolean {
  return !!localStorage.getItem('authToken')
}
