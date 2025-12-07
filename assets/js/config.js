// Configuration for API endpoints
const CONFIG = {
  // Automatically switch between local and production
  API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://amber-atelier-api.onrender.com',
  
  ENVIRONMENT: window.location.hostname === 'localhost' ? 'development' : 'production',
  
  // API timeout
  TIMEOUT: 30000, // 30 seconds (for Render cold starts)
  
  // Feature flags
  FEATURES: {
    imageUpload: true,
    analytics: false,
    payments: false
  }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.APP_CONFIG = CONFIG;
}
