export interface StudentInterface {
  id: number;
  user_id: string;
  email: string;
  display_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email_verified: boolean;
  created_at?: string;
}
