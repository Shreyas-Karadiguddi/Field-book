import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import { createClient, updateClient, fetchExecutives } from '@/api/clients-api';
import { useAuthStore } from '@/store/auth-store';

const DEAL_STAGES = ['LEAD', 'HOT', 'WON', 'LOST'];
const SOFTWARE_RELATIONSHIPS = ['PROSPECT', 'UPGRADE', 'RENEWAL'];
const BUSINESS_TYPES = ['Retail', 'F&B', 'Club', 'Industrial'];
const COMPETITOR_OPTIONS = ['Tally Prime', 'Marg ERP', 'Zoho Books', 'Vyapar', 'SAP Business One'];

const clientSchema = z.object({
  shopName: z.string().min(1, 'Required'),
  contactPerson: z.string().min(1, 'Required'),
  mobile: z.string().min(1, 'Required'),
  gstNumber: z.string().optional(),
  businessType: z.string().optional(),
  softwareRelationship: z.enum(['PROSPECT', 'UPGRADE', 'RENEWAL']),
  dealStage: z.enum(['LEAD', 'HOT', 'WON', 'LOST']),
  quotationAmount: z
    .string()
    .optional()
    .refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0), { message: 'Enter a valid amount' }),
  address: z.string().optional(),
  area: z.string().optional(),
  assignedExecutiveId: z.string().optional(),
});

function emptyValues() {
  return {
    shopName: '',
    contactPerson: '',
    mobile: '',
    gstNumber: '',
    businessType: '',
    softwareRelationship: 'PROSPECT',
    dealStage: 'LEAD',
    quotationAmount: '',
    address: '',
    area: '',
    assignedExecutiveId: '',
  };
}

function valuesFromClient(client) {
  return {
    shopName: client.shopName || '',
    contactPerson: client.contactPerson || '',
    mobile: client.mobile || '',
    gstNumber: client.gstNumber || '',
    businessType: client.businessType || '',
    softwareRelationship: client.softwareRelationship || 'PROSPECT',
    dealStage: client.dealStage || 'LEAD',
    quotationAmount: client.quotationAmount != null ? String(client.quotationAmount) : '',
    address: client.address || '',
    area: client.area || '',
    assignedExecutiveId: client.assignedExecutiveId || '',
  };
}

export function ClientFormDialog({ open, onClose, client, onSaved }) {
  const isEdit = !!client;
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canReassign = isEdit && (user?.role === 'MANAGER' || user?.role === 'ADMIN');

  const [competitorStack, setCompetitorStack] = useState([]);
  const [gps, setGps] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const { data: executives = [] } = useQuery({
    queryKey: ['clients', 'executives'],
    queryFn: fetchExecutives,
    enabled: open && canReassign,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    reset(client ? valuesFromClient(client) : emptyValues());
    setCompetitorStack(client?.competitorStack || []);

    if (client) {
      setGps(client.lat && client.lng ? { lat: client.lat, lng: client.lng } : null);
      setGpsError(null);
    } else {
      setGps(null);
      setGpsError(null);
      captureLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client]);

  function captureLocation() {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported on this device');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGps({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGpsError('Could not get your location');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const mutation = useMutation({
    mutationFn: (payload) => (isEdit ? updateClient(client.id, payload) : createClient(payload)),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onSaved?.(saved);
      onClose();
    },
  });

  function onSubmit(values) {
    mutation.mutate({
      shopName: values.shopName,
      contactPerson: values.contactPerson,
      mobile: values.mobile,
      gstNumber: values.gstNumber || undefined,
      businessType: values.businessType || undefined,
      softwareRelationship: values.softwareRelationship,
      dealStage: values.dealStage,
      quotationAmount: values.quotationAmount ? Number(values.quotationAmount) : undefined,
      address: values.address || undefined,
      area: values.area || undefined,
      competitorStack,
      lat: gps?.lat,
      lng: gps?.lng,
      ...(canReassign ? { assignedExecutiveId: values.assignedExecutiveId || undefined } : {}),
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit client' : 'Add a client'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5}>
            {mutation.isError && (
              <Alert severity="error">{mutation.error?.response?.data?.error || 'Could not save this client'}</Alert>
            )}

            <TextField
              label="Shop name"
              fullWidth
              size="small"
              error={!!errors.shopName}
              helperText={errors.shopName?.message}
              {...register('shopName')}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Contact person"
                fullWidth
                size="small"
                error={!!errors.contactPerson}
                helperText={errors.contactPerson?.message}
                {...register('contactPerson')}
              />
              <TextField
                label="Mobile"
                fullWidth
                size="small"
                error={!!errors.mobile}
                helperText={errors.mobile?.message}
                {...register('mobile')}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Controller
                control={control}
                name="businessType"
                render={({ field }) => (
                  <Autocomplete
                    freeSolo
                    fullWidth
                    options={BUSINESS_TYPES}
                    value={field.value}
                    onChange={(_, next) => field.onChange(next || '')}
                    onInputChange={(_, next) => field.onChange(next)}
                    renderInput={(params) => <TextField {...params} label="Business type" size="small" />}
                  />
                )}
              />
              <TextField label="GST number" fullWidth size="small" {...register('gstNumber')} />
            </Stack>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Deal stage
              </Typography>
              <Controller
                control={control}
                name="dealStage"
                render={({ field }) => (
                  <ToggleButtonGroup exclusive size="small" value={field.value} onChange={(_, next) => next && field.onChange(next)}>
                    {DEAL_STAGES.map((stage) => (
                      <ToggleButton key={stage} value={stage}>
                        {stage.charAt(0) + stage.slice(1).toLowerCase()}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Software relationship
              </Typography>
              <Controller
                control={control}
                name="softwareRelationship"
                render={({ field }) => (
                  <ToggleButtonGroup exclusive size="small" value={field.value} onChange={(_, next) => next && field.onChange(next)}>
                    {SOFTWARE_RELATIONSHIPS.map((rel) => (
                      <ToggleButton key={rel} value={rel}>
                        {rel.charAt(0) + rel.slice(1).toLowerCase()}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              />
            </Box>

            <TextField label="Quotation amount (₹)" type="number" fullWidth size="small" error={!!errors.quotationAmount} helperText={errors.quotationAmount?.message} {...register('quotationAmount')} />

            <Autocomplete
              multiple
              freeSolo
              options={COMPETITOR_OPTIONS}
              value={competitorStack}
              onChange={(_, next) => setCompetitorStack(next)}
              renderInput={(params) => <TextField {...params} label="Competitor stack" size="small" />}
            />

            <Stack direction="row" spacing={2}>
              <TextField label="Address" fullWidth size="small" {...register('address')} />
              <TextField label="Area" fullWidth size="small" {...register('area')} />
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PlaceOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {gpsLoading ? 'Getting location…' : gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : gpsError || 'Location not captured'}
              </Typography>
              <IconButton size="small" onClick={captureLocation} disabled={gpsLoading}>
                <RefreshOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>

            {canReassign && (
              <Controller
                control={control}
                name="assignedExecutiveId"
                render={({ field }) => (
                  <Autocomplete
                    options={executives}
                    getOptionLabel={(option) => option.name || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={executives.find((e) => e.id === field.value) || null}
                    onChange={(_, next) => field.onChange(next?.id || '')}
                    renderInput={(params) => <TextField {...params} label="Assigned executive" size="small" />}
                  />
                )}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add client'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
