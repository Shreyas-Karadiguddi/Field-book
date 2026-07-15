import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { fetchPipeline } from '@/api/reports-api';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { LoadingState } from '@/components/common/loading-state';
import { formatCurrency } from '@/lib/format';
import { DEMO_FUNNEL_STAGES } from '@/mocks/fixtures';

export function PipelinePage() {
  const theme = useTheme();
  const { data, isLoading } = useQuery({ queryKey: ['reports', 'pipeline'], queryFn: fetchPipeline });

  return (
    <>
      <PageHeader title="Manager reports" subtitle="Team performance · This month" />

      {isLoading ? (
        <LoadingState />
      ) : (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, lg: 3 }}>
              <StatCard label="Revenue pipeline" value={formatCurrency(sumBy(data?.leaderboard, 'revenueWon'))} />
            </Grid>
            <Grid size={{ xs: 6, lg: 3 }}>
              <StatCard label="Conversion rate" value={`${data?.conversionRate ?? 0}%`} />
            </Grid>
            <Grid size={{ xs: 6, lg: 3 }}>
              <StatCard label="Won this month" value={sumBy(data?.leaderboard, 'clientsWon')} />
            </Grid>
            <Grid size={{ xs: 6, lg: 3 }}>
              <StatCard label="Executives" value={data?.leaderboard?.length ?? 0} />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Conversion funnel
                  </Typography>
                  <Box sx={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DEMO_FUNNEL_STAGES} layout="vertical" margin={{ left: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="label" width={70} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Executive leaderboard
                  </Typography>
                  <Stack spacing={1.5}>
                    {data?.leaderboard?.map((row, i) => (
                      <Stack key={row.executive.id} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ width: 20 }}>
                            {String(i + 1).padStart(2, '0')}
                          </Typography>
                          <Typography variant="body2">{row.executive.name}</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(row.revenueWon)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}
    </>
  );
}

function sumBy(rows, key) {
  return rows?.reduce((sum, row) => sum + row[key], 0) ?? 0;
}
