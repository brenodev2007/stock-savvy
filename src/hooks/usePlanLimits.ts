import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useProfiles } from '@/hooks/useProfiles';

export interface PlanLimits {
  products: number;
  warehouses: number;
  users: number;
  hasShopeeIntegration: boolean;
  hasLots: boolean;
  hasApi: boolean;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    products: 100,
    warehouses: 1,
    users: 1,
    hasShopeeIntegration: false,
    hasLots: false,
    hasApi: false,
  },
  pro: {
    products: 1000,
    warehouses: 3,
    users: 5,
    hasShopeeIntegration: true,
    hasLots: true,
    hasApi: false,
  },
  business: {
    products: Infinity,
    warehouses: Infinity,
    users: Infinity,
    hasShopeeIntegration: true,
    hasLots: true,
    hasApi: true,
  },
};

export interface UsageInfo {
  current: number;
  limit: number;
  percentage: number;
  isAtLimit: boolean;
  isNearLimit: boolean; // 80% or more
  remaining: number;
}

export interface PlanUsage {
  products: UsageInfo;
  warehouses: UsageInfo;
  users: UsageInfo;
  limits: PlanLimits;
  planName: string;
}

function calculateUsage(current: number, limit: number): UsageInfo {
  const percentage = limit === Infinity ? 0 : Math.round((current / limit) * 100);
  return {
    current,
    limit,
    percentage: Math.min(percentage, 100),
    isAtLimit: limit !== Infinity && current >= limit,
    isNearLimit: limit !== Infinity && percentage >= 80,
    remaining: limit === Infinity ? Infinity : Math.max(0, limit - current),
  };
}

export function usePlanLimits(): PlanUsage & { isLoading: boolean } {
  const { profile } = useAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: warehouses, isLoading: warehousesLoading } = useWarehouses();
  const { data: users, isLoading: usersLoading } = useProfiles();

  const planName = profile?.plan || 'starter';
  const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.starter;

  const productCount = products?.length || 0;
  const warehouseCount = warehouses?.filter(w => w.is_active).length || 0;
  const userCount = users?.length || 0;

  const isLoading = productsLoading || warehousesLoading || usersLoading;

  return {
    products: calculateUsage(productCount, limits.products),
    warehouses: calculateUsage(warehouseCount, limits.warehouses),
    users: calculateUsage(userCount, limits.users),
    limits,
    planName,
    isLoading,
  };
}

export function useCanCreate(resource: 'products' | 'warehouses' | 'users'): {
  canCreate: boolean;
  message: string | null;
  usage: UsageInfo;
  isLoading: boolean;
} {
  const planUsage = usePlanLimits();
  const usage = planUsage[resource];

  if (planUsage.isLoading) {
    return {
      canCreate: false,
      message: null,
      usage,
      isLoading: true,
    };
  }

  if (usage.isAtLimit) {
    const resourceNames: Record<string, string> = {
      products: 'produtos',
      warehouses: 'armazéns',
      users: 'usuários',
    };
    return {
      canCreate: false,
      message: `Você atingiu o limite de ${usage.limit} ${resourceNames[resource]} do plano ${planUsage.planName.toUpperCase()}. Faça upgrade para continuar.`,
      usage,
      isLoading: false,
    };
  }

  return {
    canCreate: true,
    message: null,
    usage,
    isLoading: false,
  };
}

export function useFeatureAccess(feature: 'shopee' | 'lots' | 'api'): {
  hasAccess: boolean;
  planRequired: string;
} {
  const { limits, planName } = usePlanLimits();

  const featureMap: Record<string, keyof PlanLimits> = {
    shopee: 'hasShopeeIntegration',
    lots: 'hasLots',
    api: 'hasApi',
  };

  const hasAccess = limits[featureMap[feature]] as boolean;

  const requiredPlan = feature === 'api' ? 'Business' : 'Pro';

  return {
    hasAccess,
    planRequired: requiredPlan,
  };
}
