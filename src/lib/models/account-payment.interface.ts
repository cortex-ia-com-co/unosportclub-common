import { PaymentInterface } from './payment.interface';

export interface AccountPaymentInterface extends PaymentInterface {
  court_name?: string | null;
  checking?: string | null;
  checkout?: string | null;
}
