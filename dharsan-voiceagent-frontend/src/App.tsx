import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import V1Dashboard from './pages/V1Dashboard';
import V2Dashboard from './pages/V2Dashboard';
import V3Dashboard from './pages/V3Dashboard';
import V2Phase5 from './pages/V2Phase5';
import UnifiedV2Dashboard from './pages/UnifiedV2Dashboard';
import NotFound from './pages/NotFound';

// Simple routing based on pathname
const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('');

  useEffect(() => {
    // Get the current pathname
    const pathname = window.location.pathname;
    setCurrentRoute(pathname);

    // Listen for popstate events (back/forward buttons)
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Simple routing logic
  const renderContent = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage />;
      case '/v1/dashboard':
        return <V1Dashboard />;
      case '/v2/dashboard':
        return <UnifiedV2Dashboard />; // Changed to UnifiedV2Dashboard
      case '/v2/phase5':
        return <V2Phase5 />;
      case '/v3/dashboard':
        return <V3Dashboard />;
      case '/unified-v2/dashboard':
        return <UnifiedV2Dashboard />;
      default:
        // Show 404 page for unknown routes
        return <NotFound />;
    }
  };

  return (
    <div className="App">
      {renderContent()}
      </div>
  );
};

export default App;
