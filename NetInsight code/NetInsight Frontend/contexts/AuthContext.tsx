// Auth has been removed. Users are anonymous.
// This file is kept as a stub so any remaining imports don't break.

export const useAuth = () => ({
  user: null,
  isAuthenticated: true,
  isLoading: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => children;
