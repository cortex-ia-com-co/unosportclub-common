import { describe, expect, it } from 'vitest';
import type { ReportFilterParams, ReportListMeta, ReportListResponse } from './report.interface';
import type {
  ReportClientsListResponse,
  ReportClientsRow,
  ReportClientsSummaryResponse,
  ReportPendingBalanceRow,
  ReportPendingBalancesListResponse,
  ReportPendingBalancesSummaryResponse,
  ReportBookingBreakdownResponse,
  ReportReservationsListResponse,
  ReportReservationsSummaryResponse,
  ReportSalesListResponse,
  ReportSalesSummaryResponse,
  ReportUtilisationListResponse,
  ReportUtilisationSummaryResponse,
} from './reports.interface';

describe('reports.interface', () => {
  it('ReportFilterParams accepts record of string/number/null/undefined', () => {
    const params: ReportFilterParams = { from: '2025-01-01', limit: 10, offset: null };
    expect(params).toBeDefined();
    expect(params['from']).toBe('2025-01-01');
  });

  it('ReportListMeta has total, limit, offset', () => {
    const meta: ReportListMeta = { total: 100, limit: 20, offset: 0 };
    expect(meta.total).toBe(100);
    expect(meta.limit).toBe(20);
    expect(meta.offset).toBe(0);
  });

  it('ReportListResponse generic compiles with ReportClientsRow', () => {
    const response: ReportListResponse<ReportClientsRow> = {
      data: [
        {
          id: 1,
          firstName: 'Ana',
          lastName: 'López',
          documentTypeName: 'CC',
          document: '123',
          phone: '3001234567',
          registrationDate: '2025-01-15',
          address: 'Calle 1',
        },
      ],
      meta: { total: 1, limit: 20, offset: 0 },
    };
    expect(response.data).toHaveLength(1);
    expect(response.data[0].document).toBe('123');
  });

  it('ReportClientsListResponse and ReportClientsSummaryResponse', () => {
    const list: ReportClientsListResponse = {
      data: [
        {
          id: 2,
          firstName: 'Luis',
          lastName: 'Pérez',
          documentTypeName: 'CE',
          document: '456',
          phone: '3109876543',
          registrationDate: '2025-02-01',
          address: '',
        },
      ],
      meta: { total: 1, limit: 20, offset: 0 },
    };
    const summary: ReportClientsSummaryResponse = { total: 3 };
    expect(list.data[0].firstName).toBe('Luis');
    expect(summary.total).toBe(3);
  });

  it('ReportSalesListResponse and ReportSalesSummaryResponse', () => {
    const list: ReportSalesListResponse = {
      data: [
        {
          id: 1,
          date: '2025-01-01',
          time: '10:00:00',
          concept: 'Court A',
          firstName: 'Ana',
          lastName: 'Ruiz',
          documentTypeName: 'CC',
          document: '123',
          phone: '300',
          totalAmount: 50,
          paymentTypeName: 'Efectivo',
          transactionId: 'tx-1',
          discount: 0,
          observations: '',
          operatorName: 'Op',
          reservationId: 9,
        },
      ],
      meta: { total: 1, limit: 20, offset: 0 },
    };
    const summary: ReportSalesSummaryResponse = { amountGenerated: 100, paymentsDone: 80, differential: 20 };
    expect(list.data[0].totalAmount).toBe(50);
    expect(summary.differential).toBe(20);
  });

  it('ReportReservationsListResponse and ReportReservationsSummaryResponse', () => {
    const list: ReportReservationsListResponse = {
      data: [{ id: 1, status: 'active', statusKey: 'active' }],
      meta: { total: 1, limit: 20, offset: 0 },
    };
    const summary: ReportReservationsSummaryResponse = { active: 5, pending: 2, cancelled: 0 };
    expect(list.data[0].statusKey).toBe('active');
    expect(summary.pending).toBe(2);
  });

  it('ReportBookingBreakdownResponse', () => {
    const breakdown: ReportBookingBreakdownResponse = {
      data: [
        {
          periodLabel: '2025-03-01',
          reservationTypeName: 'Por hora',
          active: 2,
          pending: 1,
          cancelled: 0,
        },
      ],
      meta: { total: 1, limit: 500, offset: 0 },
    };
    expect(breakdown.data[0].reservationTypeName).toBe('Por hora');
    expect(breakdown.data[0].active).toBe(2);
  });

  it('ReportUtilisationListResponse and ReportUtilisationSummaryResponse', () => {
    const list: ReportUtilisationListResponse = {
      data: [
        {
          courtOrType: 'Padel',
          capacityHours: 24,
          reservedHours: 12,
          blockedHours: 2,
          usagePercent: 50,
        },
      ],
      meta: { total: 1, limit: 20, offset: 0 },
    };
    const summary: ReportUtilisationSummaryResponse = {
      totalCapacityHours: 24,
      totalReservedHours: 12,
      totalBlockedHours: 2,
      averageUsagePercent: 50,
    };
    expect(list.data[0].usagePercent).toBe(50);
    expect(summary.averageUsagePercent).toBe(50);
  });

  it('ReportPendingBalancesListResponse and ReportPendingBalancesSummaryResponse', () => {
    const list: ReportPendingBalancesListResponse = {
      data: [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          documentTypeName: 'CC',
          document: '1',
          phone: '+1',
          court: 'Court 1',
          date: '2025-01-01',
          time: '10:00:00',
          total: 100,
          paid: 50,
          transactionId: 'tx-1',
          balance: 50,
          discount: 0,
          observations: '',
        },
      ],
      meta: { total: 1, limit: 20, offset: 0 },
    };
    const summary: ReportPendingBalancesSummaryResponse = { totalUnpaidToday: 1 };
    const row: ReportPendingBalanceRow = list.data[0];
    expect(row.balance).toBe(50);
    expect(summary.totalUnpaidToday).toBe(1);
  });
});
