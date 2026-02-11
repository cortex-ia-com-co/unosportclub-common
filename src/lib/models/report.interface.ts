export type ReportFilterParams = Record<string, string | number | null | undefined>;

export interface ReportListMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface ReportListResponse<T> {
  data: T[];
  meta: ReportListMeta;
}
