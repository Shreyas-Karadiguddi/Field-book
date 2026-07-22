import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as MapTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import AddOutlined from '@mui/icons-material/AddOutlined';
import MapOutlined from '@mui/icons-material/MapOutlined';
import { fetchClients } from '@/api/clients-api';
import { DealStageChip } from '@/components/common/deal-stage-chip';
import { ClientFormDialog } from '@/components/clients/client-form-dialog';
import { ClientPhoto } from '@/components/clients/client-photo';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingState } from '@/components/common/loading-state';
import { formatCurrency, formatRelativeDate } from '@/lib/format';

const STAGE_FILTERS = ['ALL', 'LEAD', 'HOT', 'WON', 'LOST'];
const DEFAULT_MAP_CENTER = [19.1197, 72.8464];
const STAGE_KEYS = { LEAD: 'lead', HOT: 'hot', WON: 'won', LOST: 'lost' };

export function ClientsListPage() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState(null);
  const [cityFilter, setCityFilter] = useState(null);
  const [stateFilter, setStateFilter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(),
  });

  const areaOptions = useMemo(() => [...new Set(clients.map((c) => c.area).filter(Boolean))].sort(), [clients]);
  const cityOptions = useMemo(() => [...new Set(clients.map((c) => c.city).filter(Boolean))].sort(), [clients]);
  const stateOptions = useMemo(() => [...new Set(clients.map((c) => c.state).filter(Boolean))].sort(), [clients]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((client) => {
      const matchesStage = stageFilter === 'ALL' || client.dealStage === stageFilter;
      const matchesArea = !areaFilter || client.area === areaFilter;
      const matchesCity = !cityFilter || client.city === cityFilter;
      const matchesState = !stateFilter || client.state === stateFilter;
      const matchesSearch =
        !q ||
        client.shopName.toLowerCase().includes(q) ||
        client.contactPerson.toLowerCase().includes(q) ||
        client.address?.toLowerCase().includes(q) ||
        client.area?.toLowerCase().includes(q) ||
        client.city?.toLowerCase().includes(q) ||
        client.state?.toLowerCase().includes(q);
      return matchesStage && matchesArea && matchesCity && matchesState && matchesSearch;
    });
  }, [clients, search, stageFilter, areaFilter, cityFilter, stateFilter]);

  const withCoords = useMemo(() => filtered.filter((c) => c.lat && c.lng), [filtered]);
  const mapCenter = withCoords.length
    ? [
        withCoords.reduce((sum, c) => sum + c.lat, 0) / withCoords.length,
        withCoords.reduce((sum, c) => sum + c.lng, 0) / withCoords.length,
      ]
    : DEFAULT_MAP_CENTER;

  return (
    <>
      <PageHeader
        title="My clients"
        subtitle={`${clients.length} shops in your area`}
        action={
          <Stack direction="row" spacing={1.5}>
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
            <Button
              variant={showMap ? 'contained' : 'outlined'}
              size="small"
              startIcon={<MapOutlined sx={{ fontSize: 16 }} />}
              onClick={() => setShowMap((v) => !v)}
            >
              {showMap ? 'Hide map' : 'Show map'}
            </Button>
            <Button variant="contained" size="small" startIcon={<AddOutlined sx={{ fontSize: 16 }} />} onClick={() => setDialogOpen(true)}>
              Add client
            </Button>
          </Stack>
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
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

      <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center', flexWrap: 'wrap', rowGap: 1.5 }}>
        <PlaceOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Autocomplete
          size="small"
          options={areaOptions}
          value={areaFilter}
          onChange={(_, next) => setAreaFilter(next)}
          sx={{ width: 180 }}
          renderInput={(params) => <TextField {...params} label="Area" />}
        />
        <Autocomplete
          size="small"
          options={cityOptions}
          value={cityFilter}
          onChange={(_, next) => setCityFilter(next)}
          sx={{ width: 180 }}
          renderInput={(params) => <TextField {...params} label="City" />}
        />
        <Autocomplete
          size="small"
          options={stateOptions}
          value={stateFilter}
          onChange={(_, next) => setStateFilter(next)}
          sx={{ width: 180 }}
          renderInput={(params) => <TextField {...params} label="State" />}
        />
        {(areaFilter || cityFilter || stateFilter) && (
          <Button
            size="small"
            onClick={() => {
              setAreaFilter(null);
              setCityFilter(null);
              setStateFilter(null);
            }}
          >
            Clear location filters
          </Button>
        )}
      </Stack>

      <Collapse in={showMap} unmountOnExit>
        <Box sx={{ mb: 3, height: 420, borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
          {withCoords.length === 0 ? (
            <Stack sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                None of the matching clients have an exact location to pin on the map.
              </Typography>
            </Stack>
          ) : (
            <MapContainer key={mapCenter.join(',')} center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {withCoords.map((client) => {
                const color = theme.palette.stage[STAGE_KEYS[client.dealStage]];
                return (
                  <CircleMarker key={client.id} center={[client.lat, client.lng]} radius={9} pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}>
                    <MapTooltip permanent direction="top" offset={[0, -8]} opacity={1}>
                      {client.shopName}
                    </MapTooltip>
                    <Popup>
                      <Typography variant="body2" fontWeight={600}>
                        {client.shopName}
                      </Typography>
                      <Typography variant="caption">{client.businessType}</Typography>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </Box>
      </Collapse>

      {isLoading && <LoadingState message="Loading clients…" />}

      <Grid container spacing={2}>
        {filtered.map((client) => (
          <Grid key={client.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card>
              <CardActionArea component={Link} to={`/clients/${client.id}`} sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1.5}>
                    {client.hasPhoto && <ClientPhoto clientId={client.id} sx={{ width: 56, height: 56, flexShrink: 0 }} />}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
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
                    </Box>
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

      <ClientFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} client={null} />
    </>
  );
}
