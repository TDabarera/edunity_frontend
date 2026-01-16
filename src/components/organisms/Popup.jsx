import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
} from '@mui/material';
import { Button } from '../atoms';
import colors from '../../styles/colors';

const Popup = ({
  open = false,
  title = 'Confirm',
  description = 'Are you sure?',
  onConfirm = () => {},
  onCancel = () => {},
  confirmText = 'Yes',
  cancelText = 'No',
  confirmVariant = 'contained',
  cancelVariant = 'outlined',
  imageUrl = '/Characters/Thinking.png',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth={false}
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          overflow: 'visible',
          padding: '16px',
          maxWidth: 560,
          width: 'auto',
          flexBasis: 'auto',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: colors.primary.main,
          fontWeight: 'bold',
          fontSize: '1.25rem',
          padding: '20px',
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ padding: '24px', position: 'relative', overflow: 'visible' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', position: 'relative' }}>
          {/* Text Content */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body1"
              color={colors.text.primary}
              sx={{
                lineHeight: '1.6',
              }}
            >
              {description}
            </Typography>
          </Box>

          {/* Image */}
          {imageUrl && (
            <Box
              component="img"
              src={imageUrl}
              alt="Popup illustration"
              sx={{
                width: '350px',
                position: 'absolute',
                right: '-250px',
                top: '-120px',
                flexShrink: 0,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          padding: '16px 24px',
          gap: '12px',
          display: 'flex',
          justifyContent: 'flex-start',
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={onCancel}
          sx={{
            minWidth: '100px',
            borderColor: colors.button.primaryOutlined,
            color: colors.button.primaryOutlined,
            '&:hover': {
              backgroundColor: colors.button.primaryOutlinedHover,
              borderColor: colors.button.primaryOutlined,
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          sx={{
            minWidth: '100px',
            backgroundColor: colors.button.primaryContained,
            color: '#fff',
            '&:hover': {
              backgroundColor: colors.button.primaryContainedHover,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Popup;
