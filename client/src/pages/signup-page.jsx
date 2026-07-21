import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import MailOutlineOutlined from '@mui/icons-material/MailOutlineOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined';
import { register as registerAccount } from '@/api/auth-api';
import { useAuthStore } from '@/store/auth-store';
import { Logo } from '@/components/common/logo';
import { ThemeToggle } from '@/components/common/theme-toggle';

const signupSchema = z.object({
  name: z.string().min(1, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mobile: z.string().optional(),
});

export function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values) {
    setServerError(null);
    try {
      const { user, accessToken } = await registerAccount(values);
      setSession(user, accessToken);
      navigate('/');
    } catch (error) {
      setServerError(error.response?.data?.error || 'Unable to create your account');
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 384 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Logo />
              <Typography variant="subtitle1" fontWeight={700}>
                Fieldbook
              </Typography>
            </Stack>
            <ThemeToggle />
          </Stack>

          <Typography variant="h5" fontWeight={600} gutterBottom>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign up as a field executive to start logging visits.
          </Typography>

          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Full name"
              autoComplete="name"
              error={!!errors.name}
              helperText={errors.name?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('name')}
            />
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
              label="Mobile (optional)"
              autoComplete="tel"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('mobile')}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="new-password"
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
              startIcon={<PersonAddOutlined sx={{ fontSize: 18 }} />}
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Already have an account? <Link component={RouterLink} to="/login">Sign in</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
