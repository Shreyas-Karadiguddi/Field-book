import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import TodayOutlined from '@mui/icons-material/TodayOutlined';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import { fetchFollowUps } from '@/api/visits-api';
import { useAuthStore } from '@/store/auth-store';
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
  overdue: { title: 'Overdue', color: 'error.main', icon: ErrorOutlineOutlined },
  today: { title: 'Today', color: 'stage.hot', icon: TodayOutlined },
  upcoming: { title: 'Upcoming', color: 'text.secondary', icon: ScheduleOutlined },
};

export function FollowUpsPage() {
  const user = useAuthStore((state) => state.user);
  const isExecutive = user?.role === 'EXECUTIVE';
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
          items.length > 0 ? (
            <FollowUpGroup
              key={key}
              title={GROUP_META[key].title}
              color={GROUP_META[key].color}
              icon={GROUP_META[key].icon}
              items={items}
              showExecutive={!isExecutive}
            />
          ) : null,
        )}
      </Stack>
    </>
  );
}

function FollowUpGroup({ title, color, icon: Icon, items, showExecutive }) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color }}>
        <Icon sx={{ fontSize: 16 }} />
        <Typography variant="overline" sx={{ color: 'inherit', fontWeight: 700 }}>
          {title} · {items.length}
        </Typography>
      </Stack>
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
                  <Stack sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(fu.dueDate)}
                    </Typography>
                    {showExecutive && fu.executive?.name && (
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {fu.executive.name}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
