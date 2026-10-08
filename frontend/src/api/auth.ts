import { apiClient } from "./client";

export interface AdminLoginResponse {
  message: string;
}
export interface AdminMeResponse {
  email: string;
}
export const authApi = {
    logout(): Promise<AdminLoginResponse> {
  return apiClient<AdminLoginResponse>(
    "/admin/logout",
    {
      method: "POST",
    },
  );
},
    me(): Promise<AdminMeResponse> {
  return apiClient<AdminMeResponse>(
    "/admin/me",
  );
},
  login(
    email: string,
    password: string,
  ): Promise<AdminLoginResponse> {
    return apiClient<AdminLoginResponse>(
      "/admin/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );
  },
};


export interface AdminMeResponse {
  email: string;
}