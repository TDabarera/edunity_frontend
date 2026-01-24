import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  Typography,
  TablePagination,
  Grid,
} from '@mui/material';
import { SearchBar, Button, Skeleton, SelectInput, Input } from '../atoms';
import { TableHeader, RowActions } from '../molecules';
import colors from '../../styles/colors';
import { GetAllUsers } from '../../services';

const UserTable = ({ onAddUser, onEditUser, onDeleteUser, onError, refreshToken, currentUserId, filterByRole }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);

  // Check if user is the current logged-in user
  const isCurrentUser = (userId) => userId === currentUserId;

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await GetAllUsers();
        let usersList = response.users || [];
        
        // Apply role filter if specified
        if (filterByRole) {
          usersList = usersList.filter(user => 
            (user.userType || '').toLowerCase() === filterByRole.toLowerCase()
          );
        }
        
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        setUsers([]);
        setFilteredUsers([]);
        const errorMsg = error.message || 'Failed to fetch users';
        if (onError) {
          onError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [onError, refreshToken, filterByRole]);

  // Filter users by search term
  useEffect(() => {
    const filtered = users.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const userType = (user.userType || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      const accountNo = (user.accountNumber || user.accountNo || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      const userTypeMatch = userTypeFilter ? userType === userTypeFilter.toLowerCase() : true;
      const accountMatch = accountFilter
        ? accountNo.includes(accountFilter.toLowerCase())
        : true;

      const textMatch =
        fullName.includes(search) ||
        email.includes(search) ||
        userType.includes(search) ||
        phone.includes(search) ||
        accountNo.includes(search);

      return userTypeMatch && accountMatch && textMatch;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users, userTypeFilter, accountFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Calculate paginated users
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Search and Add Button */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4} sx={{ minWidth: 400 }}>
            <SearchBar
              placeholder="Search by name, email, phone, account"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={12} md={4} sx={{ minWidth: 160 }}>
            <SelectInput
              label="User Type"
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              options={[
                { label: 'All', value: '' },
                { label: 'Admin', value: 'Admin' },
                { label: 'Teacher', value: 'Teacher' },
                { label: 'Student', value: 'Student' },
                { label: 'Parent', value: 'Parent' }
              ]}
              sx={{ width: '100%' }}
              placeholder="All"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Input
              label="Account Number"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              placeholder="Account #"
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={12} md={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={onAddUser}>
              {filterByRole ? `Add ${filterByRole}` : 'Add User'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      {/* Table Container */}
      <Paper sx={{ p: 4, elevation: 2 }}>
        {loading ? (
          <Table>
            <TableHeader />
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="90%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="50%" /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="body1" color={colors.text.secondary}>
              {searchTerm ? 'No users found matching your search.' : 'No users available.'}
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHeader />
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow
                  key={user._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: colors.primary.greyLight
                    },
                  }}
                >
                  <TableCell>
                    {`${user.firstName || ''} ${user.lastName || ''}`.trim()}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.userType}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>{user.accountNumber || user.accountNo || '-'}</TableCell>
                  <TableCell>
                    <RowActions
                      onEdit={() => onEditUser(user)}
                      onDelete={isCurrentUser(user._id) ? null : () => onDeleteUser(user._id)}
                      disableDelete={isCurrentUser(user._id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[20]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 2,
          }}
        />
      )}
    </Box>
  );
};

export default UserTable;
