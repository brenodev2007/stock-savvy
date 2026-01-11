import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Lock, Zap } from 'lucide-react';
import { UsageInfo } from '@/hooks/usePlanLimits';
import { cn } from '@/lib/utils';

interface PlanLimitBannerProps {
  usage: UsageInfo;
  resourceName: string;
  className?: string;
}

export function PlanLimitBanner({ usage, resourceName, className }: PlanLimitBannerProps) {
  if (!usage.isNearLimit && !usage.isAtLimit) return null;

  const isUnlimited = usage.limit === Infinity;
  if (isUnlimited) return null;

  return (
    <Alert 
      variant={usage.isAtLimit ? 'destructive' : 'default'}
      className={cn(
        usage.isAtLimit 
          ? 'border-destructive/50 bg-destructive/10' 
          : 'border-warning/50 bg-warning/10',
        className
      )}
    >
      <AlertTriangle className={cn(
        'h-4 w-4',
        usage.isAtLimit ? 'text-destructive' : 'text-warning'
      )} />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex-1">
          <p className={cn(
            'font-medium',
            usage.isAtLimit ? 'text-destructive' : 'text-warning'
          )}>
            {usage.isAtLimit 
              ? `Limite de ${resourceName} atingido` 
              : `Você está próximo do limite de ${resourceName}`
            }
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Progress 
              value={usage.percentage} 
              className={cn(
                'h-2 w-32',
                usage.isAtLimit ? '[&>div]:bg-destructive' : '[&>div]:bg-warning'
              )}
            />
            <span className="text-sm text-muted-foreground">
              {usage.current} / {usage.limit} ({usage.percentage}%)
            </span>
          </div>
        </div>
        <Button asChild size="sm" variant={usage.isAtLimit ? 'default' : 'outline'}>
          <Link to="/plans" className="gap-2">
            <Zap className="h-4 w-4" />
            Fazer Upgrade
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}

interface FeatureLockedProps {
  featureName: string;
  planRequired: string;
  className?: string;
}

export function FeatureLocked({ featureName, planRequired, className }: FeatureLockedProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/30',
      className
    )}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Recurso Bloqueado</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        {featureName} está disponível apenas no plano <span className="font-semibold">{planRequired}</span> ou superior.
      </p>
      <Button asChild>
        <Link to="/plans" className="gap-2">
          <Zap className="h-4 w-4" />
          Ver Planos
        </Link>
      </Button>
    </div>
  );
}
