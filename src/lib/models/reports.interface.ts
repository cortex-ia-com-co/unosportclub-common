import type { ReportListMeta } from './report.interface';

export interface ReportClientsRow {
  id: number;
  firstName: string;
  lastName: string;
  documentTypeName: string;
  document: string;
  phone: string;
  registrationDate: string;
  address: string;
}

export interface ReportClientsListResponse {
  data: ReportClientsRow[];
  meta: ReportListMeta;
}

export interface ReportClientsSummaryResponse {
  total: number;
}

export interface ReportSalesRow {
  id: number;
  date: string;
  time: string;
  concept: string;
  firstName: string;
  lastName: string;
  documentTypeName: string;
  document: string;
  phone: string;
  totalAmount: number;
  paymentTypeName: string;
  transactionId: string;
  discount: number;
  observations: string;
  operatorName: string;
  reservationId: number;
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

export interface ReportBookingBreakdownRow {
  periodLabel: string;
  reservationTypeName: string;
  active: number;
  pending: number;
  cancelled: number;
}

export interface ReportBookingBreakdownResponse {
  data: ReportBookingBreakdownRow[];
  meta: ReportListMeta;
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
  id: number;
  firstName: string;
  lastName: string;
  documentTypeName: string;
  document: string;
  phone: string;
  court: string;
  date: string;
  time: string;
  total: number;
  paid: number;
  transactionId: string;
  balance: number;
  discount: number;
  observations: string;
}

export interface ReportPendingBalancesListResponse {
  data: ReportPendingBalanceRow[];
  meta: ReportListMeta;
}

export interface ReportPendingBalancesSummaryResponse {
  totalUnpaidToday: number;
}
