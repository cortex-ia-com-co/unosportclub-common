export interface TariffInterface {
  id?: number;
  court_id?: number | null;
  reservation_type_id?: number | null;
  rrule?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  adjustment: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
