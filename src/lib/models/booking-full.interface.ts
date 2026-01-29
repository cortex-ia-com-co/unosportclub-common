import { BookingInterface } from './booking.interface';

export interface BookingFullInterface extends BookingInterface {
  total_amount?: number | null;
  total_paid?: number | null;
  total_debt?: number | null;
}
