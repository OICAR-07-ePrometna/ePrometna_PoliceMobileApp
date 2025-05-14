import type { UserRole } from '@/enums/userRole';
import type { Mobile } from '@/models/mobile';

export interface User {
  uuid: string;
  firstName: string;
  lastName: string;
  oib: string;
  residence: string;
  birthDate: string;
  email: string;
  role: UserRole;
  registeredDevice?: Mobile;
}