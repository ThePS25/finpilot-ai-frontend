const ACCESS_KEY = 'finpilot_access_token';
const REFRESH_KEY = 'finpilot_refresh_token';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),

  setTokens: (accessToken?: string | null, refreshToken?: string | null) => {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    else localStorage.removeItem(ACCESS_KEY);

    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_KEY);
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
