export interface CourtTypeAvailabilityResponse {
  court_type_id: number;
  total_courts: number;
  busy_segments: Array<{ start: string; end: string }>;
}
