import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddOutlined from '@mui/icons-material/AddOutlined';
import { fetchUsers, activateUser, deactivateUser } from '@/api/users-api';
import { useAuthStore } from '@/store/auth-store';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingState } from '@/components/common/loading-state';
import { formatDate } from '@/lib/format';

const ROLE_COLORS = { ADMIN: 'error', MANAGER: 'warning', EXECUTIVE: 'default' };

export function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [dialogUser, setDialogUser] = useState(undefined);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
  });

  const toggleActive = useMutation({
    mutationFn: (user) => (user.active ? deactivateUser(user.id) : activateUser(user.id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={`${users.length} accounts`}
        action={
          <Button variant="contained" size="small" startIcon={<AddOutlined sx={{ fontSize: 16 }} />} onClick={() => setDialogUser(null)}>
            Add user
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading users…" />}

      {!isLoading && users.length === 0 && <EmptyState message="No users yet." />}

      {!isLoading && users.length > 0 && (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      color={ROLE_COLORS[user.role]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{user.area || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.active ? 'Active' : 'Deactivated'}
                      color={user.active ? 'success' : 'default'}
                      variant={user.active ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => setDialogUser(user)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color={user.active ? 'error' : 'success'}
                        disabled={user.id === currentUser?.id || toggleActive.isPending}
                        onClick={() => toggleActive.mutate(user)}
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <UserFormDialog open={dialogUser !== undefined} onClose={() => setDialogUser(undefined)} user={dialogUser} />
    </>
  );
}
