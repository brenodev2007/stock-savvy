import { useAuth } from '@/hooks/useAuth';

export interface PlanLimits {
  products: number;
  warehouses: number;
  users: number;
  hasShopeeIntegration: boolean;
  hasLots: boolean;
  hasApi: boolean;
}

const UNLIMITED_LIMITS: PlanLimits = {
  products: Infinity,
  warehouses: Infinity,
  users: Infinity,
  hasShopeeIntegration: true,
  hasLots: true,
  hasApi: true,
};

export interface UsageInfo {
  current: number;
  limit: number;
  percentage: number;
  isAtLimit: boolean;
  isNearLimit: boolean;
  remaining: number;
}

export interface PlanUsage {
  products: UsageInfo;
  warehouses: UsageInfo;
  users: UsageInfo;
  limits: PlanLimits;
  planName: string;
}

const UNLIMITED_USAGE: UsageInfo = {
  current: 0,
  limit: Infinity,
  percentage: 0,
  isAtLimit: false,
  isNearLimit: false,
  remaining: Infinity,
};

export function usePlanLimits(): PlanUsage & { isLoading: boolean } {
  return {
    products: UNLIMITED_USAGE,
    warehouses: UNLIMITED_USAGE,
    users: UNLIMITED_USAGE,
    limits: UNLIMITED_LIMITS,
    planName: 'unlimited',
    isLoading: false,
  };
}

export function useCanCreate(resource: 'products' | 'warehouses' | 'users'): {
  canCreate: boolean;
  message: string | null;
  usage: UsageInfo;
  isLoading: boolean;
} {
  return {
    canCreate: true,
    message: null,
    usage: UNLIMITED_USAGE,
    isLoading: false,
  };
}

export function useFeatureAccess(feature: 'shopee' | 'lots' | 'api'): {
  hasAccess: boolean;
  planRequired: string;
} {
  return {
    hasAccess: true,
    planRequired: '',
  };
}
