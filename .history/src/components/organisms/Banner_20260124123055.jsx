import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Button } from '../atoms';
import colors from '../../styles/colors';

const Banner = ({ 
  heading, 
  subheading, 
  description, 
  buttonText, 
  buttonAction,
  avatarImage,
  backgroundColor = colors.bannerBg,
  textColor = colors.text.primary
}) => {
return (
    <Box
        sx={{
            position: 'relative',
            backgroundColor: backgroundColor,
            color: textColor,
            py: 5,
            px: 7,
            borderRadius: 2,
            overflow: 'visible',
            mb: 2,
            maxWidth: { xs: '100%', md: '900px' },
            mx: 'auto',
        }}
    >
        <Container maxWidth="md" disableGutters>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {subheading && (
                    <Typography 
                        variant="overline" 
                        sx={{ 
                            display: 'block',
                            mb: 1,
                            opacity: 0.9,
                            fontWeight: 600,
                            letterSpacing: 1
                        }}
                    >
                        {subheading}
                    </Typography>
                )}
                
                <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 'bold', 
                        mb: 2,
                        fontSize: { xs: '2rem', md: '3rem' }
                    }}
                >
                    {heading}
                </Typography>
                
                {description && (
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            mb: 3, 
                            opacity: 0.95,
                            maxWidth: '600px',
                            fontSize: '1.1rem',
                            lineHeight: 1.6
                        }}
                    >
                        {description}
                    </Typography>
                )}
                
                {buttonText && (
                    <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={buttonAction}
                        sx={{
                            backgroundColor: colors.secondary.main,
                            color: colors.secondary.contrastText,
                            '&:hover': {
                                backgroundColor: colors.secondary.dark,
                            }
                        }}
                    >
                        {buttonText}
                    </Button>
                )}
            </Box>
        </Container>

        {avatarImage && (
            <Box
                component="img"
                src={avatarImage}
                alt="Banner Avatar"
                sx={{
                    position: 'absolute',
                    top: { xs: -20, md: -40 },
                    right: { xs: -20, md: -40 },
                    width: { xs: '150px', md: '300px' },
                    height: 'auto',
                    zIndex: 2,
                    objectFit: 'contain',
                }}
            />
        )}
    </Box>
);
};

export default Banner;
