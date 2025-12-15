export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthFormState extends LoginCredentials {
  error?: string;
  isLoading: boolean;
}