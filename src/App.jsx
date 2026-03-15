import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import UserManagement from './pages/UserManagement.jsx';
import MyAccount from './pages/MyAccount.jsx';
import ClassManagement from './pages/ClassManagement.jsx';
import Attendance from './pages/Attendance.jsx';
import ParentManagement from './pages/ParentManagement.jsx';
import Assignments from './pages/Assignments.jsx';
// import Playground from './pages/Playground'; // Temporarily commented out per request

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/class-management" element={<ClassManagement />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/parent-management" element={<ParentManagement />} />
        <Route path="/assignments" element={<Assignments />} />
        {/* <Route path="/playground" element={<Playground />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;