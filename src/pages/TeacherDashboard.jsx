import React, { useState } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

// Import your new Atoms
import {
  Input,
  SelectInput,
  Button
} from '../components/atoms';

const TeacherDashboard = () => {
  // Temporary state just to test the inputs
  const [testValue, setTestValue] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const sampleOptions = [
    { value: 'exam', label: 'Exam' },
    { value: 'assignment', label: 'Assignment' }
  ];

  return (
    <Container maxWidth="sm"> {/* Reduced width to simulate a form card */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
           Teacher Dashboard (Draft)
        </Typography>

        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6">Atom Testing Zone</Typography>
            
            {/* Testing Input Atom */}
            <Input 
                label="Assignment Name" 
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
            />

            {/* Testing Select Atom */}
            <SelectInput 
                label="Type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={sampleOptions}
            />

            {/* Testing Button Atoms */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button color="primary">Save Grade</Button>
                <Button color="error" variant="outlined">Delete</Button>
            </Box>

        </Paper>
      </Box>
    </Container>
  );
};

export default TeacherDashboard;