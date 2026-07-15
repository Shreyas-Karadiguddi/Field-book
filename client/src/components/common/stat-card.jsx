import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function StatCard({ label, value, icon: Icon }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.5 }}>
          {Icon && <Icon sx={{ fontSize: 18, color: 'text.secondary' }} />}
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={600}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
