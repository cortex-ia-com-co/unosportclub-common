import type { StudentInterface } from './student.interface';
import type { TrainingClassInterface } from './training-class.interface';

export interface EnrollmentInterface {
  id?: number;
  class_id: number;
  client_id: number;
  user_id?: number;
  status: boolean;
  enrolled_at?: string;
  accepted_at?: string | null;
  rejected_at?: string | null;
  attendance_status?: 'present' | 'absent' | null;
  attendance_marked_at?: string | null;
  payment_type_id?: number | null;
  payment_amount?: number | null;
  payment_reference?: string | null;
  student?: StudentInterface;
  training_class?: TrainingClassInterface;
}
