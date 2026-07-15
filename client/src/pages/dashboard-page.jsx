import { useQuery } from '@tanstack/react-query';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import { fetchDashboard } from '@/api/reports-api';
import { useAuthStore } from '@/store/auth-store';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';

const STAT_TILES = [
  { key: 'visitsThisWeek', label: 'Visits this week' },
  { key: 'hotLeads', label: 'Hot leads' },
  { key: 'followUpsDue', label: 'Follow-ups due' },
  { key: 'wonThisMonth', label: 'Won this month' },
];

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
        {STAT_TILES.map((tile) => (
          <Grid key={tile.key} size={{ xs: 6, lg: 3 }}>
            <StatCard label={tile.label} value={isLoading ? '—' : (data?.[tile.key] ?? 0)} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
