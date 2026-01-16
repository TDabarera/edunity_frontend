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
} from '@mui/material';
import { SearchBar, Button } from '../atoms';
import { TableHeader, RowActions } from '../molecules';
import colors from '../../styles/colors';
import { GetAllUsers } from '../../services';

const UserTable = ({ onAddUser, onEditUser, onDeleteUser, onError, refreshToken }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await GetAllUsers();
        const usersList = response.users || [];
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
  }, [onError, refreshToken]);

  // Filter users by search term
  useEffect(() => {
    const filtered = users.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const userType = (user.userType || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      const accountNo = (user.accountNo || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      return (
        fullName.includes(search) ||
        email.includes(search) ||
        userType.includes(search) ||
        phone.includes(search) ||
        accountNo.includes(search)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
        }}
      >
        <SearchBar
          placeholder="Search by Name, Email, User Type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, maxWidth: '400px' }}
        />
        <Button variant="contained" onClick={onAddUser}>
          Add User
        </Button>
      </Box>

      {/* Table Container */}
      <Paper sx={{ p: 4, elevation: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
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
                      onDelete={() => onDeleteUser(user._id)}
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
