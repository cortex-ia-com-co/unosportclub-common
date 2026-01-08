export type RecurrenceFrequencyType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'NONE';

export interface RecurrenceConfigInterface {
  frequency: RecurrenceFrequencyType;
  interval: number;
  byDay?: string[];
  byMonthDay?: number[];
  byMonth?: number[];
  count?: number;
  until?: string;
}
