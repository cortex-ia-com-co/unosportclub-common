export interface PaymentInterface {
  id: number;
  reservation_id: number | null;
  payment_type_id?: number | null;
  amount: number;
  transaction_id: string | null;
  gateway_response?: string | null;
  status: boolean;
  date: string;
  description?: string | null;
}
