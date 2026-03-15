import React from 'react';
import MuiSkeleton from '@mui/material/Skeleton';
import PropTypes from 'prop-types';

const Skeleton = ({ variant = 'text', width, height, animation = 'wave', sx, ...props }) => {
  return (
    <MuiSkeleton
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      sx={sx}
      {...props}
    />
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'rectangular', 'rounded', 'circular']),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  animation: PropTypes.oneOf(['pulse', 'wave', false]),
  sx: PropTypes.object,
};

export default Skeleton;
