import { ReservationStatusInterface } from './reservation-status.interface';
import { PaymentInterface } from './payment.interface';

export interface BookingInterface {
  id?: number;
  client_id: number | null;
  court_id: number;
  reservation_type_id: number;
  reservation_status_id?: number | null;
  checking: string | null;
  checkout: string | null;
  checking_date?: string | null;
  checking_time?: string | null;
  checkout_date?: string | null;
  checkout_time?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_date?: string | null;
  created_time?: string | null;
  updated_date?: string | null;
  updated_time?: string | null;
  client_name?: string | null;
  client_first_name?: string | null;
  client_last_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  client_document?: string | null;
  client_address?: string | null;
  court_name?: string | null;
  court_base_price?: number | null;
  court_type_name?: string | null;
  reservation_type_name?: string | null;
  reservation_status?: ReservationStatusInterface | null;
  payments?: PaymentInterface[];
}
