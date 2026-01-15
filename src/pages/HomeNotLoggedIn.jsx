import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import MainLayout from '../components/templates/MainLayout';
import { Banner } from '../components/organisms';
import { Button } from '../components/atoms';
import colors from '../styles/colors';

const HomeNotLoggedIn = () => {
  return (
    <MainLayout isLoggedIn={false} user={null}>
      <Container maxWidth="lg">
        {/* Main Banner with Background Image */}
        <Box
            sx={{
                position: 'relative',
                backgroundImage: 'url(/Posters/MainBanner.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#fff',
                py: 15,
                px: 40,
                borderRadius: 2,
                mb: 4,
                mt: -4,
                minHeight: '400px',
                width: '100vw',
                left: '50%',
                right: '50%',
                ml: '-50vw',
                mr: '-50vw',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                maxWidth: '100vw',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: 2,
                }
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
                <Typography 
                    variant="overline" 
                    sx={{ 
                        display: 'block',
                        mb: 1,
                        fontWeight: 600,
                        letterSpacing: 1.5,
                        fontSize: '1rem'
                    }}
                >
                    Welcome to EdUnity!
                </Typography>
                
                <Typography 
                    variant="h2" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 'bold', 
                        mb: 3,
                        fontSize: { xs: '2.5rem', md: '3.5rem' }
                    }}
                >
                    Bridging the Gap Between Students and Home
                </Typography>
                
                <Typography 
                    variant="body1" 
                    sx={{ 
                        mb: 4,
                        fontSize: '1.2rem',
                        lineHeight: 1.7
                    }}
                >
                    Empowering educators, engaging parents, and elevating student success with real-time progress tracking.
                </Typography>
            </Box>
        </Box>

        {/* Problem & Solution Section */}
        <Box sx={{ py: 3 }}>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 4,
              mb: 4
            }}
          >
            {/* The Challenge */}
            <Box 
              sx={{ 
                p: 4,
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: 2,
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: colors.primary.main,
                  mb: 2
                }}
              >
                The Challenge
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: colors.text.primary,
                  mb: 2
                }}
              >
                Parent-Student-Tutor Communication Gap
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: colors.text.secondary,
                  mb: 2,
                  lineHeight: 1.7
                }}
              >
                In SriLanka even with the rise of Learner Management Software still teachers tend to leave the parents disconnected.
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: colors.text.secondary,
                  lineHeight: 1.7
                }}
              >
                Teachers overwhelmed with administrative tasks, and administration lacking real-time insights, leads to communication gaps, missed opportunities and an overall less efficient learning environment.
              </Typography>
            </Box>

            {/* Our Solution */}
            <Box 
              sx={{ 
                p: 4,
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: 2,
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: colors.primary.main,
                  mb: 2
                }}
              >
                Our Solution
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: colors.text.primary,
                  mb: 2
                }}
              >
                A Smart School Companion
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: colors.text.secondary,
                  mb: 2,
                  lineHeight: 1.7
                }}
              >
                It is a unified, intuitive platform designed to streamline operations to foster active engagement from teachers and parents.
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: colors.text.secondary,
                  lineHeight: 1.7
                }}
              >
                We provide a single web application for all staff and a single mobile application for all the students and parents, ensuring everyone stays informed and connected real-time. We will be digitizing the student record book.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Support Banner */}
        <Banner 
          heading="Reach out to the Support Team"
          subheading="We are available 24/7"
          description="You may first reach out to the institution's support team for assistance. If they are unable to help, please contact EdUnity support directly."
          buttonText="Contact Support"
          buttonAction={() => console.log('Contact Support clicked')}
          avatarImage="/Characters/BookADemo.png"
        />

        {/* Mission & Vision Section */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              textAlign: 'center',
              mb: 6,
              color: colors.text.primary
            }}
          >
            Aiming for a Bright Future
          </Typography>
          
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 4,
              mb: 4
            }}
          >
            {/* Mission */}
            <Box 
              sx={{ 
                p: 4,
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: 2,
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: colors.primary.main,
                  mb: 3
                }}
              >
                Mission
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: colors.text.secondary,
                  lineHeight: 1.7
                }}
              >
                Our mission is to bridge the gap between learning and home by delivering a simple, secure, and smart platform that streamlines management, fosters active engagement, and empowers educators with real-time insights to drive learner success.
              </Typography>
            </Box>

            {/* Vision */}
            <Box 
              sx={{ 
                p: 4,
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: 2,
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: colors.secondary.main,
                  mb: 3
                }}
              >
                Vision
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: colors.text.secondary,
                  lineHeight: 1.7
                }}
              >
                To create a future where every learner, educator, and parent is seamlessly connected, empowered, and engaged through technology that makes education more transparent, collaborative, and impactful.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default HomeNotLoggedIn;
