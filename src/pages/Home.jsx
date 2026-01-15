import React, { useState } from 'react';
import HomeLoggedIn from './HomeLoggedIn';
import HomeNotLoggedIn from './HomeNotLoggedIn';

const Home = () => {
  const [isLoggedIn] = useState(true);
  const [user] = useState({
    name: 'John Doe',
    role: 'admin'
  });

  return isLoggedIn ? (
    <HomeLoggedIn user={user} />
  ) : (
    <HomeNotLoggedIn />
  );
};

export default Home;
