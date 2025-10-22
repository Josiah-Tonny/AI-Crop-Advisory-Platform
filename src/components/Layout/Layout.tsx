import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import MobileDrawer from './MobileDrawer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      
      <div className="lg:pl-72">
        {/* Header */}
        <Header onMenuClick={toggleMobileMenu} />
        
        {/* Main content with smooth animations */}
        <main className="py-6 pb-20 lg:pb-6 animate-fade-in">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
};

export default Layout;