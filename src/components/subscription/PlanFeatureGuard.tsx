import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PlanFeatureGuardProps {
  children: ReactNode;
  feature?: 'advanced_reports' | 'unlimited_products' | 'unlimited_warehouses';
  showUpgradeButton?: boolean;
  blur?: boolean;
}

export function PlanFeatureGuard({ 
  children, 
  feature,
  showUpgradeButton = true,
  blur = false
}: PlanFeatureGuardProps) {
  const { isPro, limits } = useSubscription();
  const navigate = useNavigate();

  // Check if user has access to the feature
  const hasAccess = () => {
    if (isPro) return true;
    
    if (!feature) return true;
    
    if (feature === 'advanced_reports') {
      return limits?.limits.features.advanced_reports || false;
    }
    
    return false;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {blur && (
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
      )}
      
      <div className={blur ? "absolute inset-0 flex items-center justify-center" : ""}>
        <div className="bg-background/95 backdrop-blur-sm rounded-lg border-2 border-primary/20 p-6 text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Recurso Exclusivo Pro</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Este recurso está disponível apenas para assinantes do plano Pro.
          </p>
          
          {showUpgradeButton && (
            <Button 
              onClick={() => navigate('/subscription')}
              className="gap-2"
            >
              <Crown className="h-4 w-4" />
              Fazer Upgrade
            </Button>
          )}
        </div>
      </div>
      
      {!blur && (
        <div className="hidden">
          {children}
        </div>
      )}
    </div>
  );
}

interface ProBadgeProps {
  tooltip?: string;
}

export function ProBadge({ tooltip = "Recurso exclusivo do plano Pro" }: ProBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
          <Crown className="h-3 w-3" />
          PRO
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface LockedFeatureButtonProps {
  onClick?: () => void;
  children: ReactNode;
  tooltip?: string;
}

export function LockedFeatureButton({ 
  onClick, 
  children,
  tooltip = "Recurso exclusivo do plano Pro" 
}: LockedFeatureButtonProps) {
  const { isPro } = useSubscription();
  const navigate = useNavigate();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative inline-block">
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={onClick || (() => navigate('/subscription'))}
          >
            <div className="bg-background/90 rounded-full p-2 border-2 border-primary">
              <Lock className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
