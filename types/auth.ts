export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export type AuthView = "login" | "signup";

export interface UserProfile {
  id: string;
  email: string | undefined;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string | null;
  phoneNumber: string | null;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  address?: string;
  postalCode?: string;
  phoneNumber?: string;
}
