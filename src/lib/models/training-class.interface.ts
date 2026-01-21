export interface TrainingClassInterface {
  id?: number;
  user_id: number;
  reservation_id?: number | null;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  class_start_time: string;
  recurrence_days: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  trainer_name?: string | null;
  enrolled_count?: number;
  reservation_court_id?: number | null;
  reservation_checking?: string | null;
  reservation_checkout?: string | null;
  reservation_type_name?: string | null;
  max_capacity?: number | null;
  tariff_single_price?: number | null;
  tariff_total_price?: number | null;
}
