import type { LoginRequest, TokenResponse, User, UserCreate, UserStatusUpdate } from '../types/user'
import { API_BASE } from './api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    localStorage.removeItem('token')
    throw new Error('SESSION_EXPIRED')
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `HTTP error ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function storeToken(token: string): void {
  localStorage.setItem('token', token)
}

export function removeToken(): void {
  localStorage.removeItem('token')
}

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  return handleResponse<TokenResponse>(response)
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE}/v1/users/me`, {
    headers: authHeaders(),
  })
  return handleResponse<User>(response)
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE}/v1/users`, {
    headers: authHeaders(),
  })
  return handleResponse<User[]>(response)
}

export async function createUser(user: UserCreate): Promise<User> {
  const response = await fetch(`${API_BASE}/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(user),
  })
  return handleResponse<User>(response)
}

export async function updateUserStatus(userId: string, update: UserStatusUpdate): Promise<User> {
  const response = await fetch(`${API_BASE}/v1/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(update),
  })
  return handleResponse<User>(response)
}
