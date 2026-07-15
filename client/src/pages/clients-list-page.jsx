import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import { fetchClients } from '@/api/clients-api';
import { DealStageChip } from '@/components/common/deal-stage-chip';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingState } from '@/components/common/loading-state';
import { formatCurrency, formatRelativeDate } from '@/lib/format';

const STAGE_FILTERS = ['ALL', 'LEAD', 'HOT', 'WON', 'LOST'];

export function ClientsListPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(),
  });

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      const matchesStage = stageFilter === 'ALL' || client.dealStage === stageFilter;
      const matchesSearch =
        !search ||
        client.shopName.toLowerCase().includes(search.toLowerCase()) ||
        client.contactPerson.toLowerCase().includes(search.toLowerCase());
      return matchesStage && matchesSearch;
    });
  }, [clients, search, stageFilter]);

  return (
    <>
      <PageHeader
        title="My clients"
        subtitle={`${clients.length} shops in your area`}
        action={
          <TextField
            size="small"
            placeholder="Search shops…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {STAGE_FILTERS.map((stage) => (
          <Chip
            key={stage}
            label={stage === 'ALL' ? 'All' : stage.charAt(0) + stage.slice(1).toLowerCase()}
            variant={stageFilter === stage ? 'filled' : 'outlined'}
            color={stageFilter === stage ? 'primary' : 'default'}
            onClick={() => setStageFilter(stage)}
          />
        ))}
      </Stack>

      {isLoading && <LoadingState message="Loading clients…" />}

      <Grid container spacing={2}>
        {filtered.map((client) => (
          <Grid key={client.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card>
              <CardActionArea component={Link} to={`/clients/${client.id}`} sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                      {client.shopName}
                    </Typography>
                    <DealStageChip stage={client.dealStage} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {client.businessType} · {client.contactPerson}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.25 }}>
                    <PhoneOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {client.mobile}
                    </Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Last updated {formatRelativeDate(client.updatedAt)}
                    </Typography>
                    {client.quotationAmount ? (
                      <Typography variant="caption" fontWeight={600}>
                        {formatCurrency(client.quotationAmount)}
                      </Typography>
                    ) : null}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!isLoading && filtered.length === 0 && <EmptyState message="No clients match your filters." />}
    </>
  );
}
