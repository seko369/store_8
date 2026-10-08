import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";import { authApi } from "../api/auth";

export function useAdminLogin() {
  return useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => authApi.login(email, password),
  });
}

export function useCurrentAdmin() {
  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => authApi.me(),
    retry: false,
  });
}
export function useAdminLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["admin"],
      });
    },
  });
}