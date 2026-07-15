import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function SectionHeading({ icon: Icon, children, sx }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1.5, ...sx }}>
      {Icon && <Icon sx={{ fontSize: 18, color: 'text.secondary' }} />}
      <Typography variant="subtitle2">{children}</Typography>
    </Stack>
  );
}
