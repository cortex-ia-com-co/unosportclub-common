import { BookingInterface } from './booking.interface';

export interface BookingDetailInterface extends BookingInterface {
  client_first_name?: string | null;
  client_last_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  client_document?: string | null;
  client_address?: string | null;
  court_base_price?: number | null;
  court_type_name?: string | null;
}
