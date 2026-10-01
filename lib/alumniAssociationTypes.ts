export interface CommitteeMember {
  id: string;
  name: string;
  designation: string; // e.g. President, General Secretary, Chief Advisor
  batch: string;
  department: string;
  currentProfession: string;
  organization: string;
  photoUrl: string;
  wing?: string;
  email?: string;
  phone?: string;
  bio?: string;
  order: number;
}

export interface AssociationWing {
  id: string;
  name: string;
  leadName: string;
  leadDesignation: string;
  leadPhoto: string;
  description: string;
  stats: {
    label: string;
    value: string;
  }[];
  activities: string[];
}

export interface GlobalChapter {
  id: string;
  city: string;
  country: string;
  flag: string;
  coordinatorName: string;
  coordinatorContact: string;
  membersCount: number;
  establishedYear: number;
  recentActivity: string;
}

export interface WelfareProject {
  id: string;
  title: string;
  category: 'scholarship' | 'medical' | 'research_grant' | 'emergency';
  targetAmount: number;
  raisedAmount: number;
  beneficiariesCount: number;
  description: string;
  status: 'active' | 'completed';
}

export interface MembershipTier {
  id: string;
  name: string;
  subtitle: string;
  fee: string;
  validity: string;
  benefits: string[];
  recommended?: boolean;
}

// Zero dummy members or chapters: real association data is synchronized from Firebase
export const INITIAL_ADVISORS: CommitteeMember[] = [];
export const INITIAL_EXECUTIVE_COMMITTEE: CommitteeMember[] = [];
export const INITIAL_ASSOCIATION_WINGS: AssociationWing[] = [];
export const INITIAL_GLOBAL_CHAPTERS: GlobalChapter[] = [];

export const INITIAL_MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'general',
    name: 'General Membership',
    subtitle: 'Open to all valid graduates of the institute',
    fee: 'Free / Annual Registration',
    validity: '1 Year (Renewable)',
    benefits: [
      'Official Digital Alumni Smart ID Card',
      'Opportunity to participate in annual reunion and seminars',
      'Access to Alumni Job Portal & Career Notices',
      'Publish own profile in general directory'
    ],
    recommended: false
  },
  {
    id: 'life',
    name: 'Lifetime Membership',
    subtitle: 'Permanent partner in long-term commitment and institutional development',
    fee: 'BDT 10,000 (One-time donation)',
    validity: 'Lifetime',
    benefits: [
      'Golden Metallic Smart Digital & Physical ID Card',
      'Voting rights and candidacy in central executive elections',
      '24/7 free access to the institute\'s library and research database',
      'Name inclusion as distinguished Lifetime Member in annual publications',
      'International Chapter event & VIP Lounge Access'
    ],
    recommended: true
  },
  {
    id: 'patron',
    name: 'Donor / Patron Membership',
    subtitle: 'One of the patrons of Alumni Welfare Fund and Research Scholarship',
    fee: 'BDT 50,000+ (One-time or Annual)',
    validity: 'Lifetime Honor',
    benefits: [
      'Honorary Patron Crest & Special Certificate',
      'Invitation to Academic Board & Advisory Council',
      'Opportunity to award named scholarships in special scholarship funding',
      'VIP seating at all international conferences of the institute'
    ],
    recommended: false
  }
];
