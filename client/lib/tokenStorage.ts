const ACCESS_KEY = "artclash_access_token";
const REFRESH_KEY = "artclash_refresh_token";

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const tokenStorage = {
  getAccessToken: () => read(ACCESS_KEY),
  getRefreshToken: () => read(REFRESH_KEY),

  setTokens: (accessToken: string, refreshToken: string) => {
    try {
      localStorage.setItem(ACCESS_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
    } catch {
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch {
    }
  },
};
