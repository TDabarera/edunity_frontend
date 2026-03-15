import React, { useEffect } from 'react';
import HomeLoggedIn from './HomeLoggedIn';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { decodeJWT } from '../utils/jwtUtils';

const Home = () => {
  const { isLoggedIn, isAuthInitialized, user } = useAuth();
  const navigate = useNavigate();

  const token = localStorage.getItem('edunity_token');
  const decodedToken = token ? decodeJWT(token) : null;
  const role = String(
    decodedToken?.role ||
    decodedToken?.userType ||
    decodedToken?.user?.role ||
    decodedToken?.user?.userType ||
    user?.role ||
    ''
  ).toLowerCase();

  useEffect(() => {
    if (isAuthInitialized && !isLoggedIn) {
      navigate('/login');
    }
  }, [isAuthInitialized, isLoggedIn, navigate]);

  if (!isAuthInitialized || !isLoggedIn) {
    return null;
  }

  return <HomeLoggedIn user={user} role={role} />;
};

export default Home;
