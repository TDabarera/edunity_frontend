import React from 'react';
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import colors from '../../styles/colors';

const DashboardCard = ({
  variant = 'metric',
  title,
  value,
  subtitle,
  icon,
  color = colors.primary.main,
  statusLabel,
  onClick,
  children,
}) => {
  const isClickable = typeof onClick === 'function';
  const isPlaceholder = variant === 'placeholder';
  const isStatus = variant === 'status';

  const cardStyles = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${alpha(color, 0.45)}`,
    borderTop: isStatus || isPlaceholder ? undefined : `4px solid ${color}`,
    backgroundColor: isStatus ? alpha(color, 0.12) : '#fff',
  };

  if (isPlaceholder) {
    cardStyles.border = `1px dashed ${alpha(color, 0.6)}`;
    cardStyles.backgroundColor = alpha(color, 0.08);
  }

  const renderMetricContent = () => (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="overline" sx={{ color: colors.text.secondary, letterSpacing: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text.primary, lineHeight: 1.2 }}>
          {value}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" sx={{ color: colors.text.secondary, mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {icon ? (
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            backgroundColor: alpha(color, 0.14),
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      ) : null}
    </Stack>
  );

  const renderStatusContent = () => (
    <Stack spacing={1.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.text.primary }}>
          {title}
        </Typography>
        {icon}
      </Stack>
      {subtitle ? (
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          {subtitle}
        </Typography>
      ) : null}
      {value ? (
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          {value}
        </Typography>
      ) : null}
      {statusLabel ? (
        <Chip
          size="small"
          label={statusLabel}
          sx={{
            alignSelf: 'flex-start',
            border: `1px solid ${color}`,
            color,
            backgroundColor: alpha(color, 0.08),
            fontWeight: 600,
          }}
        />
      ) : null}
    </Stack>
  );

  const renderPlaceholderContent = () => (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.text.primary }}>
          {title}
        </Typography>
        <Chip
          size="small"
          label="Coming Soon"
          sx={{
            border: `1px solid ${color}`,
            color,
            backgroundColor: alpha(color, 0.08),
            fontWeight: 600,
          }}
        />
      </Stack>
      <Typography variant="body2" sx={{ color: colors.text.secondary }}>
        {subtitle}
      </Typography>
    </Stack>
  );

  const content = (
    <CardContent sx={{ flex: 1 }}>
      {children || (isPlaceholder ? renderPlaceholderContent() : isStatus ? renderStatusContent() : renderMetricContent())}
    </CardContent>
  );

  return (
    <Card elevation={0} sx={cardStyles}>
      {isClickable ? (
        <CardActionArea sx={{ height: '100%' }} onClick={onClick}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
};

export default DashboardCard;
