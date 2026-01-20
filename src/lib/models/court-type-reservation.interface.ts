export interface CourtTypeReservation {
  id: number;
  court_id: number;
  court_name: string;
  checking: string;
  checkout: string;
  status?: {
    name?: string;
    color?: string;
  };
}

export interface CourtTypeReservationsResponse {
  court_type_id: number;
  reservations: CourtTypeReservation[];
}
