import React, { useState } from 'react';
import { Paper, Box, Typography, InputAdornment, IconButton, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Input, Button, SelectInput } from '../atoms';

const SignupForm = ({ onSubmit, error, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    userType: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dob: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const message = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const todayISO = new Date().toISOString().split('T')[0];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]{2,}$/;
  const phoneRegex = /^[0-9()+\-\s]{7,20}$/;

  const validatePassword = (pwd) => {
    if (!pwd) return 'Password is required';
    if (pwd.length < 8) return 'Use at least 8 characters';
    if (!/[a-z]/.test(pwd)) return 'Include a lowercase letter';
    if (!/[A-Z]/.test(pwd)) return 'Include an uppercase letter';
    if (!/[0-9]/.test(pwd)) return 'Include a number';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pwd)) return 'Include a special character';
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value) return 'First name is required';
        if (!nameRegex.test(value)) return 'Only letters, spaces, hyphens, apostrophes';
        return '';
      case 'lastName':
        if (!value) return 'Last name is required';
        if (!nameRegex.test(value)) return 'Only letters, spaces, hyphens, apostrophes';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!emailRegex.test(value)) return 'Enter a valid email address';
        return '';
      case 'userType':
        if (!value) return 'Select a user type';
        return '';
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        if (!value) return 'Confirm your password';
        if (value !== formData.password) return "Passwords don't match";
        return '';
      case 'phone':
        if (!value) return '';
        if (!phoneRegex.test(value)) return 'Enter a valid phone number';
        return '';
      case 'dob':
        if (!value) return '';
        if (value > todayISO) return 'Date cannot be in the future';
        return '';
      case 'address':
        if (!value) return '';
        if (value.trim().length < 6) return 'Address should be at least 6 characters';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const nextErrors = Object.keys(formData).reduce((acc, key) => {
      const msg = validateField(key, formData[key]);
      if (msg) acc[key] = msg;
      return acc;
    }, {});
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const userTypeOptions = [
    { value: 'Student', label: 'Student' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Parent', label: 'Parent' }
  ];

  const validationMessages = Array.from(new Set(Object.values(errors).filter(Boolean)));

  return (
    <>
      <Paper elevation={16} sx={{ p: 6 }}>
      <Typography variant="h6">Sign Up</Typography>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (validateForm()) {
            onSubmit(e, formData);
          }
        }}
        noValidate
      >
        {error && <Alert severity="error">{error}</Alert>}

        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.firstName}
          helperText={errors.firstName}
          required
          autoComplete="given-name"
          inputProps={{ minLength: 2, pattern: nameRegex.source }}
          fullWidth
        />

        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.lastName}
          helperText={errors.lastName}
          required
          autoComplete="family-name"
          inputProps={{ minLength: 2, pattern: nameRegex.source }}
          fullWidth
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.email}
          helperText={errors.email}
          required
          autoComplete="email"
          inputProps={{ inputMode: 'email', pattern: emailRegex.source }}
          fullWidth
        />

        <SelectInput
          label="User Type"
          name="userType"
          value={formData.userType}
          onChange={handleChange}
          onBlur={handleBlur}
          options={userTypeOptions}
          error={!!errors.userType}
          helperText={errors.userType}
          required
          fullWidth
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.phone}
          helperText={errors.phone}
          autoComplete="tel"
          inputMode="tel"
          inputProps={{ pattern: phoneRegex.source, maxLength: 20 }}
          placeholder="e.g. 0773 123 456"
          fullWidth
        />

        <Input
          label="Date of Birth"
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.dob}
          helperText={errors.dob}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: todayISO }}
          fullWidth
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.address}
          helperText={errors.address}
          autoComplete="street-address"
          multiline
          rows={3}
          fullWidth
        />

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.password}
          helperText={errors.password || '8+ chars, upper, lower, number, symbol'}
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
          fullWidth
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
          fullWidth
        />

        {validationMessages.length > 0 && (
          <Alert severity="error" sx={{ mt: 1 }}>
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              {validationMessages.map((message, idx) => (
                <Box component="li" key={`${message}-${idx}`} sx={{ mb: 0.5 }}>
                  {message}
                </Box>
              ))}
            </Box>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" color="primary" fullWidth disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </Box>
      </Box>
      </Paper>
    </>
  );
};

export default SignupForm;
