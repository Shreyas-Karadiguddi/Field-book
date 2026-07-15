export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export function demoDelay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
