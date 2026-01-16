import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

type Resource = 'products' | 'warehouses';

export function useCanCreate(resource: Resource) {
  const { limits, isPro } = useSubscription();
  const navigate = useNavigate();

  // Se ainda está carregando, permite a criação
  if (!limits) {
    return {
      canCreate: true,
      message: null,
      usage: { current: 0, max: 999 },
      navigateToUpgrade: () => navigate('/subscription')
    };
  }

  // Usuários Pro têm acesso ilimitado
  if (isPro) {
    return {
      canCreate: true,
      message: null,
      usage: { 
        current: resource === 'products' ? limits.limits.products.current : limits.limits.warehouses.current,
        max: -1 
      },
      navigateToUpgrade: () => navigate('/subscription')
    };
  }

  // Verifica limites para usuários Basic
  if (resource === 'products') {
    const { current, max } = limits.limits.products;
    const canCreate = current < max;
    return {
      canCreate,
      message: canCreate 
        ? null 
        : `Você atingiu o limite de ${max} produtos do plano gratuito. Faça upgrade para o plano Pro para produtos ilimitados.`,
      usage: { current, max },
      navigateToUpgrade: () => navigate('/subscription')
    };
  }

  if (resource === 'warehouses') {
    const { current, max } = limits.limits.warehouses;
    const canCreate = current < max;
    return {
      canCreate,
      message: canCreate 
        ? null 
        : `Você atingiu o limite de ${max} armazéns do plano gratuito. Faça upgrade para o plano Pro para armazéns ilimitados.`,
      usage: { current, max },
      navigateToUpgrade: () => navigate('/subscription')
    };
  }

  return {
    canCreate: false,
    message: 'Recurso não reconhecido',
    usage: { current: 0, max: 0 },
    navigateToUpgrade: () => navigate('/subscription')
  };
}
