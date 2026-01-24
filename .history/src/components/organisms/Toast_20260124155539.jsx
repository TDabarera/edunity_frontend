import React, { useState, useCallback } from 'react';
import { Alert, Snackbar } from '@mui/material';

const Toast = ({ open, message, severity, onClose, autoHideDuration = 6000 }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export const useToast = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const showToast = useCallback((msg, sev = 'success') => {
    console.log('[useToast] showToast called with:', msg, sev);
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const closeToast = () => {
    setOpen(false);
  };

  const ToastComponent = () => (
    <Toast 
      open={open}
      message={message}
      severity={severity}
      onClose={closeToast}
    />
  );

  return { open, message, severity, showToast, closeToast, Toast: ToastComponent };
};

export default Toast;
