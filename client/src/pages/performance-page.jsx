import { useQuery } from '@tanstack/react-query';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { fetchDashboard } from '@/api/reports-api';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { formatCurrency } from '@/lib/format';

const STAT_TILES = [
  { key: 'visitsThisWeek', label: 'Visits this week' },
  { key: 'hotLeads', label: 'Hot leads' },
  { key: 'followUpsDue', label: 'Follow-ups due' },
  { key: 'wonThisMonth', label: 'Won this month' },
];

export function PerformancePage() {
  const { data, isLoading } = useQuery({ queryKey: ['reports', 'dashboard'], queryFn: fetchDashboard });

  return (
    <>
      <PageHeader title="My performance" subtitle="This month" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STAT_TILES.map((tile) => (
          <Grid key={tile.key} size={{ xs: 6, lg: 3 }}>
            <StatCard label={tile.label} value={isLoading ? '—' : (data?.[tile.key] ?? 0)} />
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Revenue won this month
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            {isLoading ? '—' : formatCurrency(data?.wonRevenueThisMonth)}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
