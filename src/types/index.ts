export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum DoctorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum AppointmentPaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum AISender {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  doctorProfile?: DoctorProfile;
}

export interface DoctorDocument {
  id: string;
  doctorProfileId: string;
  documentType: string;
  fileUrl: string;
  originalName: string;
  uploadedAt: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  bio?: string;
  experienceYears: number;
  education?: string;
  licenseNumber: string;
  consultationFee: number | string;
  averageRating: number | string;
  totalReviews: number;
  verificationStatus: DoctorStatus;
  rejectionReason?: string;
  isOnline: boolean;
  user: User;
  specialties?: Specialty[];
  documents?: DoctorDocument[];
  availabilities?: Availability[];
  createdAt: string;
  updatedAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  createdAt?: string;
}

export interface Availability {
  id: string;
  doctorProfileId: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  slotDurationMinutes: number;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorProfileId: string;
  startTime: string;
  endTime: string;
  price: number | string;
  status: AppointmentStatus;
  paymentStatus: AppointmentPaymentStatus;
  createdAt: string;
  updatedAt: string;
  patient?: User;
  doctorProfile?: DoctorProfile;
  consultation?: Consultation;
  payment?: Payment;
  review?: Review;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  roomName: string;
  accessCode: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'ENDED';
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  providerPaymentId?: string;
  providerName: 'CLICK' | 'PAYME' | 'MOCK';
  grossAmount: number | string;
  platformFee: number | string;
  doctorAmount: number | string;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  appointment?: Appointment;
}

export interface DoctorLedger {
  id: string;
  doctorProfileId: string;
  totalEarnings: number | string;
  availableBalance: number | string;
  pendingBalance: number | string;
  totalWithdrawn: number | string;
  updatedAt: string;
  ledgerEntries?: LedgerEntry[];
}

export interface LedgerEntry {
  id: string;
  ledgerId: string;
  paymentId?: string;
  type: 'CREDIT_EARNING' | 'DEBIT_WITHDRAWAL' | 'HOLD_PENDING' | 'RELEASE_PENDING';
  amount: number | string;
  balanceAfter: number | string;
  description: string;
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorProfileId: string;
  rating: number;
  comment: string;
  createdAt: string;
  patient?: User;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  sender: AISender;
  content: string;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: AIMessage[];
}

export interface AuditLog {
  id: string;
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  actor?: User;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  pendingDoctorApplications: number;
  totalAppointments: number;
  completedAppointments: number;
  financials: {
    totalGrossVolume: string;
    totalPlatformRevenue: string; // 5%
    totalDoctorPayouts: string;   // 95%
  };
  totalAiConversations: number;
  totalAiMessages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}
