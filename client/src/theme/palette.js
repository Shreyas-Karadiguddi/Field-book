// Single source of truth for Fieldbook's brand colors.
// theme.js builds the MUI theme from these — change a value here and it
// propagates everywhere (sidebar, cards, deal-stage chips, charts, map markers).

export const palette = {
  // Dark mode
  navHeader: '#0F172A',
  sidebar: '#1E293B',
  primary: '#0D9488',

  // Light mode — top nav stays the same dark navy to anchor the page; the
  // sidebar body picks up a faint teal wash instead, for a subtle brand tie-in.
  pageBackground: '#F8FAFC',
  cardBackground: '#FFFFFF',
  sidebarWashLight: '#F0FDFA',
  borderLight: '#E2E8F0',

  stageLead: '#8B93A8',
  stageHot: '#F59E0B',
  stageWon: '#10B981',
  stageLost: '#EF4444',

  textOnDark: '#F1F5F9',
  textOnDarkMuted: '#94A3B8',
  textOnLight: '#0F172A',
  textOnLightMuted: '#475569',
};
