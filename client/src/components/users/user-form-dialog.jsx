import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { createUser, updateUser } from '@/api/users-api';

const ROLES = ['EXECUTIVE', 'MANAGER', 'ADMIN'];

const baseFields = {
  name: z.string().min(1, 'Required'),
  mobile: z.string().optional(),
  area: z.string().optional(),
  role: z.enum(ROLES),
};

const createSchema = z.object({
  ...baseFields,
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const editSchema = z.object(baseFields);

function emptyValues() {
  return { name: '', email: '', password: '', mobile: '', area: '', role: 'EXECUTIVE' };
}

function valuesFromUser(user) {
  return {
    name: user.name || '',
    mobile: user.mobile || '',
    area: user.area || '',
    role: user.role || 'EXECUTIVE',
  };
}

export function UserFormDialog({ open, onClose, user }) {
  const isEdit = !!user;
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    reset(isEdit ? valuesFromUser(user) : emptyValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: (payload) => (isEdit ? updateUser(user.id, payload) : createUser(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  function onSubmit(values) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit user' : 'Add a user'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5}>
            {mutation.isError && (
              <Alert severity="error">{mutation.error?.response?.data?.error || 'Could not save this user'}</Alert>
            )}

            <TextField
              label="Full name"
              fullWidth
              size="small"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
            />

            {!isEdit && (
              <TextField
                label="Email"
                type="email"
                fullWidth
                size="small"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email')}
              />
            )}

            <Stack direction="row" spacing={2}>
              <TextField label="Mobile" fullWidth size="small" {...register('mobile')} />
              <TextField label="Area" fullWidth size="small" {...register('area')} />
            </Stack>

            {!isEdit && (
              <TextField
                label="Temporary password"
                type="password"
                fullWidth
                size="small"
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password')}
              />
            )}

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Role
              </Typography>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <ToggleButtonGroup exclusive size="small" value={field.value} onChange={(_, next) => next && field.onChange(next)}>
                    {ROLES.map((role) => (
                      <ToggleButton key={role} value={role}>
                        {role.charAt(0) + role.slice(1).toLowerCase()}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add user'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
