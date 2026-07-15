import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import MailOutlineOutlined from '@mui/icons-material/MailOutlineOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import LoginOutlined from '@mui/icons-material/LoginOutlined';
import { login } from '@/api/auth-api';
import { useAuthStore } from '@/store/auth-store';
import { isDemoMode } from '@/lib/demo-mode';
import { Logo } from '@/components/common/logo';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values) {
    setServerError(null);
    try {
      const { user, accessToken } = await login(values);
      setSession(user, accessToken);
      navigate('/');
    } catch (error) {
      setServerError(error.response?.data?.error || 'Unable to sign in');
    }
  }

  async function handleDemoLogin(role) {
    setServerError(null);
    const { user, accessToken } = await login({ email: '', password: '', role });
    setSession(user, accessToken);
    navigate('/');
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 384 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <Logo />
            <Typography variant="subtitle1" fontWeight={700}>
              Fieldbook
            </Typography>
          </Stack>

          <Typography variant="h5" fontWeight={600} gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to continue your visits.
          </Typography>

          {isDemoMode && (
            <>
              <Stack spacing={1.5} sx={{ mb: 3, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Demo mode — no backend needed. Pick a role to explore:
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" fullWidth onClick={() => handleDemoLogin('EXECUTIVE')}>
                    View as Executive
                  </Button>
                  <Button variant="outlined" size="small" fullWidth onClick={() => handleDemoLogin('MANAGER')}>
                    View as Manager
                  </Button>
                </Stack>
              </Stack>
              <Divider sx={{ mb: 3 }} />
            </>
          )}

          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Email"
              type="email"
              placeholder="rahul@fieldbook.co"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('email')}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('password')}
            />
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={<LoginOutlined sx={{ fontSize: 18 }} />}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
