export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'creator' | 'business' | 'admin' | 'super_admin';
  avatar_url?: string;
  phone?: string;
  location?: string;
  bio?: string;
  verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface Campaign {
  id: string;
  business_id: string;
  business_name: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  deliverables: string[];
  requirements: string;
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  application_count: number;
  collaboration_count: number;
  created_at: string;
  updated_at: string;
  deadline?: string;
}

export interface Collaboration {
  id: string;
  campaign_id: string;
  campaign_title: string;
  creator_id: string;
  creator_name: string;
  business_id: string;
  business_name: string;
  status: 'applied' | 'accepted' | 'in_progress' | 'delivered' | 'revision_requested' | 'completed' | 'cancelled' | 'disputed';
  agreed_amount: number;
  escrow_amount: number;
  escrow_status: 'held' | 'released' | 'refunded' | 'partial';
  platform_fee: number;
  creator_earnings: number;
  deliverables: Deliverable[];
  revisions_remaining: number;
  created_at: string;
  updated_at: string;
  deadline?: string;
}

export interface Deliverable {
  id: string;
  collaboration_id: string;
  type: string;
  description: string;
  url: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'revision_requested';
  feedback?: string;
}

export interface Payment {
  id: string;
  collaboration_id: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  currency: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  type: 'escrow_deposit' | 'escrow_release' | 'platform_fee' | 'refund';
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  id: string;
  collaboration_id: string;
  collaboration_title: string;
  raised_by_user_id: string;
  raised_by_user_name: string;
  raised_by_user_role: 'creator' | 'business';
  category: 'quality' | 'deadline' | 'scope' | 'payment' | 'communication' | 'other';
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_admin_id?: string;
  assigned_admin_name?: string;
  resolution?: string;
  resolution_type?: 'full_refund' | 'full_payout' | 'partial_split' | 'no_action';
  escrow_amount: number;
  platform_fee: number;
  evidence: DisputeEvidence[];
  chat_logs: ChatMessage[];
  timeline: DisputeEvent[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface DisputeEvidence {
  id: string;
  dispute_id: string;
  submitted_by_user_id: string;
  submitted_by_user_name: string;
  type: 'text' | 'image' | 'document' | 'link';
  content: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  dispute_id: string;
  collaboration_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'creator' | 'business';
  message: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
}

export interface DisputeEvent {
  id: string;
  dispute_id: string;
  event_type: string;
  description: string;
  performed_by_user_id?: string;
  performed_by_user_name?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Review {
  id: string;
  collaboration_id: string;
  collaboration_title: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_role: 'creator' | 'business';
  reviewee_id: string;
  reviewee_name: string;
  rating: number;
  comment: string;
  categories: Record<string, number>;
  flagged: boolean;
  flag_reason?: string;
  flagged_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationItem {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_type: 'creator' | 'business';
  status: 'pending' | 'approved' | 'rejected' | 'more_info_required';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by_user_id?: string;
  documents: VerificationDocument[];
  business_info?: BusinessVerificationInfo;
  creator_info?: CreatorVerificationInfo;
  admin_notes?: string;
}

export interface VerificationDocument {
  id: string;
  verification_id: string;
  type: string;
  name: string;
  url: string;
  uploaded_at: string;
}

export interface BusinessVerificationInfo {
  company_name: string;
  registration_number: string;
  gst_number?: string;
  industry: string;
  website?: string;
  employee_count?: string;
}

export interface CreatorVerificationInfo {
  niche: string;
  platform_handles: string[];
  follower_count?: number;
  engagement_rate?: number;
  portfolio_url?: string;
}

export interface PlatformMetrics {
  total_gmv: number;
  gmv_trend: GmvDataPoint[];
  total_revenue: number;
  revenue_trend: RevenueDataPoint[];
  active_escrow: number;
  commission_collected: number;
  dispute_rate: number;
  total_creators: number;
  total_businesses: number;
  completion_rate: number;
  escrow_status: EscrowBreakdown;
  campaign_completion_rates: CampaignCompletionDataPoint[];
}

export interface GmvDataPoint {
  month: string;
  gmv: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
}

export interface EscrowBreakdown {
  held: number;
  released: number;
  refunded: number;
}

export interface CampaignCompletionDataPoint {
  month: string;
  rate: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface DashboardStats {
  kpis: {
    gmv: { value: number; change: number };
    activeEscrow: { value: number; change: number };
    commissionCollected: { value: number; change: number };
    disputeRate: { value: number; change: number };
    totalCreators: { value: number; change: number };
    totalBusinesses: { value: number; change: number };
    completionRate: { value: number; change: number };
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'campaign_created' | 'collaboration_started' | 'payment_made' | 'dispute_opened' | 'user_signed_up' | 'verification_submitted';
  description: string;
  user_name: string;
  created_at: string;
}

export interface FilterState {
  search: string;
  status?: string;
  role?: string;
  category?: string;
  priority?: string;
  date_from?: string;
  date_to?: string;
  page: number;
  limit: number;
}

export interface Settings {
  platform_commission_rate: number;
  auto_approve_days: number;
  default_max_revisions: number;
  payment_provider: 'razorpay' | 'stripe';
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
  stripe_publishable_key?: string;
  stripe_secret_key?: string;
  webhook_url?: string;
  min_withdrawal_amount: number;
  escrow_hold_days: number;
}
