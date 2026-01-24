import { useState, useCallback } from 'react';
import Toast from './Toast';

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
