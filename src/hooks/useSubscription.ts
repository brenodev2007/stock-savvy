import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const STRIPE_PLANS = {
  pro: {
    priceId: 'price_1SoEpQAOXXZmhRMOjlcR0dYu',
    productId: 'prod_TlmOAq3YNgQ51A',
    name: 'Pro',
    price: 97,
  },
  business: {
    priceId: 'price_1SoEppAOXXZmhRMO0kTpWsu5',
    productId: 'prod_TlmODSJUiDaoSD',
    name: 'Business',
    price: 297,
  },
} as const;

interface SubscriptionState {
  subscribed: boolean;
  plan: string;
  subscriptionEnd: string | null;
  isLoading: boolean;
}

export function useSubscription() {
  const { session, refreshProfile } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    plan: 'starter',
    subscriptionEnd: null,
    isLoading: false,
  });
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!session) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setState({
        subscribed: data.subscribed || false,
        plan: data.plan || 'starter',
        subscriptionEnd: data.subscription_end || null,
        isLoading: false,
      });

      // Refresh profile to get updated plan
      await refreshProfile();
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [session, refreshProfile]);

  const createCheckout = useCallback(async (planId: 'pro' | 'business') => {
    if (!session) {
      toast.error('Você precisa estar logado para assinar um plano');
      return;
    }

    const plan = STRIPE_PLANS[planId];
    if (!plan) {
      toast.error('Plano inválido');
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.priceId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao criar checkout: ' + error.message);
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [session]);

  const openCustomerPortal = useCallback(async () => {
    if (!session) {
      toast.error('Você precisa estar logado para gerenciar sua assinatura');
      return;
    }

    setIsPortalLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL do portal não recebida');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast.error('Erro ao abrir portal: ' + error.message);
    } finally {
      setIsPortalLoading(false);
    }
  }, [session]);

  return {
    ...state,
    isCheckoutLoading,
    isPortalLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
}
