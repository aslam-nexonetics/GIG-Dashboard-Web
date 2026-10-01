import {
  ProviderItem,
  JobItem,
  ProposalItem,
  ReviewItem,
  PaymentItem,
  GigStats,
  TimelineStep,
  ProviderStatus,
  AvailabilityStatus,
  JobStatus,
  ProposalStatus,
  PaymentStatus,
  PaymentMethod,
  AuthUser,
  AuthTokenResponse,
} from '@/types/gig';
import { logger } from '@/services/logger';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || 'https://api3.made2tech.com/api/v1';
const COLLECTION_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'GIG';

const TOKEN_STORAGE_KEY = 'gig_admin_token';
const REFRESH_TOKEN_STORAGE_KEY = 'gig_admin_refresh_token';
const ADMIN_USER_STORAGE_KEY = 'gig_admin_user';

export type RawRecord = Record<string, unknown>;

export type StoredAdminUser = AuthUser;

// Pastel avatar colors palette
const AVATAR_PALETTES = [
  { bg: 'bg-blue-100 text-blue-700', text: '#1d4ed8' },
  { bg: 'bg-emerald-100 text-emerald-700', text: '#047857' },
  { bg: 'bg-purple-100 text-purple-700', text: '#6d28d9' },
  { bg: 'bg-amber-100 text-amber-700', text: '#b45309' },
  { bg: 'bg-pink-100 text-pink-700', text: '#be185d' },
  { bg: 'bg-indigo-100 text-indigo-700', text: '#4338ca' },
  { bg: 'bg-rose-100 text-rose-700', text: '#be123c' },
  { bg: 'bg-cyan-100 text-cyan-700', text: '#0e7490' },
];

function getAvatarColors(id: number | string) {
  const num = typeof id === 'number' ? id : id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTES[Math.abs(num) % AVATAR_PALETTES.length];
}

// Token and session management
export const tokenManager = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  },
  setRefreshToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
  },
  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const str = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  },
  setStoredUser(user: AuthUser) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
  },
  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  },
  decodeToken(token?: string | null): { sub?: string; username?: string; role?: string; exp?: number } | null {
    const jwt = token ?? this.getToken();
    if (!jwt) return null;
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },
  isTokenExpired(token?: string | null): boolean {
    const claims = this.decodeToken(token);
    if (!claims || !claims.exp) return false;
    const nowSec = Math.floor(Date.now() / 1000);
    // Buffer by 30 seconds
    return claims.exp < nowSec + 30;
  },
};

let isRefreshingToken = false;
let refreshSubscribers: Array<(newToken: string | null) => void> = [];

function onTokenRefreshed(newToken: string | null) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

// Generic fetch wrapper with auto-retry on 401 using refresh token
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<{ success: boolean; data?: T; message?: string; detail?: string }> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenManager.getToken();
  const startTime = performance.now();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const duration = Math.round(performance.now() - startTime);
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    // Handle token expiration & automatic refresh
    if (res.status === 401 && !isRetry && !endpoint.includes('/auth/')) {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        if (!isRefreshingToken) {
          isRefreshingToken = true;
          try {
            logger.info('AUTH', 'Attempting automatic access token refresh...');
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshJson = (await refreshRes.json()) as { access_token?: string; refresh_token?: string };
              if (refreshJson.access_token) {
                tokenManager.setToken(refreshJson.access_token);
                if (refreshJson.refresh_token) {
                  tokenManager.setRefreshToken(refreshJson.refresh_token);
                }
                logger.info('AUTH', 'Access token successfully refreshed.');
                isRefreshingToken = false;
                onTokenRefreshed(refreshJson.access_token);
                // Retry original request
                return apiRequest<T>(endpoint, options, true);
              }
            }
          } catch (refreshErr) {
            logger.error('AUTH', 'Token refresh failed:', refreshErr);
          }
          isRefreshingToken = false;
          onTokenRefreshed(null);
        } else {
          // Wait for pending refresh to finish
          return new Promise((resolve, reject) => {
            refreshSubscribers.push((newToken) => {
              if (newToken) {
                resolve(apiRequest<T>(endpoint, options, true));
              } else {
                reject(new Error('Session expired. Please log in again.'));
              }
            });
          });
        }
      }

      // If cannot refresh, notify application of session expiry
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gig:auth-expired'));
      }
    }

    if (!res.ok) {
      const errorMsg =
        (typeof json.detail === 'string' && json.detail) ||
        (typeof json.message === 'string' && json.message) ||
        `Request failed with status ${res.status}: ${res.statusText}`;

      logger.api(options.method || 'GET', endpoint, res.status, duration, errorMsg);
      const err = new Error(errorMsg) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }

    logger.api(options.method || 'GET', endpoint, res.status, duration);
    return json as { success: boolean; data?: T; message?: string; detail?: string };
  } catch (error: unknown) {
    const duration = Math.round(performance.now() - startTime);
    const msg = error instanceof Error ? error.message : String(error);
    if (!isRetry) {
      logger.api(options.method || 'GET', endpoint, 0, duration, msg);
    }
    throw error;
  }
}

