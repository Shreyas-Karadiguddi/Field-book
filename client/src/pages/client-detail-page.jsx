import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import AddOutlined from '@mui/icons-material/AddOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import CompareArrowsOutlined from '@mui/icons-material/CompareArrowsOutlined';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import CallOutlined from '@mui/icons-material/CallOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import { fetchClient } from '@/api/clients-api';
import { DealStageChip } from '@/components/common/deal-stage-chip';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingState } from '@/components/common/loading-state';
import { SectionHeading } from '@/components/common/section-heading';
import { LogVisitDialog } from '@/components/visits/log-visit-dialog';
import { VisitPhoto } from '@/components/visits/visit-photo';
import { ClientFormDialog } from '@/components/clients/client-form-dialog';
import { formatCurrency, formatDate } from '@/lib/format';

export function ClientDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<EditOutlined sx={{ fontSize: 16 }} />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="contained" size="small" startIcon={<AddOutlined sx={{ fontSize: 16 }} />} onClick={() => setDialogOpen(true)}>
            Log activity
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <InfoTile icon={PersonOutlineOutlined} label="Contact" value={client.contactPerson} />
        <InfoTile icon={PhoneOutlined} label="Mobile" value={client.mobile} />
        <InfoTile icon={ReceiptLongOutlined} label="GST" value={client.gstNumber || '—'} />
        <InfoTile icon={AccountBalanceWalletOutlined} label="Pipeline" value={formatCurrency(client.quotationAmount)} />
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionHeading icon={HistoryOutlined} sx={{ mb: 2 }}>
            Timeline
          </SectionHeading>
          <Stack spacing={2}>
            {client.visits?.length ? (
              client.visits.map((visit) => (
                <Card key={visit.id}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        {visit.channel === 'CALL' ? (
                          <CallOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                        ) : (
                          <StorefrontOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                        )}
                        <DealStageChip stage={visit.dealStage} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(visit.visitedAt)}
                      </Typography>
                    </Stack>
                    {visit.hasPhoto && <VisitPhoto visitId={visit.id} sx={{ mb: 1.5 }} />}
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
                <SectionHeading icon={NotificationsNoneOutlined}>Follow-ups</SectionHeading>
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
                <SectionHeading icon={CompareArrowsOutlined}>Competitor stack</SectionHeading>
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

      <LogVisitDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        client={{ id: client.id, shopName: client.shopName, dealStage: client.dealStage }}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['clients', id] })}
      />

      <ClientFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        client={client}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['clients', id] })}
      />
    </Stack>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <Grid size={{ xs: 6, sm: 3 }}>
      <Card>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Icon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Stack>
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
