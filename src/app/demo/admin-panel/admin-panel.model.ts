export interface AccountUser {
  id: number;
  createdBy: number;
  createdAt: string;
  lastupdatedBy: number;
  lastUpdatedAt: string;
  username: string;
  password: string;
  realm: string;
  email: string;
  emailVerified: boolean;
  verificationToken: string;
  location: string;
}