// ─── Data Mappers ─────────────────────────────────────────────────────────────

export function mapRawProvider(p: RawRecord): ProviderItem {
  const idVal = Number(p.id ?? p.user_id ?? 1);
  const colors = getAvatarColors(idVal);
  const firstName = String(p.first_name || p.firstName || '').trim();
  const lastName = String(p.last_name || p.lastName || '').trim();
  const rawName = String(p.name || '').trim();
  const fullName = rawName || `${firstName} ${lastName}`.trim() || 'Provider';
  const username = String(p.username || `user_${p.user_id || p.id || 0}`);

  return {
    id: Number(p.id || 0),
    userId: Number(p.user_id || p.userId || p.id || 0),
    name: fullName,
    username: username.startsWith('@') ? username : `@${username}`,
    email: String(p.email || `${username.replace('@', '')}@example.com`),
    mobile: String(p.mobile || p.phone || 'N/A'),
    firstName: firstName || fullName.split(' ')[0] || '',
    lastName: lastName || fullName.split(' ').slice(1).join(' ') || '',
    specialization: String(p.specialization || 'Technician'),
    avatarUrl: p.avatar_url ? String(p.avatar_url) : p.avatarUrl ? String(p.avatarUrl) : undefined,
    avatarBgColor: colors.bg,
    avatarTextColor: colors.text,
    bio: p.bio ? String(p.bio) : '',
    city: String(p.city || 'Kochi'),
    area: String(p.area || ''),
    latitude: typeof p.latitude === 'number' ? p.latitude : undefined,
    longitude: typeof p.longitude === 'number' ? p.longitude : undefined,
    workingRadius: Number(p.working_radius || p.workingRadius || 50),
    rating: Number(p.rating || 0) || 0,
    reviewCount: Number(p.review_count || p.reviewCount || 0) || 0,
    status: (String(p.status || 'pending').toLowerCase()) as ProviderStatus,
    registeredOn: p.registered_on || p.created_at
      ? new Date(String(p.registered_on || p.created_at)).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recent',
    isAvailableNow: Boolean(p.is_available_now ?? p.isAvailableNow ?? true),
    availabilityStatus: (String(p.availability_status || p.availabilityStatus || 'available')) as AvailabilityStatus,
    availabilityNote: p.availability_note ? String(p.availability_note) : undefined,
    idType: String(p.id_type || p.idType || 'Govt ID'),
    idNumber: p.id_number ? String(p.id_number) : undefined,
    idFrontUrl: p.id_front_url ? String(p.id_front_url) : p.idFrontUrl ? String(p.idFrontUrl) : undefined,
    idBackUrl: p.id_back_url ? String(p.id_back_url) : p.idBackUrl ? String(p.idBackUrl) : undefined,
    selfieUrl: p.selfie_url ? String(p.selfie_url) : p.selfieUrl ? String(p.selfieUrl) : undefined,
    isIdentityVerified: Boolean(p.is_identity_verified ?? p.isIdentityVerified),
    isSelfieVerified: Boolean(p.is_selfie_verified ?? p.isSelfieVerified),
    isLocationVerified: Boolean(p.is_location_verified ?? p.isLocationVerified),
  };
}

