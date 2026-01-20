import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);
  const [countdown, setCountdown] = useState(5);

  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    // Para o confetti depois de 5 segundos
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    // Countdown para redirecionamento
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          navigate('/settings?tab=subscription');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(confettiTimer);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center p-6">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden text-center p-12">
          {/* Ícone de sucesso */}
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Pagamento Aprovado!
          </h1>

          {/* Descrição */}
          <p className="text-xl text-gray-600 mb-8">
            Bem-vindo ao <span className="font-bold text-green-600">Estoka Pro</span>!
          </p>

          {/* Informações */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-3">
            <p className="text-gray-700">
              Seu período de <span className="font-bold">14 dias grátis</span> começou agora
            </p>
            <p className="text-sm text-gray-500">
              Você tem acesso completo a todos os recursos premium
            </p>
            {paymentId && (
              <p className="text-xs text-gray-400 mt-4">
                ID do pagamento: {paymentId}
              </p>
            )}
          </div>

          {/* Próximos passos */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Próximos passos:</h3>
            <ul className="text-left space-y-2 max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Configure seus armazéns e produtos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Conecte sua conta Shopee</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Explore os relatórios financeiros</span>
              </li>
            </ul>
          </div>

          {/* Botão */}
          <button
            onClick={() => navigate('/settings?tab=subscription')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mx-auto"
          >
            <span>Ir para minha conta</span>
            <ArrowRight className="h-6 w-6" />
          </button>

          {/* Countdown */}
          <p className="text-sm text-gray-500 mt-6">
            Redirecionando em {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    </div>
  );
}
