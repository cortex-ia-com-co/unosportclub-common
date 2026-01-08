import { BookingInterface } from './booking.interface';

export interface AccountBookingPaymentInterface {
  id: number;
  reservation_id: number;
  payment_type_id?: number | null;
  payment_type_name?: string | null;
  amount: number;
  transaction_id: string | null;
  gateway_response?: string | null;
  status: 'pending' | 'completed';
  statusBoolean: boolean;
  date: string | null;
  description?: string | null;
}

export interface AccountBookingInterface extends Omit<BookingInterface, 'payments'> {
  total_paid: number;
  total_amount: number;
  is_payment_complete: boolean;
  can_add_payment: boolean;
  payments?: AccountBookingPaymentInterface[];
}
