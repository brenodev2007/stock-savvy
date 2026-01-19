import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { EnvironmentBadge } from '@/components/ui/environment-badge';

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [environment, setEnvironment] = useState<'development' | 'production'>('development');

  useEffect(() => {
    // Busca informações do usuário
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/auth/me');
        setUserInfo(response.data);
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payments/create', {
        plan: 'pro',
        amount: 10.00
      });

      if (response.data.success && response.data.checkout_url) {
        // Captura o ambiente da resposta
        if (response.data.environment) {
          setEnvironment(response.data.environment);
          localStorage.setItem('mp_environment', JSON.stringify({
            environment: response.data.environment,
            isSandbox: response.data.sandbox
          }));
        }
        
        // Redireciona para o checkout do Mercado Pago
        window.location.href = response.data.checkout_url;
      } else {
        toast.error('Erro ao criar pagamento');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Erro ao criar checkout:', error);
      toast.error(error.response?.data?.error || 'Erro ao processar pagamento');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-12 w-12" />
                <div>
                  <h1 className="text-3xl font-bold">Stock Savvy Pro</h1>
                  <p className="text-blue-100 text-sm">Gestão profissional de estoque</p>
                </div>
              </div>
              <EnvironmentBadge environment={environment} className="bg-white/20 border-white/40" />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-8">
            {/* Preço */}
            <div className="mb-8">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-900">R$ 10,00</span>
                <span className="text-gray-500 text-lg">/mês</span>
              </div>
              <p className="text-gray-600">Cobrança mensal recorrente</p>
            </div>

            {/* Benefícios */}
            <div className="space-y-4 mb-8">
              <h3 className="font-semibold text-gray-900 text-lg">O que está incluído:</h3>
              <ul className="space-y-3">
                {[
                  'Produtos ilimitados',
                  'Múltiplos armazéns',
                  'Integração com Shopee',
                  'Relatórios financeiros completos',
                  'Controle de estoque em tempo real',
                  'Suporte prioritário'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informações do usuário */}
            {userInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Conta:</p>
                <p className="font-semibold text-gray-900">{userInfo.email}</p>
                {userInfo.name && (
                  <p className="text-gray-700">{userInfo.name}</p>
                )}
              </div>
            )}

            {/* Botão de pagamento */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>Assinar com Mercado Pago</span>
                  <ArrowRight className="h-6 w-6" />
                </>
              )}
            </button>

            {/* Informações adicionais */}
            <div className="mt-6 space-y-2 text-center">
              <p className="text-sm text-gray-500">
                🔒 Pagamento seguro via Mercado Pago
              </p>
              <p className="text-sm text-gray-500">
                Cancele quando quiser, sem taxas adicionais
              </p>
            </div>

            {/* Link para voltar */}
            <button
              onClick={() => navigate('/settings')}
              className="w-full mt-4 text-gray-600 hover:text-gray-900 transition-colors py-2"
            >
              Voltar para configurações
            </button>
          </div>
        </div>

        {/* Nota sobre teste */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            💳 Ambiente de testes - Use cartões de teste do Mercado Pago
          </p>
        </div>
      </div>
    </div>
  );
}
