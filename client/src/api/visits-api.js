import { apiClient } from '@/lib/api-client';
import { isDemoMode, demoDelay } from '@/lib/demo-mode';
import { DEMO_FOLLOW_UPS } from '@/mocks/fixtures';

export async function fetchFollowUps(params = {}) {
  if (isDemoMode) {
    await demoDelay();
    return DEMO_FOLLOW_UPS;
  }
  const { data } = await apiClient.get('/visits/follow-ups', { params });
  return data.data;
}
