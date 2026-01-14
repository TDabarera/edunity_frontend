import React, { useState } from 'react';
import MainLayout from './components/templates/MainLayout';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  // Simulate login state for testing
  // Try changing isLoggedIn to false to see the header change!
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState({
    name: 'John Doe',
    role: 'Teacher'
  });

  return (
    <MainLayout isLoggedIn={isLoggedIn} user={user}>
      <TeacherDashboard />
    </MainLayout>
  );
}

export default App;