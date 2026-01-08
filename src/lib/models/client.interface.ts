export interface ClientInterface {
  id: number;
  user_id: number;
  email: string;
  display_name?: string | null;
  email_verified: boolean;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  document?: string | null;
  document_type_id?: number | null;
  document_type_name?: string | null;
  address?: string | null;
  is_available?: boolean | null;
  phone?: string | null;
}
