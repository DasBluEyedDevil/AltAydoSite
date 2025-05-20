export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
} 