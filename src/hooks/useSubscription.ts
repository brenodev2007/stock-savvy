
import { useCallback } from 'react';

export const STRIPE_PLANS = {
  pro: {
    priceId: '',
    productId: '',
    name: 'Pro',
    price: 0,
  },
  business: {
    priceId: '',
    productId: '',
    name: 'Business',
    price: 0,
  },
} as const;

export function useSubscription() {
  const checkSubscription = useCallback(async () => {}, []);
  const createCheckout = useCallback(async () => {}, []);
  const openCustomerPortal = useCallback(async () => {}, []);

  return {
    subscribed: true,
    plan: 'business',
    subscriptionEnd: null,
    isLoading: false,
    isCheckoutLoading: false,
    isPortalLoading: false,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
}
