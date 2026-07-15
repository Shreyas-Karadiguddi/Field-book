import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import SpaceDashboardOutlined from '@mui/icons-material/SpaceDashboardOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import MapOutlined from '@mui/icons-material/MapOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { useAuthStore } from '@/store/auth-store';
import { logout as logoutRequest } from '@/api/auth-api';
import { Logo } from '@/components/common/logo';

const DRAWER_WIDTH = 240;

const WORKSPACE_LINKS = [
  { to: '/', label: 'Dashboard', exact: true, icon: SpaceDashboardOutlined },
  { to: '/clients', label: 'My clients', icon: StorefrontOutlined },
  { to: '/visits', label: 'Visits', icon: EventNoteOutlined },
  { to: '/follow-ups', label: 'Follow-ups', icon: NotificationsNoneOutlined },
  { to: '/area-map', label: 'Area map', icon: MapOutlined },
];

const REPORTS_LINKS = [
  { to: '/reports/performance', label: 'My performance', icon: TrendingUpOutlined },
  { to: '/reports/pipeline', label: 'Pipeline', icon: FilterAltOutlined, roles: ['MANAGER', 'ADMIN'] },
];

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logoutRequest();
    } finally {
      clearSession();
      navigate('/login');
    }
  }

  const reportsLinks = REPORTS_LINKS.filter((link) => !link.roles || link.roles.includes(user?.role));

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            display: 'flex',
            bgcolor: 'sidebar.background',
            color: 'sidebar.text',
            border: 'none',
          },
        }}
      >
        <Toolbar sx={{ bgcolor: 'sidebar.header' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Logo />
            <Typography variant="h6" fontWeight={700} sx={{ color: 'sidebar.text' }}>
              Fieldbook
            </Typography>
          </Stack>
        </Toolbar>

        <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
          <NavSection title="Workspace" links={WORKSPACE_LINKS} currentPath={location.pathname} />
          <NavSection title="Reports" links={reportsLinks} currentPath={location.pathname} />
        </Box>

        <Divider sx={{ borderColor: 'sidebar.textSecondary', opacity: 0.2 }} />
        <Stack spacing={1} sx={{ p: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: 'sidebar.text' }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'sidebar.textSecondary', textTransform: 'capitalize' }}>
            {user?.role?.toLowerCase()}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutOutlined sx={{ fontSize: 16 }} />}
            onClick={handleLogout}
            sx={{ borderColor: 'sidebar.textSecondary', color: 'sidebar.text', '&:hover': { borderColor: 'sidebar.text' } }}
          >
            Sign out
          </Button>
        </Stack>
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}

function NavSection({ title, links, currentPath }) {
  if (links.length === 0) return null;

  return (
    <Box sx={{ px: 1, py: 1 }}>
      <Typography variant="overline" sx={{ px: 1, color: 'sidebar.textSecondary' }}>
        {title}
      </Typography>
      <List dense disablePadding>
        {links.map((link) => {
          const isActive = link.exact ? currentPath === link.to : currentPath.startsWith(link.to);
          const Icon = link.icon;
          return (
            <ListItemButton
              key={link.to}
              component={Link}
              to={link.to}
              selected={isActive}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                color: 'sidebar.text',
                '&.Mui-selected': { bgcolor: 'sidebar.activeBackground' },
                '&.Mui-selected:hover': { bgcolor: 'sidebar.activeBackground' },
                '&:hover': { bgcolor: 'sidebar.activeBackground' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                <Icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { variant: 'body2', fontWeight: isActive ? 600 : 400 } }}>
                {link.label}
              </ListItemText>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
