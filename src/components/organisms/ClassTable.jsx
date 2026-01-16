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
  TableHead,
} from '@mui/material';
import { SearchBar, Button } from '../atoms';
import { RowActions } from '../molecules';
import colors from '../../styles/colors';
import { GetAllClasses } from '../../services';

const ClassTable = ({ onAddClass, onEditClass, onDeleteClass, onError, refreshToken }) => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await GetAllClasses();
        const classList = response.data || [];
        setClasses(classList);
        setFilteredClasses(classList);
      } catch (error) {
        setClasses([]);
        setFilteredClasses([]);
        const errorMsg = error.message || 'Failed to fetch classes';
        if (onError) {
          onError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [onError, refreshToken]);

  // Filter classes by search term
  useEffect(() => {
    const filtered = classes.filter((cls) => {
      const className = (cls.className || '').toLowerCase();
      const year = (cls.year || '').toLowerCase();
      const teacherName = cls.teacherIncharge 
        ? `${cls.teacherIncharge.firstName || ''} ${cls.teacherIncharge.lastName || ''}`.toLowerCase()
        : '';
      const search = searchTerm.toLowerCase();

      return (
        className.includes(search) ||
        year.includes(search) ||
        teacherName.includes(search)
      );
    });
    setFilteredClasses(filtered);
    setPage(0);
  }, [searchTerm, classes]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Calculate paginated classes
  const paginatedClasses = filteredClasses.slice(
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
          flexWrap: 'wrap',
        }}
      >
        <SearchBar
          placeholder="Search by Class Name, Year, Teacher"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, maxWidth: '400px' }}
        />
        <Button variant="contained" onClick={onAddClass}>
          Add Class
        </Button>
      </Box>

      {/* Table Container */}
      <Paper sx={{ p: 4, elevation: 2, overflowX: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredClasses.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="body1" color={colors.text.secondary}>
              {searchTerm ? 'No classes found matching your search.' : 'No classes available.'}
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: colors.primary.greyLight }}>
                <TableCell sx={{ fontWeight: 600 }}>Class Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Year</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teacher in Charge</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClasses.map((cls) => (
                <TableRow
                  key={cls._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: colors.primary.greyLight,
                    },
                  }}
                >
                  <TableCell>{cls.className}</TableCell>
                  <TableCell>{cls.year}</TableCell>
                  <TableCell>
                    {cls.teacherIncharge
                      ? `${cls.teacherIncharge.firstName} ${cls.teacherIncharge.lastName}`
                      : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => onEditClass(cls)}
                      onDelete={() => onDeleteClass(cls._id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Pagination */}
      {!loading && filteredClasses.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={filteredClasses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}
        />
      )}
    </Box>
  );
};

export default ClassTable;
