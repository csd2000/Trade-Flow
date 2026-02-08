import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiJson, getQueryFn } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    error
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await apiJson<{ user: User; message: string }>('/api/auth/login', 'POST', credentials);
    },
    onSuccess: (data) => {
      // Update the auth cache with the user object
      queryClient.setQueryData(['/api/auth/user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await apiJson('/api/auth/logout', 'POST');
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Redirect to home
      window.location.href = '/';
    },
  });
}