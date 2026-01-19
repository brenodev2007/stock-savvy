import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFailure() {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden text-center p-12">
          {/* Ícone de erro */}
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pagamento não aprovado
          </h1>

          {/* Descrição */}
          <p className="text-xl text-gray-600 mb-8">
            Não foi possível processar seu pagamento
          </p>

          {/* Motivos possíveis */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Possíveis motivos:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Cartão sem saldo ou limite disponível</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Dados do cartão incorretos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Cartão bloqueado ou vencido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Problema temporário com o processador de pagamentos</span>
              </li>
            </ul>
          </div>

          {/* Informação de teste */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica para testes:</strong> Use o cartão de teste do Mercado Pago
              <br />
              <span className="text-xs">
                Número: 5031 7557 3453 0604 | Nome: APRO | CVV: 123
              </span>
            </p>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTryAgain}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="h-6 w-6" />
              <span>Tentar novamente</span>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <ArrowLeft className="h-6 w-6" />
              <span>Voltar</span>
            </button>
          </div>

          {/* Suporte */}
          <p className="text-sm text-gray-500 mt-8">
            Precisa de ajuda? Entre em contato com nosso suporte
          </p>
        </div>
      </div>
    </div>
  );
}
