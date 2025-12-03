import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

// Enhanced auth hook with auto-login capability 
export function useFastAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const autoLogin = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/auto-demo-login", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Auto-login failed");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate auth query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  // Auto-login if not authenticated and not already trying
  if (error && !autoLogin.isPending && !autoLogin.isSuccess) {
    autoLogin.mutate();
  }

  return {
    user,
    isLoading: isLoading || autoLogin.isPending,
    isAuthenticated: !!user,
    autoLogin: autoLogin.mutate,
  };
}
