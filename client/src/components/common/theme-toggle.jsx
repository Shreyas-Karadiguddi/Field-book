import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useColorScheme } from '@mui/material/styles';

export function ThemeToggle({ sx }) {
  const { mode, setMode } = useColorScheme();
  const isDark = mode !== 'light';

  function handleToggle() {
    setMode(isDark ? 'light' : 'dark');
  }

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={handleToggle} size="small" sx={{ color: 'inherit', ...sx }}>
        {isDark ? <LightModeOutlined sx={{ fontSize: 20 }} /> : <DarkModeOutlined sx={{ fontSize: 20 }} />}
      </IconButton>
    </Tooltip>
  );
}
