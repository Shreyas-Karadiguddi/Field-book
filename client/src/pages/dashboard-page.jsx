import { useQuery } from '@tanstack/react-query';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import { fetchDashboard } from '@/api/reports-api';
import { useAuthStore } from '@/store/auth-store';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { DASHBOARD_STAT_TILES } from '@/lib/dashboard-stats';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 30_000,
  });

  return (
    <>
      <PageHeader
        title={`Good morning${user?.name ? `, ${user.name.split(' ')[0]}` : ''}.`}
        subtitle="Here's what's happening in the field today."
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Couldn&rsquo;t load your dashboard. Is the API running?
        </Alert>
      )}

      <Grid container spacing={2}>
        {DASHBOARD_STAT_TILES.map((tile) => (
          <Grid key={tile.key} size={{ xs: 6, lg: 3 }}>
            <StatCard label={tile.label} icon={tile.icon} value={isLoading ? '—' : (data?.[tile.key] ?? 0)} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
