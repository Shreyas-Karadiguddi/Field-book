import { apiClient } from '@/lib/api-client';
import { isDemoMode, demoDelay } from '@/lib/demo-mode';
import { DEMO_DASHBOARD, DEMO_PIPELINE, DEMO_AREA_COVERAGE } from '@/mocks/fixtures';

export async function fetchDashboard() {
  if (isDemoMode) {
    await demoDelay();
    return DEMO_DASHBOARD;
  }
  const { data } = await apiClient.get('/reports/dashboard');
  return data.data;
}

export async function fetchPipeline() {
  if (isDemoMode) {
    await demoDelay();
    return DEMO_PIPELINE;
  }
  const { data } = await apiClient.get('/reports/pipeline');
  return data.data;
}

export async function fetchAreaCoverage() {
  if (isDemoMode) {
    await demoDelay();
    return DEMO_AREA_COVERAGE;
  }
  const { data } = await apiClient.get('/reports/area-coverage');
  return data.data;
}
