// Utility functions for API interactions, e.g., token management, error handling

const TOKEN_KEY = "token";

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// You might also add functions for:
// - Handling API errors
// - Attaching tokens to headers for requests
// - Refreshing tokens
