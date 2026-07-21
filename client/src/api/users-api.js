import { apiClient } from '@/lib/api-client';

export async function fetchUsers(params = {}) {
  const { data } = await apiClient.get('/users', { params });
  return data.data;
}

export async function createUser(payload) {
  const { data } = await apiClient.post('/users', payload);
  return data.data;
}

export async function updateUser(id, payload) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data.data;
}

export async function activateUser(id) {
  const { data } = await apiClient.patch(`/users/${id}/activate`);
  return data.data;
}

export async function deactivateUser(id) {
  const { data } = await apiClient.patch(`/users/${id}/deactivate`);
  return data.data;
}
