import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined';
import LocalFireDepartmentOutlined from '@mui/icons-material/LocalFireDepartmentOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';

export const DASHBOARD_STAT_TILES = [
  { key: 'visitsThisWeek', label: 'Visits this week', icon: EventNoteOutlined },
  { key: 'hotLeads', label: 'Hot leads', icon: LocalFireDepartmentOutlined },
  { key: 'followUpsDue', label: 'Follow-ups due', icon: NotificationsNoneOutlined },
  { key: 'wonThisMonth', label: 'Won this month', icon: EmojiEventsOutlined },
];
