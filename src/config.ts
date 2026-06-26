export const getApiUrl = () => {
  const storedUrl = localStorage.getItem('API_URL');
  if (storedUrl) return storedUrl;
  return import.meta.env.VITE_API_URL || '';
};

// Install the global fetch interceptor
export const initApiConfig = () => {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    if (typeof url === 'string' && (url.startsWith('/api') || url.startsWith('/uploads'))) {
      const baseUrl = getApiUrl().replace(/\/+$/, ''); // remove trailing slashes
      url = `${baseUrl}${url}`;
      
      if (input instanceof Request) {
         return originalFetch(new Request(url, input), init);
      }
    }
    return originalFetch(url, init);
  };
};
