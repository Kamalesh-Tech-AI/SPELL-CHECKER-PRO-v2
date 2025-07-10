import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DSAProvider } from './contexts/DSAContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} 
      />
      <Route 
        path="/admin" 
        element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/dashboard" 
        element={user?.role === 'user' ? <UserDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <DSAProvider>
        <Router>
          <AppContent />
        </Router>
      </DSAProvider>
    </AuthProvider>
  );
}

export default App;