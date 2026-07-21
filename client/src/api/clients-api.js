import { apiClient } from '@/lib/api-client';

export async function fetchClients(params = {}) {
  const { data } = await apiClient.get('/clients', { params });
  return data.data;
}

export async function fetchClient(id) {
  const { data } = await apiClient.get(`/clients/${id}`);
  return data.data;
}

export async function createClient(payload) {
  const { data } = await apiClient.post('/clients', payload);
  return data.data;
}

export async function updateClient(id, payload) {
  const { data } = await apiClient.patch(`/clients/${id}`, payload);
  return data.data;
}

export async function fetchExecutives() {
  const { data } = await apiClient.get('/clients/executives');
  return data.data;
}
