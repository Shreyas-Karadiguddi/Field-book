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
  const { data } = await apiClient.post('/clients', toFormData(payload));
  return data.data;
}

export async function updateClient(id, payload) {
  const { data } = await apiClient.patch(`/clients/${id}`, toFormData(payload));
  return data.data;
}

export async function fetchExecutives() {
  const { data } = await apiClient.get('/clients/executives');
  return data.data;
}

export async function fetchClientPhotoUrl(clientId) {
  const { data } = await apiClient.get(`/clients/${clientId}/photo`, { responseType: 'blob' });
  return URL.createObjectURL(data);
}

function toFormData({ photo, competitorStack, ...fields }) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  if (competitorStack?.length) {
    formData.append('competitorStack', JSON.stringify(competitorStack));
  }
  if (photo) {
    formData.append('photo', photo);
  }
  return formData;
}
