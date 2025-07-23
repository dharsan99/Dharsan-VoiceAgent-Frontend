// Navigation utility for handling routing between dashboard versions

export const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
  // Dispatch a custom event to notify the app of route change
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const navigateToDashboard = (version: 'v1' | 'v2' | 'v3') => {
  navigateTo(`/${version}/dashboard`);
};

export const navigateToHome = () => {
  navigateTo('/');
};

// Get current route from pathname
export const getCurrentRoute = (): string => {
  return window.location.pathname;
};

// Check if current route is a dashboard
export const isDashboardRoute = (): boolean => {
  const route = getCurrentRoute();
  return route.includes('/dashboard');
};

// Get dashboard version from current route
export const getDashboardVersion = (): 'v1' | 'v2' | 'v3' | null => {
  const route = getCurrentRoute();
  if (route.includes('/v1/dashboard')) return 'v1';
  if (route.includes('/v2/dashboard')) return 'v2';
  if (route.includes('/v3/dashboard')) return 'v3';
  return null;
}; 