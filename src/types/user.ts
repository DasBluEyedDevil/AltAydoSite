export interface User {
  id: string;
  aydoHandle: string;
  email: string;
  passwordHash: string;
  clearanceLevel: number;
  role: string;
  discordName: string | null;
  rsiAccountName: string | null;
  bio?: string | null;
  photo?: string | null;
  payGrade?: string | null;
  position?: string | null;
  division?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  id: string;
  aydoHandle: string;
  email: string;
  clearanceLevel: number;
  role: string;
  discordName?: string | null;
  rsiAccountName?: string | null;
  bio?: string | null;
  photo?: string | null;
  payGrade?: string | null;
  position?: string | null;
  division?: string | null;
} 