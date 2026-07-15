import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export function LoadingState({ message = 'Loading…' }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
      <CircularProgress size={18} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Stack>
  );
}
