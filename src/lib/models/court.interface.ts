export interface CourtInterface {
  id: number;
  court_type_id: number;
  name: string;
  cost: number;
  price: number;
  court_type_name?: string | null;
}
