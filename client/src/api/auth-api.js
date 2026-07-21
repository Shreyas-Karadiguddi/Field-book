import { apiClient } from '@/lib/api-client';

export async function login({ email, password }) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data.data;
}

export async function register({ name, email, password, mobile }) {
  const { data } = await apiClient.post('/auth/register', { name, email, password, mobile });
  return data.data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}
