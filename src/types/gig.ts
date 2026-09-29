export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'unverified';
export type AvailabilityStatus = 'available' | 'busy' | 'offline';
export type JobStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type PaymentStatus = 'unpaid' | 'pending_confirmation' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'upi_qr' | 'bank_transfer' | 'card';

export interface ReviewItem {
  id: number;
  jobId: number;
  clientUserId: number;
  clientName: string;
  clientAvatarUrl?: string;
  providerId: number;
  rating: number; // 1-5
  comment: string;
  tags: string[];
  createdAt: string;
}

export interface ProviderItem {
  id: number;
  userId: number;
  name: string;
  username: string;
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  specialization: string; // Electrician, Plumber, Painter, AC Service, Carpenter, Mechanic, etc.
  avatarUrl?: string;
  avatarBgColor: string; // Pastel background hex/class
  avatarTextColor: string;
  bio?: string;
  city: string;
  area: string;
  latitude?: number;
  longitude?: number;
  workingRadius?: number; // km
  rating: number;
  reviewCount: number;
  status: ProviderStatus;
  registeredOn: string;
  
  // Instant Availability
  isAvailableNow: boolean;
  availabilityStatus: AvailabilityStatus;
  availabilityNote?: string;
  
  // Verification details
  idType?: string; // Aadhaar, Driving License, Passport, PAN
  idNumber?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl?: string;
  isIdentityVerified: boolean;
  isSelfieVerified: boolean;
  isLocationVerified: boolean;
}

export interface ProposalItem {
  id: number;
  jobId: number;
  jobTitle?: string;
  providerId: number;
  providerUserId: number;
  providerName: string;
  providerAvatarUrl?: string;
  providerSpecialization: string;
  providerRating: number;
  providerReviewCount: number;
  proposedPrice: number;
  estimatedDuration: string;
  message: string;
  status: ProposalStatus;
  createdAt: string;
}

export interface TimelineStep {
  step: 'POSTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED';
  title: string;
  timestamp: string;
  actor: string;
  details?: string;
}

export interface JobItem {
  id: number;
  clientId: number;
  clientName: string;
  clientPhone: string;
  clientAvatarUrl?: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  city: string;
  area: string;
  status: JobStatus;
  paymentStatus: PaymentStatus;
  assignedProviderId?: number;
  assignedProviderName?: string;
  assignedProviderAvatar?: string;
  assignedProposalId?: number;
  proposalsCount: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  proofImages: string[];
  timeline: TimelineStep[];
}

export interface PaymentItem {
  id: number;
  jobId: number;
  jobTitle: string;
  clientUserId: number;
  clientName: string;
  providerUserId: number;
  providerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface GigStats {
  totalProviders: number;
  pendingApprovals: number;
  approvedProviders: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  averageRating: number;
}
