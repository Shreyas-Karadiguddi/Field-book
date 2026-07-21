import { apiClient } from '@/lib/api-client';

export async function fetchFollowUps(params = {}) {
  const { data } = await apiClient.get('/visits/follow-ups', { params });
  return data.data;
}

export async function fetchVisits(params = {}) {
  const { data } = await apiClient.get('/visits', { params });
  return data.data;
}

export async function createVisit({ photo, productsDiscussed, ...fields }) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  if (productsDiscussed?.length) {
    formData.append('productsDiscussed', JSON.stringify(productsDiscussed));
  }
  if (photo) {
    formData.append('photo', photo);
  }

  const { data } = await apiClient.post('/visits', formData);
  return data.data;
}

export async function fetchVisitPhotoUrl(visitId) {
  const { data } = await apiClient.get(`/visits/${visitId}/photo`, { responseType: 'blob' });
  return URL.createObjectURL(data);
}
