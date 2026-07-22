import { useState } from 'react';
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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import SpaceDashboardOutlined from '@mui/icons-material/SpaceDashboardOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import MenuOutlined from '@mui/icons-material/MenuOutlined';
import { useAuthStore } from '@/store/auth-store';
import { logout as logoutRequest } from '@/api/auth-api';
import { Logo } from '@/components/common/logo';
import { ThemeToggle } from '@/components/common/theme-toggle';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const WORKSPACE_LINKS = [
  { to: '/', label: 'Dashboard', exact: true, icon: SpaceDashboardOutlined },
  { to: '/clients', label: 'My clients', icon: StorefrontOutlined },
  { to: '/visits', label: 'Visits', icon: EventNoteOutlined },
  { to: '/follow-ups', label: 'Follow-ups', icon: NotificationsNoneOutlined },
];

const REPORTS_LINKS = [
  { to: '/reports/performance', label: 'My performance', icon: TrendingUpOutlined },
  { to: '/reports/pipeline', label: 'Pipeline', icon: FilterAltOutlined, roles: ['MANAGER', 'ADMIN'] },
];

const ADMIN_LINKS = [{ to: '/users', label: 'Users', icon: GroupOutlined, roles: ['ADMIN'] }];

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    try {
      await logoutRequest();
    } finally {
      clearSession();
      navigate('/login');
    }
  }

  function toggleDrawer() {
    if (isMobile) setMobileOpen((open) => !open);
    else setCollapsed((c) => !c);
  }

  function handleNavigate() {
    if (isMobile) setMobileOpen(false);
  }

  const reportsLinks = REPORTS_LINKS.filter((link) => !link.roles || link.roles.includes(user?.role));
  const adminLinks = ADMIN_LINKS.filter((link) => !link.roles || link.roles.includes(user?.role));
  const isCollapsed = !isMobile && collapsed;
  const drawerWidth = isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <>
      <Toolbar sx={{ bgcolor: 'sidebar.header', justifyContent: isCollapsed ? 'center' : 'space-between', px: isCollapsed ? 1 : 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', overflow: 'hidden' }}>
          <Logo />
          {!isCollapsed && (
            <Typography variant="h6" fontWeight={700} noWrap sx={{ color: 'sidebar.headerText' }}>
              Fieldbook
            </Typography>
          )}
        </Stack>
        {!isCollapsed && <ThemeToggle sx={{ color: 'sidebar.headerText' }} />}
      </Toolbar>

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        <NavSection title="Workspace" links={WORKSPACE_LINKS} currentPath={location.pathname} collapsed={isCollapsed} onNavigate={handleNavigate} />
        <NavSection title="Reports" links={reportsLinks} currentPath={location.pathname} collapsed={isCollapsed} onNavigate={handleNavigate} />
        <NavSection title="Admin" links={adminLinks} currentPath={location.pathname} collapsed={isCollapsed} onNavigate={handleNavigate} />
      </Box>

      <Divider sx={{ borderColor: 'sidebar.textSecondary', opacity: 0.2 }} />
      <Stack spacing={1} sx={{ p: isCollapsed ? 1 : 2, alignItems: isCollapsed ? 'center' : 'stretch' }}>
        {!isCollapsed && (
          <>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'sidebar.text' }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'sidebar.textSecondary', textTransform: 'capitalize' }}>
              {user?.role?.toLowerCase()}
            </Typography>
          </>
        )}
        {isCollapsed ? (
          <Tooltip title="Sign out" placement="right">
            <IconButton onClick={handleLogout} size="small" sx={{ color: 'sidebar.text' }}>
              <LogoutOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutOutlined sx={{ fontSize: 16 }} />}
            onClick={handleLogout}
            sx={{ borderColor: 'sidebar.textSecondary', color: 'sidebar.text', '&:hover': { borderColor: 'sidebar.text' } }}
          >
            Sign out
          </Button>
        )}
      </Stack>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile ? DRAWER_WIDTH : drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: isMobile ? DRAWER_WIDTH : drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            bgcolor: 'sidebar.background',
            color: 'sidebar.text',
            border: 'none',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            px: 1.5,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.appBar,
            bgcolor: 'background.default',
          }}
        >
          <IconButton onClick={toggleDrawer} size="small">
            <MenuOutlined sx={{ fontSize: 20 }} />
          </IconButton>
          {isMobile && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: 1 }}>
              <Logo size={22} />
              <Typography variant="subtitle1" fontWeight={700}>
                Fieldbook
              </Typography>
            </Stack>
          )}
          {isMobile && <Box sx={{ flex: 1 }} />}
          {isMobile && <ThemeToggle />}
        </Stack>

        <Box component="main" sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

function NavSection({ title, links, currentPath, collapsed, onNavigate }) {
  if (links.length === 0) return null;

  return (
    <Box sx={{ px: collapsed ? 0.5 : 1, py: 1 }}>
      {!collapsed && (
        <Typography variant="overline" sx={{ px: 1, color: 'sidebar.textSecondary' }}>
          {title}
        </Typography>
      )}
      <List dense disablePadding>
        {links.map((link) => {
          const isActive = link.exact ? currentPath === link.to : currentPath.startsWith(link.to);
          const Icon = link.icon;
          const item = (
            <ListItemButton
              key={link.to}
              component={Link}
              to={link.to}
              selected={isActive}
              onClick={onNavigate}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: 'sidebar.text',
                '&.Mui-selected': { bgcolor: 'sidebar.activeBackground' },
                '&.Mui-selected:hover': { bgcolor: 'sidebar.activeBackground' },
                '&:hover': { bgcolor: 'sidebar.activeBackground' },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 32, color: 'inherit', justifyContent: 'center' }}>
                <Icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText slotProps={{ primary: { variant: 'body2', fontWeight: isActive ? 600 : 400 } }}>
                  {link.label}
                </ListItemText>
              )}
            </ListItemButton>
          );
          return collapsed ? (
            <Tooltip key={link.to} title={link.label} placement="right">
              {item}
            </Tooltip>
          ) : (
            item
          );
        })}
      </List>
    </Box>
  );
}
