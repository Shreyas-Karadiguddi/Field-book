import { apiClient } from '@/lib/api-client';
import { isDemoMode, demoDelay } from '@/lib/demo-mode';
import { DEMO_CLIENTS, DEMO_VISITS, DEMO_FOLLOW_UPS } from '@/mocks/fixtures';

export async function fetchClients(params = {}) {
  if (isDemoMode) {
    await demoDelay();
    return DEMO_CLIENTS;
  }
  const { data } = await apiClient.get('/clients', { params });
  return data.data;
}

export async function fetchClient(id) {
  if (isDemoMode) {
    await demoDelay();
    const client = DEMO_CLIENTS.find((c) => c.id === id);
    return {
      ...client,
      visits: DEMO_VISITS[id] || [],
      followUps: DEMO_FOLLOW_UPS.filter((f) => f.clientId === id),
    };
  }
  const { data } = await apiClient.get(`/clients/${id}`);
  return data.data;
}
