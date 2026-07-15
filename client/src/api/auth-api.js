import { apiClient } from '@/lib/api-client';
import { isDemoMode, demoDelay } from '@/lib/demo-mode';
import { DEMO_USERS } from '@/mocks/fixtures';

export async function login({ email, password, role }) {
  if (isDemoMode) {
    await demoDelay();
    const user = DEMO_USERS[role] || DEMO_USERS.EXECUTIVE;
    return { user, accessToken: 'demo-access-token' };
  }

  const { data } = await apiClient.post('/auth/login', { email, password });
  return data.data;
}

export async function logout() {
  if (isDemoMode) {
    await demoDelay(100);
    return;
  }
  await apiClient.post('/auth/logout');
}
