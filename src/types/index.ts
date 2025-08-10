export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'basic' | 'pro';
  apiCallsUsed: number;
  apiCallsLimit: number;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  createdAt: string;
  isAdmin?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  apiCallsLimit: number;
  hasStreamlitAccess: boolean;
}

export interface ApiUsage {
  userId: string;
  date: string;
  apiCalls: number;
  storageUsed: number;
}

export interface ModelGeneration {
  id: string;
  userId: string;
  prompt: string;
  code: string;
  modelType: 'classification' | 'regression' | 'clustering' | 'other';
  createdAt: string;
  isStreamlitGenerated?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserPlan: (plan: 'free' | 'basic' | 'pro') => void;
  refreshUserProfile: () => Promise<void>;
}