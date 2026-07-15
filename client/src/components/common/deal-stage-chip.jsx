import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';

const STAGE_LABELS = { LEAD: 'Lead', HOT: 'Hot', WON: 'Won', LOST: 'Lost' };
const STAGE_KEYS = { LEAD: 'lead', HOT: 'hot', WON: 'won', LOST: 'lost' };

export function DealStageChip({ stage, size = 'small' }) {
  const theme = useTheme();
  const color = theme.palette.stage[STAGE_KEYS[stage]] || theme.palette.stage.lead;

  return (
    <Chip
      label={STAGE_LABELS[stage] || stage}
      size={size}
      sx={{
        bgcolor: color,
        color: theme.palette.common.white,
        fontWeight: 700,
      }}
    />
  );
}
