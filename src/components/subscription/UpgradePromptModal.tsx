import { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown,  X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
}

export function UpgradePromptModal({ open, onClose, feature, description }: UpgradePromptModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Recurso Exclusivo Pro
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {description || `O recurso "${feature}" está disponível apenas para assinantes do plano Pro.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Benefícios do Plano Pro
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>Produtos ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>Armazéns ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>Relatórios avançados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>Backup automático diário</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-bold">R$ 50,00</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <p className="text-sm text-primary font-medium">
              ✨ Experimente 14 dias grátis
            </p>
          </div>
        </div>

        <DialogFooter className="sm:flex-col gap-2">
          <Button onClick={handleUpgrade} className="w-full" size="lg">
            <Crown className="mr-2 h-4 w-4" />
            Fazer Upgrade para Pro
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full">
            Talvez mais tarde
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PlanFeatureGuardProps {
  children: ReactNode;
  requiresPro?: boolean;
  feature: string;
  onUpgradeClick?: () => void;
  showUpgradePrompt?: boolean;
}

export function PlanFeatureGuard({ 
  children, 
  requiresPro = true, 
  feature,
  onUpgradeClick,
  showUpgradePrompt = true
}: PlanFeatureGuardProps) {
  if (requiresPro) {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-50 blur-sm">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Button 
            onClick={onUpgradeClick} 
            className="shadow-lg"
            size="lg"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade para Pro
          </Button>
        </div>
        {showUpgradePrompt && (
          <div className="absolute top-2 right-2">
            <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Crown className="h-3 w-3" />
              PRO
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
