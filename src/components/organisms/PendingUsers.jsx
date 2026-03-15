import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Input, SearchBar } from '../atoms';
import { TableHeader, RowActions } from '../molecules';
import { GetPendingUsers } from '../../services';
import colors from '../../styles/colors';

const pendingUsersColumns = [
  { label: 'Name', align: 'left' },
  { label: 'Email', align: 'left' },
  { label: 'User Type', align: 'left' },
  { label: 'Phone', align: 'left' },
  { label: 'Account No', align: 'left' },
  { label: 'Actions', align: 'center' },
];

const PendingUsers = ({ onEditUser, onError, refreshToken }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        setLoading(true);
        const response = await GetPendingUsers();
        setUsers(response?.users || []);
      } catch (error) {
        setUsers([]);
        const errorMsg = error?.message || 'Failed to fetch pending users';
        if (onError) onError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, [onError, refreshToken]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    const accountSearch = accountFilter.toLowerCase();

    return users.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const userType = (user.userType || '').toLowerCase();
      const accountNo = (user.accountNumber || user.accountNo || '').toLowerCase();

      const matchesSearch =
        fullName.includes(search) ||
        email.includes(search) ||
        userType.includes(search) ||
        accountNo.includes(search);

      const matchesAccount = accountSearch ? accountNo.includes(accountSearch) : true;

      return matchesSearch && matchesAccount;
    });
  }, [users, searchTerm, accountFilter]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, accountFilter]);

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, pt: 0 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 600, color: colors.primary.dark }}
      >
        Pending Users
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6} sx={{ minWidth: 320 }}>
            <SearchBar
              placeholder="Search by name, email, role, account"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Input
              label="Account Number"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              placeholder="Account #"
              sx={{ width: '100%' }}
            />
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: colors.primary.main }} />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="body1" color={colors.text.secondary}>
              No pending users found.
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHeader columns={pendingUsersColumns} />
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow
                    key={user._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: colors.primary.greyLight,
                      },
                    }}
                  >
                    <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>{user.userType || '-'}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{user.accountNumber || user.accountNo || '-'}</TableCell>
                    <TableCell>
                      <RowActions
                        onEdit={() => onEditUser?.(user, { showApprovalField: true })}
                        disableDelete={true}
                        editTooltip="Review Approval"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[10]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PendingUsers;
