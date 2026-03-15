import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { GetAllClasses } from '../../services';

const SelectClass = ({ value, onChange, label = "Select Class", error, helperText, disabled = false, required = false }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Fetch all classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await GetAllClasses();
        const classList = response?.data || response?.classes || [];
        setClasses(classList);
      } catch (error) {
        console.error('[SelectClass] Failed to fetch classes:', error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Update selected class when value prop changes
  useEffect(() => {
    if (value && classes.length > 0) {
      const found = classes.find(cls => (cls._id || cls.id) === value);
      setSelectedClass(found || null);
    } else {
      setSelectedClass(null);
    }
  }, [value, classes]);

  const handleChange = (event, newValue) => {
    setSelectedClass(newValue);
    if (onChange) {
      onChange(newValue ? (newValue._id || newValue.id) : '');
    }
  };

  return (
    <Autocomplete
      value={selectedClass}
      onChange={handleChange}
      options={classes}
      getOptionLabel={(option) => option.className || option.name || 'Unknown Class'}
      loading={loading}
      disabled={disabled || loading}
      isOptionEqualToValue={(option, value) => 
        (option._id || option.id) === (value?._id || value?.id)
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          required={required}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option._id || option.id}>
          <div>
            <div style={{ fontWeight: 500 }}>
              {option.className || option.name || 'Unknown'}
            </div>
            {option.teacherIncharge && (
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Teacher: {option.teacherIncharge.firstName} {option.teacherIncharge.lastName}
              </div>
            )}
            {(option.level || option.year) && (
              <div style={{ fontSize: '0.75rem', color: '#999' }}>
                {option.level && `Level: ${option.level}`}
                {option.level && option.year && ' | '}
                {option.year && `Year: ${option.year}`}
              </div>
            )}
          </div>
        </li>
      )}
      noOptionsText={loading ? "Loading classes..." : "No classes found"}
      fullWidth
    />
  );
};

export default SelectClass;
