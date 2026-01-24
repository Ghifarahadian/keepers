export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export type AuthView = "login" | "signup";
