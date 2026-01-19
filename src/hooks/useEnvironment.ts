import { useState, useEffect } from 'react';
import api from '@/lib/api';

export type Environment = 'development' | 'production';

interface EnvironmentStatus {
  environment: Environment;
  isSandbox: boolean;
}

/**
 * Hook para detectar o ambiente do Mercado Pago (sandbox ou produção)
 */
export function useEnvironment() {
  const [env, setEnv] = useState<EnvironmentStatus>({
    environment: 'development',
    isSandbox: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        // Podemos verificar o ambiente através de uma chamada à API
        // ou armazenar localmente
        const savedEnv = localStorage.getItem('mp_environment');
        if (savedEnv) {
          setEnv(JSON.parse(savedEnv));
        }
      } catch (error) {
        console.error('Erro ao verificar ambiente:', error);
      } finally {
        setLoading(false);
      }
    };

    checkEnvironment();
  }, []);

  const updateEnvironment = (environment: Environment, isSandbox: boolean) => {
    const newEnv = { environment, isSandbox };
    setEnv(newEnv);
    localStorage.setItem('mp_environment', JSON.stringify(newEnv));
  };

  return {
    ...env,
    loading,
    updateEnvironment
  };
}
