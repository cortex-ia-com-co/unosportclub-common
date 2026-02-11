import type { ReportListMeta } from './report.interface';

export interface ReportClientsRow {
  period: string;
  periodLabel: string;
  count: number;
}

export interface ReportClientsListResponse {
  data: ReportClientsRow[];
  meta: ReportListMeta;
}

export interface ReportClientsSummaryResponse {
  total: number;
}

export interface ReportSalesRow {
  date: string;
  concept: string;
  amount: number;
}

export interface ReportSalesListResponse {
  data: ReportSalesRow[];
  meta: ReportListMeta;
}

export interface ReportSalesSummaryResponse {
  amountGenerated: number;
  paymentsDone: number;
  differential: number;
}

export interface ReportReservationsRow {
  id: number;
  status: string | null;
  statusKey: string;
}

export interface ReportReservationsListResponse {
  data: ReportReservationsRow[];
  meta: ReportListMeta;
}

export interface ReportReservationsSummaryResponse {
  active: number;
  pending: number;
  cancelled: number;
}

export interface ReportUtilisationRow {
  courtOrType: string;
  capacityHours: number;
  reservedHours: number;
  blockedHours: number;
  usagePercent: number;
}

export interface ReportUtilisationListResponse {
  data: ReportUtilisationRow[];
  meta: ReportListMeta;
}

export interface ReportUtilisationSummaryResponse {
  totalCapacityHours: number;
  totalReservedHours: number;
  totalBlockedHours: number;
  averageUsagePercent: number;
}

export interface ReportPendingBalanceRow {
  clientName: string;
  phone: string;
  court: string;
  dateTime: string;
  total: number;
  paid: number;
  balance: number;
}

export interface ReportPendingBalancesListResponse {
  data: ReportPendingBalanceRow[];
  meta: ReportListMeta;
}

export interface ReportPendingBalancesSummaryResponse {
  totalUnpaidToday: number;
}
