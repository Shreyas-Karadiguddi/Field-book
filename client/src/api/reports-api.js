import { apiClient } from '@/lib/api-client';

export async function fetchDashboard() {
  const { data } = await apiClient.get('/reports/dashboard');
  return data.data;
}

export async function fetchPipeline() {
  const { data } = await apiClient.get('/reports/pipeline');
  return data.data;
}

export async function fetchAreaCoverage() {
  const { data } = await apiClient.get('/reports/area-coverage');
  return data.data;
}
