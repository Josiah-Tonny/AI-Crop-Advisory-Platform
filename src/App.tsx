import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Auth Components
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';

import ProtectedRoute from './components/Auth/ProtectedRoute';

// Main Components
import Layout from './components/Layout/Layout';
import HomePage from './components/Home/HomePage';
import Dashboard from './components/Dashboard/Dashboard';
import WeatherPage from './components/Weather/WeatherPage';
import CropsPage from './components/Crops/CropsPage';
import SoilPage from './components/Soil/SoilPage';
import PestControlPage from './components/PestControl/PestControlPage';
import IrrigationPage from './components/Irrigation/IrrigationPage';
import AIAdvisoryPage from './components/AIAdvisory/AIAdvisoryPage';
import EducationPage from './components/Education/EducationPage';
import CommunityPage from './components/Community/CommunityPage';
import ProfilePage from './components/Profile/ProfilePage';
import SettingsPage from './components/Settings/SettingsPage';
import PaymentPage from './components/Payment/PaymentPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/weather" element={
              <ProtectedRoute>
                <Layout>
                  <WeatherPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/crops" element={
              <ProtectedRoute>
                <Layout>
                  <CropsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/soil" element={
              <ProtectedRoute>
                <Layout>
                  <SoilPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/pest-control" element={
              <ProtectedRoute>
                <Layout>
                  <PestControlPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/irrigation" element={
              <ProtectedRoute>
                <Layout>
                  <IrrigationPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/ai-advisory" element={
              <ProtectedRoute>
                <Layout>
                  <AIAdvisoryPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/education" element={
              <ProtectedRoute>
                <Layout>
                  <EducationPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community" element={
              <ProtectedRoute>
                <Layout>
                  <CommunityPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/payment" element={
              <ProtectedRoute>
                <Layout>
                  <PaymentPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;