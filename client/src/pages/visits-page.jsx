import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import AddOutlined from '@mui/icons-material/AddOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import CallOutlined from '@mui/icons-material/CallOutlined';
import { fetchVisits } from '@/api/visits-api';
import { useAuthStore } from '@/store/auth-store';
import { DealStageChip } from '@/components/common/deal-stage-chip';
import { LogVisitDialog } from '@/components/visits/log-visit-dialog';
import { VisitPhoto } from '@/components/visits/visit-photo';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingState } from '@/components/common/loading-state';
import { formatCurrency, formatDate } from '@/lib/format';

const STAGE_FILTERS = ['ALL', 'LEAD', 'HOT', 'WON', 'LOST'];
const CHANNEL_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'IN_PERSON', label: 'Visits' },
  { value: 'CALL', label: 'Calls' },
];

export function VisitsPage() {
  const [stageFilter, setStageFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isExecutive = user?.role === 'EXECUTIVE';

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['visits'],
    queryFn: () => fetchVisits(),
  });

  const filtered = useMemo(() => {
    return visits.filter((visit) => {
      const matchesStage = stageFilter === 'ALL' || visit.dealStage === stageFilter;
      const matchesChannel = channelFilter === 'ALL' || visit.channel === channelFilter;
      return matchesStage && matchesChannel;
    });
  }, [visits, stageFilter, channelFilter]);

  return (
    <>
      <PageHeader
        title="Visits"
        subtitle={`${visits.length} logged`}
        action={
          <Button variant="contained" size="small" startIcon={<AddOutlined sx={{ fontSize: 16 }} />} onClick={() => setDialogOpen(true)}>
            Log activity
          </Button>
        }
      />

      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Stack direction="row" spacing={1}>
          {STAGE_FILTERS.map((stage) => (
            <Chip
              key={stage}
              label={stage === 'ALL' ? 'All stages' : stage.charAt(0) + stage.slice(1).toLowerCase()}
              variant={stageFilter === stage ? 'filled' : 'outlined'}
              color={stageFilter === stage ? 'primary' : 'default'}
              onClick={() => setStageFilter(stage)}
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          {CHANNEL_FILTERS.map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              variant={channelFilter === value ? 'filled' : 'outlined'}
              color={channelFilter === value ? 'primary' : 'default'}
              onClick={() => setChannelFilter(value)}
            />
          ))}
        </Stack>
      </Stack>

      {isLoading && <LoadingState message="Loading visits…" />}

      <Stack spacing={2}>
        {filtered.map((visit) => (
          <Card key={visit.id}>
            <CardContent>
              <Stack direction="row" spacing={2}>
                {visit.hasPhoto && <VisitPhoto visitId={visit.id} />}

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Stack direction="row" spacing={1}>
                      {visit.channel === 'CALL' ? (
                        <CallOutlined sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25 }} />
                      ) : (
                        <StorefrontOutlined sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25 }} />
                      )}
                      <Box>
                        <Typography
                          component={Link}
                          to={`/clients/${visit.client?.id}`}
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{ display: 'block', textDecoration: 'none', color: 'text.primary' }}
                        >
                          {visit.client?.shopName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {visit.client?.businessType} · {formatDate(visit.visitedAt)}
                          {!isExecutive && visit.executive?.name ? ` · ${visit.executive.name}` : ''}
                        </Typography>
                      </Box>
                    </Stack>
                    <DealStageChip stage={visit.dealStage} />
                  </Stack>

                  {visit.conversationNotes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {visit.conversationNotes}
                    </Typography>
                  )}

                  {visit.productsDiscussed?.length > 0 && (
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', mt: 1.5 }}>
                      {visit.productsDiscussed.map((p) => (
                        <Chip key={p.id || p.productName} label={p.productName} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  )}

                  {visit.quotationAmount ? (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Quotation: {formatCurrency(visit.quotationAmount)}
                    </Typography>
                  ) : null}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {!isLoading && filtered.length === 0 && <EmptyState message="No visits match your filters." />}

      <LogVisitDialog open={dialogOpen} onClose={() => setDialogOpen(false)} client={null} />
    </>
  );
}
