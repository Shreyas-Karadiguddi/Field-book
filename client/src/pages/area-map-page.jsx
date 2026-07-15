import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTheme } from '@mui/material/styles';
import MapOutlined from '@mui/icons-material/MapOutlined';
import ViewListOutlined from '@mui/icons-material/ViewListOutlined';
import { fetchClients } from '@/api/clients-api';
import { DealStageChip } from '@/components/common/deal-stage-chip';
import { PageHeader } from '@/components/common/page-header';
import { formatCurrency } from '@/lib/format';

const DEFAULT_CENTER = [19.1197, 72.8464];
const STAGE_KEYS = { LEAD: 'lead', HOT: 'hot', WON: 'won', LOST: 'lost' };

export function AreaMapPage() {
  const [view, setView] = useState('map');
  const theme = useTheme();
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => fetchClients() });

  const withCoords = clients.filter((c) => c.lat && c.lng);

  return (
    <>
      <PageHeader
        title="Area coverage"
        subtitle={`${clients.length} shops · Andheri West`}
        action={
          <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, next) => next && setView(next)}>
            <ToggleButton value="map" sx={{ gap: 0.5 }}>
              <MapOutlined sx={{ fontSize: 18 }} />
              Map
            </ToggleButton>
            <ToggleButton value="list" sx={{ gap: 0.5 }}>
              <ViewListOutlined sx={{ fontSize: 18 }} />
              List
            </ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {view === 'map' ? (
        <Box sx={{ height: 600, borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
          <MapContainer center={DEFAULT_CENTER} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {withCoords.map((client) => {
              const color = theme.palette.stage[STAGE_KEYS[client.dealStage]];
              return (
                <CircleMarker key={client.id} center={[client.lat, client.lng]} radius={9} pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}>
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
        </Box>
      ) : (
        <Stack spacing={1}>
          {withCoords.map((client) => (
            <Card key={client.id}>
              <CardActionArea component={Link} to={`/clients/${client.id}`}>
                <CardContent sx={{ py: 1.5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {client.shopName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {client.businessType} · {client.contactPerson}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(client.quotationAmount)}
                      </Typography>
                      <DealStageChip stage={client.dealStage} />
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}
