export function useAuth() {
  // No authentication needed - everyone can use the app freely
  const user = {
    uid: "shared-user",
    email: "user@memoryos.app",
    displayName: "MemoryOS User"
  };

  return {
    user,
    isLoading: false,
    isAuthenticated: true, // Always authenticated
    signIn: () => {}, // No sign in needed
    signOut: () => {}, // No sign out needed
  };
}