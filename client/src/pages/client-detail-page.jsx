import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { fetchClient } from '@/api/clients-api';
import { DealStageChip } from '@/components/common/deal-stage-chip';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingState } from '@/components/common/loading-state';
import { formatCurrency, formatDate } from '@/lib/format';

export function ClientDetailPage() {
  const { id } = useParams();
  const { data: client, isLoading } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => fetchClient(id),
  });

  if (isLoading) return <LoadingState message="Loading client…" />;
  if (!client) return <EmptyState message="Client not found." />;

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography component={Link} to="/clients" variant="caption" color="text.secondary" sx={{ textDecoration: 'none' }}>
            ← My clients
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: 0.5 }}>
            <Typography variant="h5" fontWeight={600}>
              {client.shopName}
            </Typography>
            <DealStageChip stage={client.dealStage} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {client.businessType} · {client.address}
          </Typography>
        </Box>
        <Button variant="contained" size="small">
          + New visit
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <InfoTile label="Contact" value={client.contactPerson} />
        <InfoTile label="Mobile" value={client.mobile} />
        <InfoTile label="GST" value={client.gstNumber || '—'} />
        <InfoTile label="Pipeline" value={formatCurrency(client.quotationAmount)} />
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Timeline
          </Typography>
          <Stack spacing={2}>
            {client.visits?.length ? (
              client.visits.map((visit) => (
                <Card key={visit.id}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <DealStageChip stage={visit.dealStage} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(visit.visitedAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">{visit.conversationNotes}</Typography>
                    {visit.productsDiscussed?.length > 0 && (
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', mt: 1.5 }}>
                        {visit.productsDiscussed.map((p) => (
                          <Chip key={p.productName} label={p.productName} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    )}
                    {visit.quotationAmount && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Quotation: {formatCurrency(visit.quotationAmount)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState message="No visits logged yet." />
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  Follow-ups
                </Typography>
                {client.followUps?.length ? (
                  <Stack spacing={1}>
                    {client.followUps.map((fu) => (
                      <Stack key={fu.id} direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="body2">{fu.notes}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                          {formatDate(fu.dueDate)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState message="No follow-ups scheduled." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  Competitor stack
                </Typography>
                {client.competitorStack?.length ? (
                  <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
                    {client.competitorStack.map((c) => (
                      <Chip key={c} label={c} size="small" variant="outlined" />
                    ))}
                  </Stack>
                ) : (
                  <EmptyState message="None recorded." />
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function InfoTile({ label, value }) {
  return (
    <Grid size={{ xs: 6, sm: 3 }}>
      <Card>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
