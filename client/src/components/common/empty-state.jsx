import Typography from '@mui/material/Typography';

export function EmptyState({ message }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  );
}
