export interface SigninFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface AuthFormState {
  email: string;
  password: string;
  error?: string;
  isLoading: boolean;
}
