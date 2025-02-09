import { AuthResponse } from "../types";
import api from "./axios";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  firstName: string;
  lastName: string;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  validateToken: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>("/auth/validate");
    return response.data;
  },
};
