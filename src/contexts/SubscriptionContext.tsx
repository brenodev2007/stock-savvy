import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { UpgradePromptModal } from '@/components/subscription/UpgradePromptModal';

export interface SubscriptionData {
  id?: string;
  plan: 'basic' | 'pro';
  status: 'inactive' | 'active' | 'trial' | 'cancelled' | 'paused';
  is_pro: boolean;
  amount?: number;
  currency?: string;
  billing_cycle?: string;
  trial_start?: string;
  trial_end?: string;
  next_billing_date?: string;
  subscription_start?: string;
  subscription_end?: string;
}

export interface PlanLimits {
  plan: 'basic' | 'pro';
  is_pro: boolean;
  limits: {
    products: {
      current: number;
      max: number;
      unlimited: boolean;
    };
    warehouses: {
      current: number;
      max: number;
      unlimited: boolean;
    };
    features: {
      advanced_reports: boolean;
      priority_support: boolean;
    };
  };
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  limits: PlanLimits | null;
  loading: boolean;
  isPro: boolean;
  canCreateProduct: boolean;
  canCreateWarehouse: boolean;
  hasAdvancedReports: boolean;
  refreshSubscription: () => Promise<void>;
  upgradePrompt: (feature: string) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFeature, setModalFeature] = useState('');
  const [modalDescription, setModalDescription] = useState('');

  const fetchSubscription = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const [subResponse, limitsResponse] = await Promise.all([
        api.get('/subscription/status'),
        api.get('/subscription/limits')
      ]);

      setSubscription(subResponse.data);
      setLimits(limitsResponse.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Set default values for non-subscribed users
      setSubscription({
        plan: 'basic',
        status: 'inactive',
        is_pro: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleUpgradeRequired = (event: Event) => {
      const customEvent = event as CustomEvent;
      setModalFeature('Limite Atingido');
      setModalDescription(customEvent.detail?.message || 'Faça upgrade para acessar este recurso.');
      setModalOpen(true);
    };

    window.addEventListener('upgrade-required', handleUpgradeRequired);

    if (user) {
      fetchSubscription();
    } else {
      setLoading(false);
    }

    return () => {
      window.removeEventListener('upgrade-required', handleUpgradeRequired);
    };
  }, [user]);

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const upgradePrompt = (feature: string) => {
    setModalFeature(feature);
    setModalDescription('');
    setModalOpen(true);
  };

  const isPro = subscription?.is_pro && ['active', 'trial'].includes(subscription?.status || '');
  
  const canCreateProduct = isPro || (limits?.limits.products.current || 0) < (limits?.limits.products.max || 0);
  
  const canCreateWarehouse = isPro || (limits?.limits.warehouses.current || 0) < (limits?.limits.warehouses.max || 0);
  
  const hasAdvancedReports = limits?.limits.features.advanced_reports || false;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        limits,
        loading,
        isPro,
        canCreateProduct,
        canCreateWarehouse,
        hasAdvancedReports,
        refreshSubscription,
        upgradePrompt,
      }}
    >
      {children}
      <UpgradePromptModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        feature={modalFeature} 
        description={modalDescription}
      />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
