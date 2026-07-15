import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fetchFollowUps } from '@/api/visits-api';
import { PageHeader } from '@/components/common/page-header';
import { LoadingState } from '@/components/common/loading-state';
import { formatDate } from '@/lib/format';

function groupFollowUps(followUps) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const groups = { overdue: [], today: [], upcoming: [] };
  for (const fu of followUps) {
    const due = new Date(fu.dueDate);
    if (due < startOfToday) groups.overdue.push(fu);
    else if (due < endOfToday) groups.today.push(fu);
    else groups.upcoming.push(fu);
  }
  return groups;
}

const GROUP_META = {
  overdue: { title: 'Overdue', color: 'error.main' },
  today: { title: 'Today', color: 'stage.hot' },
  upcoming: { title: 'Upcoming', color: 'text.secondary' },
};

export function FollowUpsPage() {
  const { data: followUps = [], isLoading } = useQuery({
    queryKey: ['follow-ups'],
    queryFn: () => fetchFollowUps(),
  });

  const groups = useMemo(() => groupFollowUps(followUps), [followUps]);

  return (
    <>
      <PageHeader title="Follow-ups" subtitle={`${followUps.length} scheduled`} />

      {isLoading && <LoadingState message="Loading follow-ups…" />}

      <Stack spacing={4}>
        {Object.entries(groups).map(([key, items]) =>
          items.length > 0 ? <FollowUpGroup key={key} title={GROUP_META[key].title} color={GROUP_META[key].color} items={items} /> : null,
        )}
      </Stack>
    </>
  );
}

function FollowUpGroup({ title, color, items }) {
  return (
    <Stack spacing={1}>
      <Typography variant="overline" sx={{ color, fontWeight: 700 }}>
        {title} · {items.length}
      </Typography>
      <Stack spacing={1}>
        {items.map((fu) => (
          <Card key={fu.id}>
            <CardActionArea component={Link} to={`/clients/${fu.clientId}`}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {fu.client?.shopName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fu.notes}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(fu.dueDate)}
                  </Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
