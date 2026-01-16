import React from 'react';
import HomeLoggedIn from './HomeLoggedIn';
import HomeNotLoggedIn from './HomeNotLoggedIn';
import { useAuth } from '../context/AuthContext.jsx';

const Home = () => {
  const { isLoggedIn, user } = useAuth();
  return isLoggedIn ? <HomeLoggedIn user={user} /> : <HomeNotLoggedIn />;
};

export default Home;
