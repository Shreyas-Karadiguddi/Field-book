import { createTheme } from '@mui/material/styles';
import { palette } from './palette';

// Deal stage colors are used outside MUI's built-in palette slots (lead/hot/won/lost
// don't map to success/warning/error 1:1), so they're added as a custom palette key
// and read back via `theme.palette.stage.<name>` wherever a DealStageChip is rendered.
const STAGE_COLORS = {
  lead: palette.stageLead,
  hot: palette.stageHot,
  won: palette.stageWon,
  lost: palette.stageLost,
};

// The sidebar/nav stays a fixed dark navy regardless of light/dark mode (a common
// dashboard pattern) — read via `theme.palette.sidebar.*` in AppShell, not the
// mode-dependent `background`/`text` slots.
const SIDEBAR = {
  header: palette.navHeader,
  background: palette.sidebar,
  text: palette.textOnDark,
  textSecondary: palette.textOnDarkMuted,
  activeBackground: 'rgba(248, 250, 252, 0.08)',
};

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: palette.primary },
        background: { default: palette.pageBackground, paper: palette.cardBackground },
        text: { primary: palette.textOnLight, secondary: palette.textOnLightMuted },
        stage: STAGE_COLORS,
        sidebar: SIDEBAR,
      },
    },
    dark: {
      palette: {
        primary: { main: palette.primary },
        background: { default: palette.navHeader, paper: palette.sidebar },
        text: { primary: palette.textOnDark, secondary: palette.textOnDarkMuted },
        stage: STAGE_COLORS,
        sidebar: SIDEBAR,
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: ['"Geist"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
    },
  },
});
