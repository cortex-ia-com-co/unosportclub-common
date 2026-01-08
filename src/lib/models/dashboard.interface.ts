export interface DashboardStatsInterface {
  clients: {
    total: number;
    verified: number;
    unverified: number;
  };
  courts: {
    total: number;
  };
  reservations: {
    total: number;
    today: number;
    this_week: number;
    this_month: number;
  };
  payments: {
    total: number;
    total_amount: number;
    completed_amount: number;
    pending: number;
  };
}

export interface DashboardStatsWithRecentInterface extends DashboardStatsInterface {
  recent_reservations?: Array<{
    id: number;
    checking: string | null;
    checkout: string | null;
    created_at: string | null;
    court_name: string | null;
    client_email: string | null;
    client_name: string | null;
  }>;
  recent_payments?: Array<{
    id: number;
    amount: number;
    transaction_id: string;
    status: string;
    date: string;
    description: string | null;
    reservation_id: number | null;
  }>;
}

export interface PaymentStatsInterface {
  total: number;
  by_status: {
    pending?: number;
    completed?: number;
    failed?: number;
    refunded?: number;
  };
  total_amount: number;
  completed_amount: number;
  orphan_payments: number;
}
