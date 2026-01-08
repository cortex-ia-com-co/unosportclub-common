export interface ClientListFiltersInterface {
  search?: string;
  limit: number;
  offset: number;
}

export interface ClientCreateDataInterface {
  id?: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  document: string;
  document_type_id: number;
  address?: string;
  email?: string;
  display_name?: string;
  email_verified?: boolean;
  phone_number?: string;
  document_type_name?: string;
}

export interface PaymentListFiltersInterface {
  search?: string;
  status?: string;
  reservation_id?: number;
  limit: number;
  offset: number;
}
