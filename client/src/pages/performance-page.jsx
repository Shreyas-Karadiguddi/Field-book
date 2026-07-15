import { useQuery } from '@tanstack/react-query';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PaidOutlined from '@mui/icons-material/PaidOutlined';
import { fetchDashboard } from '@/api/reports-api';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { formatCurrency } from '@/lib/format';
import { DASHBOARD_STAT_TILES } from '@/lib/dashboard-stats';

export function PerformancePage() {
  const { data, isLoading } = useQuery({ queryKey: ['reports', 'dashboard'], queryFn: fetchDashboard });

  return (
    <>
      <PageHeader title="My performance" subtitle="This month" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {DASHBOARD_STAT_TILES.map((tile) => (
          <Grid key={tile.key} size={{ xs: 6, lg: 3 }}>
            <StatCard label={tile.label} icon={tile.icon} value={isLoading ? '—' : (data?.[tile.key] ?? 0)} />
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.5 }}>
            <PaidOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              Revenue won this month
            </Typography>
          </Stack>
          <Typography variant="h4" fontWeight={600}>
            {isLoading ? '—' : formatCurrency(data?.wonRevenueThisMonth)}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
