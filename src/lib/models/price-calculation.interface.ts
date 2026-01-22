export interface CalculatePriceResponseInterface {
  court: {
    id: number;
    name: string;
    base_price: number;
  };
  date?: string;
  checking?: string;
  checkout?: string;
  checking_date?: string;
  checking_time?: string;
  checkout_date?: string;
  checkout_time?: string;
  available?: boolean;
  hours?: number;
  price_per_hour?: number;
  final_price: number;
  applied_adjustments: Array<{
    tariff_id: number;
    description: string;
    adjustment: string;
    adjusted_price: number;
  }>;
}