export function mapRawJob(j: RawRecord): JobItem {
  let proofImgs: string[] = [];
  if (Array.isArray(j.proof_images)) {
    proofImgs = j.proof_images.map(String);
  } else if (typeof j.proof_images === 'string') {
    try {
      const parsed = JSON.parse(j.proof_images);
      if (Array.isArray(parsed)) proofImgs = parsed.map(String);
    } catch {
      proofImgs = [];
    }
  }

  const assignedProviderObj = j.assigned_provider as RawRecord | undefined;

  return {
    id: Number(j.id || 0),
    clientId: Number(j.client_id || j.clientId || 0),
    clientName: String(j.client_name || j.clientName || 'Client'),
    clientPhone: String(j.client_phone || j.clientPhone || 'N/A'),
    clientAvatarUrl: j.client_avatar_url ? String(j.client_avatar_url) : undefined,
    title: String(j.title || 'Service Request'),
    description: String(j.description || ''),
    category: String(j.category || 'General'),
    budget: Number(j.budget || 0) || 0,
    city: String(j.city || ''),
    area: String(j.area || ''),
    status: (String(j.status || 'open').toLowerCase()) as JobStatus,
    paymentStatus: (String(j.payment_status || j.paymentStatus || 'unpaid').toLowerCase()) as PaymentStatus,
    assignedProviderId: j.assigned_provider_id ? Number(j.assigned_provider_id) : undefined,
    assignedProviderName: j.assigned_provider_name
      ? String(j.assigned_provider_name)
      : assignedProviderObj?.name
      ? String(assignedProviderObj.name)
      : undefined,
    assignedProviderAvatar: j.assigned_provider_avatar
      ? String(j.assigned_provider_avatar)
      : assignedProviderObj?.avatar_url
      ? String(assignedProviderObj.avatar_url)
      : undefined,
    assignedProposalId: j.assigned_proposal_id ? Number(j.assigned_proposal_id) : undefined,
    proposalsCount: Number(j.proposals_count || j.proposalsCount || 0) || 0,
    startedAt: j.started_at
      ? new Date(String(j.started_at)).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
      : undefined,
    completedAt: j.completed_at
      ? new Date(String(j.completed_at)).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
      : undefined,
    createdAt: j.created_at
      ? new Date(String(j.created_at)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recent',
    proofImages: proofImgs,
    timeline: Array.isArray(j.timeline) ? (j.timeline as TimelineStep[]) : [],
  };
}

export function mapRawProposal(prop: RawRecord): ProposalItem {
  return {
    id: Number(prop.id || 0),
    jobId: Number(prop.job_id || prop.jobId || 0),
    jobTitle: String(prop.job_title || prop.jobTitle || 'GIG Job Posting'),
    providerId: Number(prop.provider_id || prop.providerId || 0),
    providerUserId: Number(prop.provider_user_id || prop.providerUserId || 0),
    providerName: String(prop.provider_name || prop.providerName || 'Technician'),
    providerAvatarUrl: prop.provider_avatar_url ? String(prop.provider_avatar_url) : undefined,
    providerSpecialization: String(prop.provider_specialization || prop.providerSpecialization || 'Technician'),
    providerRating: Number(prop.provider_rating || prop.providerRating || 0) || 0,
    providerReviewCount: Number(prop.provider_review_count || prop.providerReviewCount || 0) || 0,
    proposedPrice: Number(prop.proposed_price || prop.proposedPrice || 0) || 0,
    estimatedDuration: String(prop.estimated_duration || prop.estimatedDuration || '1 Day'),
    message: String(prop.message || ''),
    status: (String(prop.status || 'pending').toLowerCase()) as ProposalStatus,
    createdAt: prop.created_at
      ? new Date(String(prop.created_at)).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
      : 'Recent',
  };
}

export function mapRawReview(r: RawRecord): ReviewItem {
  let tagsList: string[] = [];
  if (Array.isArray(r.tags)) {
    tagsList = r.tags.map(String);
  } else if (typeof r.tags === 'string') {
    try {
      const parsed = JSON.parse(r.tags);
      if (Array.isArray(parsed)) tagsList = parsed.map(String);
    } catch {
      tagsList = [];
    }
  }

  return {
    id: Number(r.id || 0),
    jobId: Number(r.job_id || r.jobId || 0),
    clientUserId: Number(r.client_user_id || r.clientUserId || 0),
    clientName: String(r.client_name || r.clientName || 'Homeowner'),
    clientAvatarUrl: r.client_avatar_url ? String(r.client_avatar_url) : undefined,
    providerId: Number(r.provider_id || r.providerId || 0),
    rating: Number(r.rating || 5) || 5,
    comment: String(r.comment || ''),
    tags: tagsList,
    createdAt: r.created_at
      ? new Date(String(r.created_at)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recent',
  };
}

export function mapRawPayment(p: RawRecord): PaymentItem {
  return {
    id: Number(p.id || 0),
    jobId: Number(p.job_id || p.jobId || 0),
    jobTitle: String(p.job_title || p.jobTitle || 'GIG Job Payment'),
    clientUserId: Number(p.client_user_id || p.clientUserId || 0),
    clientName: String(p.client_name || p.clientName || 'Client'),
    providerUserId: Number(p.provider_user_id || p.providerUserId || 0),
    providerName: String(p.provider_name || p.providerName || 'Technician'),
    amount: Number(p.amount || 0) || 0,
    paymentMethod: (String(p.payment_method || p.paymentMethod || 'upi_qr').toLowerCase()) as PaymentMethod,
    paymentStatus: (String(p.payment_status || p.paymentStatus || 'paid').toLowerCase()) as PaymentStatus,
    receiptUrl: p.receipt_url ? String(p.receipt_url) : undefined,
    notes: p.notes ? String(p.notes) : undefined,
    createdAt: p.created_at
      ? new Date(String(p.created_at)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recent',
    confirmedAt: p.confirmed_at
      ? new Date(String(p.confirmed_at)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : undefined,
  };
}

export function mapRawStats(s: RawRecord): GigStats {
  return {
    totalProviders: Number(s.total_providers ?? s.totalProviders ?? 0),
    pendingApprovals: Number(s.pending_approvals ?? s.pendingApprovals ?? 0),
    approvedProviders: Number(s.approved_providers ?? s.approvedProviders ?? 0),
    activeJobs: Number(s.active_jobs ?? s.activeJobs ?? 0),
    completedJobs: Number(s.completed_jobs ?? s.completedJobs ?? 0),
    totalRevenue: Number(s.total_revenue ?? s.totalRevenue ?? 0) || 0,
    averageRating: Number(s.average_rating ?? s.averageRating ?? 4.8) || 4.8,
  };
}

export function mapRawUser(u: RawRecord): AuthUser {
  return {
    id: Number(u.id || 0),
    username: String(u.username || 'admin'),
    email: String(u.email || ''),
    fullName: u.full_name ? String(u.full_name) : undefined,
    firstName: u.first_name ? String(u.first_name) : undefined,
    lastName: u.last_name ? String(u.last_name) : undefined,
    role: String(u.role || 'admin'),
    avatarUrl: u.avatar_url ? String(u.avatar_url) : undefined,
    isEmailVerified: Boolean(u.is_email_verified),
    status: u.status ? String(u.status) : 'active',
    lastLoginAt: u.last_login_at ? String(u.last_login_at) : undefined,
  };
}

// ─── Live API Service Methods ──────────────────────────────────────────────────

export const gigApi = {
  // ─── Authentication & User Profile ──────────────────────────────────────────

  async login(emailOrUsername: string, password: string): Promise<AuthTokenResponse> {
    logger.info('AUTH', `Initiating sign-in for: ${emailOrUsername}`);
    const res = await apiRequest<{
      access_token: string;
      refresh_token?: string;
      token_type?: string;
      expires_in?: number;
    }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email_or_username: emailOrUsername, password }),
    });

    const tokenObj = res as unknown as Record<string, unknown>;
    const accessToken = typeof tokenObj.access_token === 'string' ? tokenObj.access_token : res.data?.access_token;
    const refreshToken = typeof tokenObj.refresh_token === 'string' ? tokenObj.refresh_token : res.data?.refresh_token;

    if (!accessToken) {
      throw new Error(res.message || 'Login failed: server did not return access token.');
    }

    tokenManager.setToken(accessToken);
    if (refreshToken) {
      tokenManager.setRefreshToken(refreshToken);
    }

    // Fetch user profile from /auth/me/
    let user: AuthUser;
    try {
      user = await this.getMe();
    } catch {
      // Decode JWT payload as fallback profile
      const claims = tokenManager.decodeToken(accessToken);
      user = {
        id: Number(claims?.sub || 1),
        username: claims?.username || emailOrUsername,
        email: emailOrUsername.includes('@') ? emailOrUsername : '',
        role: claims?.role || 'admin',
        fullName: claims?.username || emailOrUsername,
      };
      tokenManager.setStoredUser(user);
    }

    logger.info('AUTH', `Signed in successfully as ${user.username} (${user.role})`);
    return {
      accessToken,
      refreshToken,
      tokenType: 'bearer',
      user,
    };
  },

  async loginWithRawToken(token: string): Promise<AuthUser> {
    const trimmed = token.trim();
    if (!trimmed) throw new Error('Token string cannot be empty.');
    tokenManager.setToken(trimmed);

    let user: AuthUser;
    try {
      user = await this.getMe();
    } catch {
      const claims = tokenManager.decodeToken(trimmed);
      user = {
        id: Number(claims?.sub || 1),
        username: claims?.username || 'Admin User',
        email: '',
        role: claims?.role || 'admin',
        fullName: claims?.username || 'Admin User',
      };
      tokenManager.setStoredUser(user);
    }
    logger.info('AUTH', `Token connected successfully for ${user.username}`);
    return user;
  },

  async getMe(): Promise<AuthUser> {
    const res = await apiRequest<RawRecord>('/auth/me/');
    const raw = (res.data || res) as RawRecord;
    const user = mapRawUser(raw);
    tokenManager.setStoredUser(user);
    return user;
  },

  async refreshToken(): Promise<string> {
    const refresh = tokenManager.getRefreshToken();
    if (!refresh) throw new Error('No refresh token available.');

    const res = await apiRequest<{ access_token: string; refresh_token?: string }>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refresh }),
    });

    const tokenObj = res as unknown as Record<string, unknown>;
    const newAccess = typeof tokenObj.access_token === 'string' ? tokenObj.access_token : res.data?.access_token;
    if (!newAccess) throw new Error('Could not refresh token.');

    tokenManager.setToken(newAccess);
    if (typeof tokenObj.refresh_token === 'string') {
      tokenManager.setRefreshToken(tokenObj.refresh_token);
    }
    return newAccess;
  },

  async logout(): Promise<void> {
    logger.info('AUTH', 'Signing out current administrator session');
    try {
      await apiRequest('/auth/logout/', { method: 'POST' }).catch(() => {});
    } finally {
      tokenManager.clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gig:auth-logout'));
      }
    }
  },

  // 1. Overview & Master Stats
  async getAdminStats(): Promise<GigStats> {
    const res = await apiRequest<RawRecord>(`/jobs/${COLLECTION_NAME}/admin/stats`);
    if (res.data) {
      return mapRawStats(res.data);
    }
    throw new Error('Failed to load stats');
  },

  // 2. Providers Management
  async getAdminProviders(params?: {
    search?: string;
    status?: string;
    specialization?: string;
    city?: string;
    page?: number;
    size?: number;
  }): Promise<{ providers: ProviderItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.specialization && params.specialization !== 'all') query.set('specialization', params.specialization);
    if (params?.city && params.city !== 'all') query.set('city', params.city);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.size) query.set('size', params.size.toString());

    const qs = query.toString();
    const endpoint = `/jobs/${COLLECTION_NAME}/admin/providers${qs ? `?${qs}` : ''}`;
    const res = await apiRequest<{ providers?: RawRecord[]; pagination?: { total_items?: number } }>(endpoint);

    const list = res.data?.providers || [];
    const total = res.data?.pagination?.total_items || list.length;
    return {
      providers: list.map(mapRawProvider),
      total,
    };
  },

  async approveProvider(providerId: number): Promise<boolean> {
    await apiRequest(`/jobs/${COLLECTION_NAME}/admin/providers/${providerId}/approve`, {
      method: 'POST',
    });
    return true;
  },

  async rejectProvider(providerId: number, reason: string): Promise<boolean> {
    await apiRequest(`/jobs/${COLLECTION_NAME}/admin/providers/${providerId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return true;
  },

  async resetProviderVerification(providerId: number): Promise<boolean> {
    await apiRequest(`/jobs/${COLLECTION_NAME}/admin/providers/${providerId}/reset`, {
      method: 'POST',
    });
    return true;
  },

  // 3. Verification Queue
  async getPendingVerifications(): Promise<ProviderItem[]> {
    const res = await apiRequest<{ queue?: RawRecord[]; total_pending?: number }>(
      `/jobs/${COLLECTION_NAME}/admin/verifications/pending`
    );
    const list = res.data?.queue || [];
    return list.map(mapRawProvider);
  },

  // 4. Jobs Management
  async getAdminJobs(params?: {
    search?: string;
    status?: string;
    category?: string;
    page?: number;
    size?: number;
  }): Promise<{ jobs: JobItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.size) query.set('size', params.size.toString());

    const qs = query.toString();
    const endpoint = `/jobs/${COLLECTION_NAME}/admin/jobs${qs ? `?${qs}` : ''}`;
    const res = await apiRequest<{ jobs?: RawRecord[]; pagination?: { total_items?: number } }>(endpoint);

    const list = res.data?.jobs || [];
    const total = res.data?.pagination?.total_items || list.length;
    return {
      jobs: list.map(mapRawJob),
      total,
    };
  },

  async cancelJob(jobId: number, reason: string): Promise<boolean> {
    await apiRequest(`/jobs/${COLLECTION_NAME}/admin/jobs/${jobId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return true;
  },

  async getJobTimeline(jobId: number): Promise<TimelineStep[]> {
    const res = await apiRequest<{ timeline?: RawRecord[] }>(`/jobs/${COLLECTION_NAME}/jobs/${jobId}/timeline`);
    const list = res.data?.timeline || [];
    return list.map((t: RawRecord) => {
      const stepVal = String(t.step || 'POSTED') as TimelineStep['step'];
      const timestampStr = t.timestamp ? String(t.timestamp) : '';
      return {
        step: stepVal,
        title: String(t.title || 'Step'),
        timestamp: timestampStr ? new Date(timestampStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        actor: String(t.actor || 'System'),
        details: t.details ? String(t.details) : undefined,
      };
    });
  },

  // 5. Proposals Hub
  async getAdminProposals(params?: {
    status?: string;
    job_id?: number;
    provider_id?: number;
    page?: number;
    size?: number;
  }): Promise<{ proposals: ProposalItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.job_id) query.set('job_id', params.job_id.toString());
    if (params?.provider_id) query.set('provider_id', params.provider_id.toString());
    if (params?.page) query.set('page', params.page.toString());
    if (params?.size) query.set('size', params.size.toString());

    const qs = query.toString();
    const endpoint = `/jobs/${COLLECTION_NAME}/admin/proposals${qs ? `?${qs}` : ''}`;
    const res = await apiRequest<{ proposals?: RawRecord[]; pagination?: { total_items?: number } }>(endpoint);

    const list = res.data?.proposals || [];
    const total = res.data?.pagination?.total_items || list.length;
    return {
      proposals: list.map(mapRawProposal),
      total,
    };
  },

  // 6. Reviews & Moderation
  async getAdminReviews(params?: {
    min_rating?: number;
    provider_id?: number;
    page?: number;
    size?: number;
  }): Promise<{ reviews: ReviewItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.min_rating) query.set('min_rating', params.min_rating.toString());
    if (params?.provider_id) query.set('provider_id', params.provider_id.toString());
    if (params?.page) query.set('page', params.page.toString());
    if (params?.size) query.set('size', params.size.toString());

    const qs = query.toString();
    const endpoint = `/jobs/${COLLECTION_NAME}/admin/reviews${qs ? `?${qs}` : ''}`;
    const res = await apiRequest<{ reviews?: RawRecord[]; pagination?: { total_items?: number } }>(endpoint);

    const list = res.data?.reviews || [];
    const total = res.data?.pagination?.total_items || list.length;
    return {
      reviews: list.map(mapRawReview),
      total,
    };
  },

  async deleteReview(reviewId: number): Promise<boolean> {
    await apiRequest(`/jobs/${COLLECTION_NAME}/admin/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    return true;
  },

  // 7. Payments Ledger
  async getAdminPayments(params?: {
    status?: string;
    payment_method?: string;
    page?: number;
    size?: number;
  }): Promise<{ payments: PaymentItem[]; totalRevenue: number; total: number }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.payment_method && params.payment_method !== 'all') query.set('payment_method', params.payment_method);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.size) query.set('size', params.size.toString());

    const qs = query.toString();
    const endpoint = `/jobs/${COLLECTION_NAME}/admin/payments${qs ? `?${qs}` : ''}`;
    const res = await apiRequest<{ payments?: RawRecord[]; total_revenue?: number; pagination?: { total_items?: number } }>(endpoint);

    const list = res.data?.payments || [];
    const total = res.data?.pagination?.total_items || list.length;
    const totalRevenue = Number(res.data?.total_revenue || 0);

    return {
      payments: list.map(mapRawPayment),
      totalRevenue,
      total,
    };
  },
};
