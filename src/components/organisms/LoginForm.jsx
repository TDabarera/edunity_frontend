import React, { useState } from 'react';
import { Paper, Box, Typography, InputAdornment, IconButton, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Input, Button } from '../atoms';

const LoginForm = ({ onSubmit, error, loading }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <Paper 
    elevation={16}
    sx={{ 
        p: 6,
        }}>
      <Typography variant="h6">Login</Typography>
      <Box component="form" onSubmit={(e) => onSubmit(e, formData)} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        
        <Input 
          label="Email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
        />

        <Input 
          label="Password"
          name="password" 
          type={showPassword ? 'text' : 'password'} 
          value={formData.password} 
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" color="primary" fullWidth disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;