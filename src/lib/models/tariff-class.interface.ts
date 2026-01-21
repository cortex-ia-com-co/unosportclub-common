export interface TariffClassInterface {
  id: number;
  court_type_id: number;
  reservation_type_id: number;
  single_price: number;
  total_price: number;
  max_capacity: number;
  created_at: string;
  updated_at: string;
  court_type_name?: string | null;
  reservation_type_name?: string | null;
}
