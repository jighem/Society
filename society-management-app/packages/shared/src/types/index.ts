import { z } from 'zod';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SOCIETY_ADMIN = 'SOCIETY_ADMIN',
  CHAIRMAN = 'CHAIRMAN',
  SECRETARY = 'SECRETARY',
  TREASURER = 'TREASURER',
  COMMITTEE_MEMBER = 'COMMITTEE_MEMBER',
  OWNER = 'OWNER',
  TENANT = 'TENANT',
  ACCOUNTANT = 'ACCOUNTANT',
  SECURITY_GUARD = 'SECURITY_GUARD',
  FACILITY_MANAGER = 'FACILITY_MANAGER',
  AUDITOR = 'AUDITOR'
}

export type Permission = 
  | 'society.view' | 'society.create' | 'society.update' | 'society.delete'
  | 'building.view' | 'building.create' | 'building.update' | 'building.delete'
  | 'wing.view' | 'wing.create' | 'flat.view' | 'flat.create'
  | 'owner.view' | 'owner.create' | 'tenant.view' | 'tenant.create'
  | 'maintenance.view' | 'maintenance.generate' | 'maintenance.approve'
  | 'payment.view' | 'payment.create' | 'expense.view' | 'expense.create' | 'expense.approve'
  | 'complaint.view' | 'complaint.create' | 'complaint.assign' | 'complaint.resolve'
  | 'notice.view' | 'notice.create' | 'document.upload' | 'report.view' | 'settings.manage';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | string | null;
}

// Zod schemas for first-phase form check validations
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type LoginDtoInput = z.infer<typeof LoginSchema>;

export const SocietySchema = z.object({
  name: z.string().min(3, 'Society name is too short'),
  registrationNumber: z.string().min(3, 'Registration number is required'),
  address: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
  contactNumber: z.string().min(10, 'Contact number should be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  gstNumber: z.string().optional(),
  bankName: z.string().min(2, 'Bank name is required'),
  bankAccountNumber: z.string().min(8, 'Bank account number is required'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format')
});

export type SocietyDtoInput = z.infer<typeof SocietySchema>;
