import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Info } from 'lucide-react';

export default function PaymentPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-800 to-orange-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden text-center p-12">
          {/* Ícone de pendente */}
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full">
            <Clock className="h-16 w-16 text-yellow-600 animate-pulse" />
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pagamento Pendente
          </h1>

          {/* Descrição */}
          <p className="text-xl text-gray-600 mb-8">
            Estamos processando seu pagamento
          </p>

          {/* Informações */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Info className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">O que significa?</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Seu pagamento está aguardando confirmação do banco ou do método de pagamento escolhido.
                </p>
                <p className="text-gray-700 text-sm">
                  Este processo pode levar algumas horas ou até 2 dias úteis, dependendo do meio de pagamento.
                </p>
              </div>
            </div>
          </div>

          {/* Próximos passos */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Próximos passos:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 text-xl">•</span>
                <span>Você receberá um e-mail assim que o pagamento for confirmado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 text-xl">•</span>
                <span>Acompanhe o status na aba "Assinatura" das configurações</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 text-xl">•</span>
                <span>Seu acesso Pro será ativado automaticamente após a confirmação</span>
              </li>
            </ul>
          </div>

          {/* Métodos que podem ficar pendentes */}
          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              <strong>Métodos que podem ficar pendentes:</strong>
              <br />
              Boleto, PIX, Débito online, ou pagamentos parcelados em várias vezes
            </p>
          </div>

          {/* Botão */}
          <button
            onClick={() => navigate('/settings?tab=subscription')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mx-auto"
          >
            <span>Ir para configurações</span>
            <ArrowRight className="h-6 w-6" />
          </button>

          {/* Info adicional */}
          <p className="text-sm text-gray-500 mt-6">
            Se tiver dúvidas, entre em contato com nosso suporte
          </p>
        </div>
      </div>
    </div>
  );
}
