import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import MobileNav from './components/Layout/MobileNav';
import HomePage from './components/Home/HomePage';
import AIAdvisoryPage from './components/AIAdvisory/AIAdvisoryPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar for desktop */}
        <Sidebar />
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="lg:pl-72">
          {/* Header */}
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Page content */}
          <main className="py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/ai-advisory" element={<AIAdvisoryPage />} />
              <Route path="/weather" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Weather Page Coming Soon</h2></div>} />
              <Route path="/crops" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Crops Page Coming Soon</h2></div>} />
              <Route path="/soil" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Soil Analysis Coming Soon</h2></div>} />
              <Route path="/pest-control" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Pest Control Coming Soon</h2></div>} />
              <Route path="/irrigation" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Irrigation Advisory Coming Soon</h2></div>} />
              <Route path="/education" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Education Center Coming Soon</h2></div>} />
              <Route path="/community" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Community Coming Soon</h2></div>} />
              <Route path="/settings" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Settings Coming Soon</h2></div>} />
              <Route path="/help" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Help Center Coming Soon</h2></div>} />
              <Route path="/profile" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Profile Coming Soon</h2></div>} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <MobileNav />
        
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
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;