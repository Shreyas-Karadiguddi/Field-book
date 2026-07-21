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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import CallOutlined from '@mui/icons-material/CallOutlined';
import { fetchClients } from '@/api/clients-api';
import { createVisit } from '@/api/visits-api';

const CHANNELS = [
  { value: 'IN_PERSON', label: 'In person', icon: StorefrontOutlined },
  { value: 'CALL', label: 'Phone call', icon: CallOutlined },
];
const DEAL_STAGES = ['LEAD', 'HOT', 'WON', 'LOST'];
const PRODUCT_OPTIONS = [
  'POS Billing',
  'Inventory Management',
  'GST Billing',
  'Kitchen Display System',
  'Table Ordering',
  'Membership Management',
  'Multi-branch Sync',
];

const visitSchema = z
  .object({
    clientId: z.string().min(1, 'Select a client'),
    channel: z.enum(['IN_PERSON', 'CALL']),
    dealStage: z.enum(['LEAD', 'HOT', 'WON', 'LOST']),
    conversationNotes: z.string().optional(),
    quotationAmount: z
      .string()
      .optional()
      .refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0), { message: 'Enter a valid amount' }),
    followUpEnabled: z.boolean().optional(),
    followUpDate: z.string().optional(),
    followUpNotes: z.string().optional(),
  })
  .refine((data) => !data.followUpEnabled || !!data.followUpDate, {
    message: 'Pick a follow-up date',
    path: ['followUpDate'],
  });

export function LogVisitDialog({ open, onClose, client, onCreated }) {
  const queryClient = useQueryClient();
  const [productsDiscussed, setProductsDiscussed] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [gps, setGps] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(),
    enabled: open && !client,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      clientId: client?.id || '',
      channel: 'IN_PERSON',
      dealStage: client?.dealStage || 'LEAD',
      conversationNotes: '',
      quotationAmount: '',
      followUpEnabled: false,
      followUpDate: '',
      followUpNotes: '',
    },
  });

  const followUpEnabled = watch('followUpEnabled');
  const channel = watch('channel');

  useEffect(() => {
    if (!open) return;
    reset({
      clientId: client?.id || '',
      channel: 'IN_PERSON',
      dealStage: client?.dealStage || 'LEAD',
      conversationNotes: '',
      quotationAmount: '',
      followUpEnabled: false,
      followUpDate: '',
      followUpNotes: '',
    });
    setProductsDiscussed([]);
    setPhoto(null);
    setPhotoPreview(null);
    setGps(null);
    setGpsError(null);
    captureLocation();
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

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
  }

  const mutation = useMutation({
    mutationFn: createVisit,
    onSuccess: (visit) => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      onCreated?.(visit);
      onClose();
    },
  });

  function onSubmit(values) {
    const isInPerson = values.channel === 'IN_PERSON';
    mutation.mutate({
      clientId: values.clientId,
      channel: values.channel,
      conversationNotes: values.conversationNotes,
      dealStage: values.dealStage,
      quotationAmount: values.quotationAmount ? Number(values.quotationAmount) : undefined,
      gpsLat: isInPerson ? gps?.lat : undefined,
      gpsLng: isInPerson ? gps?.lng : undefined,
      productsDiscussed,
      followUpDate: values.followUpEnabled ? values.followUpDate : undefined,
      followUpNotes: values.followUpEnabled ? values.followUpNotes : undefined,
      photo: isInPerson ? photo : undefined,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{channel === 'CALL' ? 'Log a call' : 'Log a visit'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5}>
            {mutation.isError && (
              <Alert severity="error">{mutation.error?.response?.data?.error || 'Could not save this visit'}</Alert>
            )}

            <Controller
              control={control}
              name="channel"
              render={({ field }) => (
                <ToggleButtonGroup exclusive size="small" value={field.value} onChange={(_, next) => next && field.onChange(next)} fullWidth>
                  {CHANNELS.map(({ value, label, icon: Icon }) => (
                    <ToggleButton key={value} value={value} sx={{ gap: 0.75 }}>
                      <Icon sx={{ fontSize: 16 }} />
                      {label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
            />

            {client ? (
              <TextField label="Client" value={client.shopName} disabled fullWidth size="small" />
            ) : (
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <Autocomplete
                    options={clients}
                    getOptionLabel={(option) => option.shopName || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={clients.find((c) => c.id === field.value) || null}
                    onChange={(_, next) => field.onChange(next?.id || '')}
                    renderInput={(params) => (
                      <TextField {...params} label="Client" size="small" error={!!errors.clientId} helperText={errors.clientId?.message} />
                    )}
                  />
                )}
              />
            )}

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Deal stage
              </Typography>
              <Controller
                control={control}
                name="dealStage"
                render={({ field }) => (
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={field.value}
                    onChange={(_, next) => next && field.onChange(next)}
                  >
                    {DEAL_STAGES.map((stage) => (
                      <ToggleButton key={stage} value={stage}>
                        {stage.charAt(0) + stage.slice(1).toLowerCase()}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              />
            </Box>

            <TextField
              label="Conversation notes"
              multiline
              minRows={3}
              fullWidth
              size="small"
              {...register('conversationNotes')}
            />

            <Autocomplete
              multiple
              freeSolo
              options={PRODUCT_OPTIONS}
              value={productsDiscussed}
              onChange={(_, next) => setProductsDiscussed(next)}
              renderInput={(params) => <TextField {...params} label="Products discussed" size="small" />}
            />

            <TextField
              label="Quotation amount (₹)"
              type="number"
              fullWidth
              size="small"
              error={!!errors.quotationAmount}
              helperText={errors.quotationAmount?.message}
              {...register('quotationAmount')}
            />

            {channel === 'IN_PERSON' && (
              <>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PlaceOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                    {gpsLoading ? 'Getting your location…' : gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : gpsError || 'Location not captured'}
                  </Typography>
                  <IconButton size="small" onClick={captureLocation} disabled={gpsLoading}>
                    <RefreshOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>

                <Box>
                  <Button component="label" size="small" variant="outlined" startIcon={<PhotoCameraOutlined sx={{ fontSize: 16 }} />}>
                    {photo ? 'Replace photo' : 'Attach photo'}
                    <input type="file" accept="image/*" capture="environment" hidden onChange={handlePhotoChange} />
                  </Button>
                  {photoPreview && (
                    <Box sx={{ mt: 1.5, position: 'relative', display: 'inline-block' }}>
                      <Box
                        component="img"
                        src={photoPreview}
                        alt="Visit"
                        sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, display: 'block' }}
                      />
                      <IconButton
                        size="small"
                        onClick={clearPhoto}
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'background.paper' } }}
                      >
                        <CloseOutlined sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </>
            )}

            <FormControlLabel
              control={<Checkbox size="small" {...register('followUpEnabled')} />}
              label="Schedule a follow-up"
            />

            {followUpEnabled && (
              <Stack spacing={2}>
                <TextField
                  label="Follow-up date"
                  type="date"
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.followUpDate}
                  helperText={errors.followUpDate?.message}
                  {...register('followUpDate')}
                />
                <TextField label="Follow-up notes" size="small" fullWidth {...register('followUpNotes')} />
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
