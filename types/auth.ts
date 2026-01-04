export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type AuthView = "login" | "signup";
