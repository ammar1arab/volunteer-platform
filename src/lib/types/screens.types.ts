// ==================== AUTH FORMS ====================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

// ==================== DASHBOARD CARDS ====================
export interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href?: string;
}