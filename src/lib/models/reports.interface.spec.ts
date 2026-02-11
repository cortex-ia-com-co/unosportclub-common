import { describe, it, expect } from 'vitest';
import type { ReportFilterParams, ReportListMeta, ReportListResponse } from './report.interface';
import type {
  ReportClientsRow,
  ReportClientsListResponse,
  ReportClientsSummaryResponse,
  ReportSalesListResponse,
  ReportSalesSummaryResponse,
  ReportReservationsListResponse,
  ReportReservationsSummaryResponse,
  ReportUtilisationListResponse,
  ReportUtilisationSummaryResponse,
  ReportPendingBalanceRow,
  ReportPendingBalancesListResponse,
  ReportPendingBalancesSummaryResponse,
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
      data: [{ period: '2025-01', periodLabel: 'Ene 2025', count: 5 }],
      meta: { total: 1, limit: 20, offset: 0 },
    };
    expect(response.data).toHaveLength(1);
    expect(response.data[0].count).toBe(5);
  });

  it('ReportClientsListResponse and ReportClientsSummaryResponse', () => {
    const list: ReportClientsListResponse = {
      data: [{ period: '2025-01', periodLabel: 'Ene', count: 3 }],
      meta: { total: 1, limit: 20, offset: 0 },
    };
    const summary: ReportClientsSummaryResponse = { total: 3 };
    expect(list.data[0].periodLabel).toBe('Ene');
    expect(summary.total).toBe(3);
  });

  it('ReportSalesListResponse and ReportSalesSummaryResponse', () => {
    const list: ReportSalesListResponse = {
      data: [{ date: '2025-01-01', concept: 'Court', amount: 50 }],
      meta: { total: 1, limit: 20, offset: 0 },
    };
    const summary: ReportSalesSummaryResponse = { amountGenerated: 100, paymentsDone: 80, differential: 20 };
    expect(list.data[0].amount).toBe(50);
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
          clientName: 'John',
          phone: '+1',
          court: 'Court 1',
          dateTime: '2025-01-01T10:00:00',
          total: 100,
          paid: 50,
          balance: 50,
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
